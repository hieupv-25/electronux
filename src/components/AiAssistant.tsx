"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import styles from "./AiAssistant.module.css";
import type {
  AssistantApiResponse,
  AssistantLink,
  AssistantMessageInput,
  AssistantProduct,
  AssistantRole,
} from "@/types/ai-assistant";

type ChatMessage = {
  id: string;
  role: AssistantRole;
  content: string;
  products?: AssistantProduct[];
  links?: AssistantLink[];
};

const STORAGE_KEY = "electronux-elli-conversation-v1";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Chào bạn, mình là Elli 👋 Mình có thể giúp chọn thiết bị theo nhu cầu và ngân sách, so sánh sản phẩm hoặc hỗ trợ bảo hành – sửa chữa.",
};

const STARTER_PROMPTS = [
  "Tư vấn máy giặt cho gia đình 4 người",
  "Tìm sản phẩm dưới 10 triệu",
  "Tôi cần đặt lịch bảo hành",
];

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

function toApiMessages(messages: ChatMessage[]): AssistantMessageInput[] {
  return messages.slice(-11).map(({ role, content }) => ({ role, content }));
}

function loadStoredMessages() {
  if (typeof window === "undefined") return [WELCOME_MESSAGE];

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [WELCOME_MESSAGE];
    const parsed = JSON.parse(stored) as ChatMessage[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed.slice(-20) : [WELCOME_MESSAGE];
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [WELCOME_MESSAGE];
  }
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadStoredMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)));
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;
    window.setTimeout(() => inputRef.current?.focus(), 120);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages, isLoading]);

  useEffect(() => {
    const openAssistant = () => setIsOpen(true);
    window.addEventListener("open-ai-assistant", openAssistant);
    return () => window.removeEventListener("open-ai-assistant", openAssistant);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  async function sendMessage(rawText: string) {
    const content = rawText.trim().slice(0, 500);
    if (!content || isLoading) return;

    const userMessage: ChatMessage = { id: createMessageId(), role: "user", content };
    const conversation = [...messages, userMessage];
    setMessages(conversation);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toApiMessages(conversation) }),
      });

      const data = (await response.json()) as Partial<AssistantApiResponse>;
      if (!response.ok || !data.message) {
        throw new Error(data.message || "Không thể nhận phản hồi");
      }

      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content: data.message as string,
          products: data.products ?? [],
          links: data.links ?? [],
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content:
            "Mình đang gặp sự cố kết nối. Bạn thử gửi lại sau một chút, hoặc vào Trung tâm hỗ trợ nếu cần xử lý gấp nhé.",
          links: [{ label: "Trung tâm hỗ trợ", href: "/support" }],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function resetConversation() {
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    window.localStorage.removeItem(STORAGE_KEY);
    inputRef.current?.focus();
  }

  return (
    <div className={styles.root}>
      {isOpen && (
        <section className={styles.panel} role="dialog" aria-modal="false" aria-label="Trợ lý Elli">
          <header className={styles.header}>
            <div className={styles.avatar} aria-hidden="true">
              <span>E</span>
              <i />
            </div>
            <div className={styles.heading}>
              <strong>Elli</strong>
              <span><i /> Trợ lý mua sắm thông minh</span>
            </div>
            <button
              type="button"
              className={styles.headerButton}
              onClick={resetConversation}
              aria-label="Bắt đầu cuộc trò chuyện mới"
              title="Cuộc trò chuyện mới"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v5h5" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.headerButton}
              onClick={() => setIsOpen(false)}
              aria-label="Đóng trợ lý"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </header>

          <div className={styles.messages} aria-live="polite" aria-busy={isLoading}>
            <div className={styles.today}>Hôm nay</div>
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`${styles.messageRow} ${message.role === "user" ? styles.userRow : ""}`}
              >
                {message.role === "assistant" && (
                  <div className={styles.smallAvatar} aria-hidden="true">E</div>
                )}
                <div className={styles.messageContent}>
                  <div className={`${styles.bubble} ${message.role === "user" ? styles.userBubble : styles.assistantBubble}`}>
                    {message.content}
                  </div>

                  {message.products && message.products.length > 0 && (
                    <div className={styles.products} aria-label="Sản phẩm được gợi ý">
                      {message.products.map((product) => (
                        <Link href={product.href} className={styles.productCard} key={product.id}>
                          <span className={styles.productImage}>
                            <Image src={product.image} alt="" width={68} height={68} sizes="68px" />
                          </span>
                          <span className={styles.productInfo}>
                            <small>{product.categoryName} · {product.sku}</small>
                            <strong>{product.name}</strong>
                            <b>{formatPrice(product.price)}</b>
                          </span>
                          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
                        </Link>
                      ))}
                    </div>
                  )}

                  {message.links && message.links.length > 0 && (
                    <div className={styles.links}>
                      {message.links.map((link) => (
                        <Link href={link.href} key={link.href}>{link.label}<span>→</span></Link>
                      ))}
                    </div>
                  )}

                  {index === 0 && messages.length === 1 && (
                    <div className={styles.starters}>
                      {STARTER_PROMPTS.map((prompt) => (
                        <button type="button" key={prompt} onClick={() => void sendMessage(prompt)}>
                          {prompt}<span>→</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className={styles.messageRow}>
                <div className={styles.smallAvatar} aria-hidden="true">E</div>
                <div className={`${styles.bubble} ${styles.assistantBubble} ${styles.typing}`} aria-label="Elli đang trả lời">
                  <i /><i /><i />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className={styles.composer} onSubmit={handleSubmit}>
            <div className={styles.inputWrap}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value.slice(0, 500))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Nhập câu hỏi của bạn..."
                rows={1}
                maxLength={500}
                aria-label="Câu hỏi cho Elli"
                disabled={isLoading}
              />
              <button type="submit" disabled={!input.trim() || isLoading} aria-label="Gửi câu hỏi">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
              </button>
            </div>
            <p>Elli có thể chưa chính xác. Hãy kiểm tra thông tin quan trọng.</p>
          </form>
        </section>
      )}

      <div className={styles.triggerWrap}>
        {!isOpen && <span className={styles.triggerLabel}>Bạn cần Elli tư vấn?</span>}
        <button
          ref={triggerRef}
          type="button"
          className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""}`}
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Đóng trợ lý Elli" : "Mở trợ lý Elli"}
        >
          {isOpen ? (
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          ) : (
            <>
              <span className={styles.triggerSpark}>✦</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3Z" /><path d="M8 9h8M8 13h5" /></svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
