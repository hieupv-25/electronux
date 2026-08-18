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
    const aiMessage = await askOpenAI(messages, buildAssistantPrompt(messages, products));
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
