import { NextRequest, NextResponse } from "next/server";
import {
  ASSISTANT_INSTRUCTIONS,
  buildAssistantPrompt,
  createSmartFallback,
  getAssistantLinks,
  selectAssistantProducts,
} from "@/lib/aiAssistant";
import type { AssistantMessageInput } from "@/types/ai-assistant";

export const runtime = "nodejs";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const requestLog = new Map<string, number[]>();

type OpenAIContent = { type?: string; text?: string };
type OpenAIOutput = { type?: string; content?: OpenAIContent[] };
type OpenAIResponse = { output?: OpenAIOutput[] };
type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};
type GroqResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

type AIProvider = "gemini" | "groq" | "openai";

function isRateLimited(clientId: string) {
  const now = Date.now();
  const recent = (requestLog.get(clientId) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  requestLog.set(clientId, recent);
  return recent.length > MAX_REQUESTS_PER_WINDOW;
}

function sanitizeMessages(value: unknown): AssistantMessageInput[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 12) return null;

  const messages: AssistantMessageInput[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const role = "role" in item ? item.role : undefined;
    const content = "content" in item ? item.content : undefined;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;

    const trimmed = content.trim().slice(0, 600);
    if (!trimmed) return null;
    messages.push({ role, content: trimmed });
  }

  if (messages.at(-1)?.role !== "user") return null;
  return messages;
}

function extractResponseText(data: OpenAIResponse) {
  return (data.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((content) => content.type === "output_text" && typeof content.text === "string")
    .map((content) => content.text?.trim())
    .filter((text): text is string => Boolean(text))
    .join("\n");
}

async function askOpenAI(messages: AssistantMessageInput[], prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL?.trim() || "gpt-5.6-luna",
      instructions: ASSISTANT_INSTRUCTIONS,
      input: prompt,
      reasoning: { effort: "low" },
      text: { verbosity: "low" },
      max_output_tokens: 500,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) throw new Error(`OpenAI request failed with ${response.status}`);
  const text = extractResponseText((await response.json()) as OpenAIResponse);
  return text || createSmartFallback(messages, selectAssistantProducts(messages));
}

async function askGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: ASSISTANT_INSTRUCTIONS }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 500,
        },
      }),
      signal: AbortSignal.timeout(20_000),
    },
  );

  if (!response.ok) throw new Error(`Gemini request failed with ${response.status}`);
  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text?.trim())
    .filter((part): part is string => Boolean(part))
    .join("\n");
  return text || null;
}

async function askGroq(prompt: string) {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return null;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: ASSISTANT_INSTRUCTIONS },
        { role: "user", content: prompt },
      ],
      temperature: 0.35,
      max_completion_tokens: 500,
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) throw new Error(`Groq request failed with ${response.status}`);
  const data = (await response.json()) as GroqResponse;
  return data.choices?.[0]?.message?.content?.trim() || null;
}

function getConfiguredProviders(): AIProvider[] {
  const selected = process.env.AI_PROVIDER?.trim().toLowerCase() || "auto";
  if (selected === "gemini" || selected === "groq" || selected === "openai") {
    return [selected];
  }

  return ["gemini", "groq", "openai"];
}

async function askConfiguredAI(messages: AssistantMessageInput[], prompt: string) {
  for (const provider of getConfiguredProviders()) {
    try {
      const message = provider === "gemini"
        ? await askGemini(prompt)
        : provider === "groq"
          ? await askGroq(prompt)
          : await askOpenAI(messages, prompt);

      if (message) return message;
    } catch (error) {
      console.warn(
        `${provider} assistant request failed`,
        error instanceof Error ? error.message : "unknown",
      );
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 20_000) {
    return NextResponse.json({ message: "Nội dung hội thoại quá dài." }, { status: 413 });
  }

  const clientId = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (isRateLimited(clientId)) {
    return NextResponse.json(
      { message: "Bạn gửi hơi nhanh. Vui lòng chờ một chút rồi thử lại." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const rawMessages =
    payload && typeof payload === "object" && "messages" in payload ? payload.messages : undefined;
  const messages = sanitizeMessages(rawMessages);
  if (!messages) {
    return NextResponse.json({ message: "Hội thoại không hợp lệ." }, { status: 400 });
  }

  const products = selectAssistantProducts(messages);
  const links = getAssistantLinks(messages);
  const fallback = createSmartFallback(messages, products);

  try {
    const aiMessage = await askConfiguredAI(messages, buildAssistantPrompt(messages, products));
    return NextResponse.json({
      message: aiMessage ?? fallback,
      products,
      links,
      mode: aiMessage ? "ai" : "smart-fallback",
    });
  } catch (error) {
    console.warn("AI assistant switched to local fallback", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ message: fallback, products, links, mode: "smart-fallback" });
  }
}
