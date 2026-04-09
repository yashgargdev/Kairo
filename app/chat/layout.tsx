import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chat — Kairo',
  description: 'AI chat with your own API keys',
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
