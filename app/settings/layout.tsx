import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings — Kairo',
  description: 'Manage API keys and preferences',
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
