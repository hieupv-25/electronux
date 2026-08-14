import Home from "@/app/page";

export default async function CustomerPage() {
  return await Home({
    searchParams: Promise.resolve({ view: "customer" }),
  });
}
