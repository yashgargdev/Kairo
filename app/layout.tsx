import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kairo AI - Evolving Intelligence',
  description: 'Multilingual AI assistant platform.',
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
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gradient-to-b from-[#15151c] to-[#101014] text-slate-200 antialiased overflow-hidden h-screen flex relative border border-white/5">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-subtle-radial pointer-events-none z-0"></div>
        {children}
      </body>
    </html>
  );
}
