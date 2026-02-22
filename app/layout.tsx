import type { Metadata } from 'next';
import './globals.css';
import { NavigationProgress } from '@/components/NavigationProgress';

export const metadata: Metadata = {
  title: 'Kairo AI — Evolving Intelligence',
  description: 'Open-source multilingual AI assistant powered by Sarvam-M. Features streaming chat, conversation memory, document analysis, and 2FA.',
  keywords: ['AI', 'chatbot', 'multilingual', 'Hindi', 'Sarvam', 'open-source'],
  openGraph: {
    title: 'Kairo AI — Evolving Intelligence',
    description: 'Open-source multilingual AI assistant platform.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0&display=swap"
        />
      </head>
      <body className="bg-gradient-to-b from-[#15151c] to-[#101014] text-slate-200 antialiased overflow-hidden h-screen flex relative border border-white/5">
        <NavigationProgress />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-subtle-radial pointer-events-none z-0"></div>
        {children}
      </body>
    </html>
  );
}
