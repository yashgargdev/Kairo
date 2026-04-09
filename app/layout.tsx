import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f59e0b',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://kairo.yashgarg.co.in'),
  title: "Kairo — AI Chat with Your Own Keys",
  description:
    "Open-source AI chat interface. Bring your own API keys for Claude, GPT, Gemini, Llama, and more. Zero data stored — everything lives in your browser.",
  keywords: [
    "AI chat", "open source", "BYOK", "bring your own key",
    "Claude", "GPT", "Gemini", "Llama", "Sarvam",
    "private AI", "no login", "API keys"
  ],
  authors: [{ name: "Kairo", url: "https://github.com/yashgargdev/Kairo" }],
  creator: "yashgargdev",
  openGraph: {
    type: "website",
    url: "https://kairo.yashgarg.co.in",
    title: "Kairo — AI Chat with Your Own Keys",
    description:
      "Open-source AI chat. Bring your own API keys. Zero data stored. 22 models across 7 providers.",
    siteName: "Kairo",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Kairo AI Chat" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kairo — AI Chat with Your Own Keys",
    description:
      "Open-source AI chat. Bring your own API keys. Zero data stored. 22 models across 7 providers.",
    images: ["/og.png"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
