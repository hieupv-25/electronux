export type AssistantRole = "user" | "assistant";

export type AssistantMessageInput = {
  role: AssistantRole;
  content: string;
};

export type AssistantProduct = {
  id: string;
  name: string;
  sku: string;
  image: string;
  price: number;
  oldPrice: number;
  categoryName: string;
  href: string;
  highlights: string[];
};

export type AssistantLink = {
  label: string;
  href: string;
};

export type AssistantApiResponse = {
  message: string;
  products: AssistantProduct[];
  links: AssistantLink[];
  mode: "ai" | "smart-fallback";
};
