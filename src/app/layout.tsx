import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import AiAssistant from "@/components/AiAssistant";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Electrolux Việt Nam | Đồ Điện Gia Dụng | Mua Hàng Online",
  description:
    "Mua máy giặt Electrolux, máy sấy Electrolux, tủ lạnh và các thiết bị điện gia dụng từ thương hiệu Thụy Điển hàng đầu thế giới. Giao và lắp đặt miễn phí.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var clean = function() {
                  document.querySelectorAll('[bis_skin_checked]').forEach(function(el) {
                    el.removeAttribute('bis_skin_checked');
                  });
                };
                clean();
                document.addEventListener('DOMContentLoaded', clean);
                new MutationObserver(function(mutations) {
                  mutations.forEach(function(m) {
                    if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked') {
                      m.target.removeAttribute('bis_skin_checked');
                    }
                    if (m.addedNodes) {
                      m.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                          if (node.hasAttribute && node.hasAttribute('bis_skin_checked')) {
                            node.removeAttribute('bis_skin_checked');
                          }
                          if (node.querySelectorAll) {
                            node.querySelectorAll('[bis_skin_checked]').forEach(function(el) {
                              el.removeAttribute('bis_skin_checked');
                            });
                          }
                        }
                      });
                    }
                  });
                }).observe(document.documentElement, {
                  attributes: true,
                  attributeFilter: ['bis_skin_checked'],
                  subtree: true,
                  childList: true
                });
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
          <AiAssistant />
        </AuthProvider>
      </body>
    </html>
  );
}
