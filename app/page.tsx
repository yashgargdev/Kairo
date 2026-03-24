import Link from 'next/link';
import OpenAILanding from '@/components/Home/OpenAILanding';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Kairo v2.0 — Bring Your Own Intelligence',
  description: 'Kairo v2.0 is the open-source multilingual AI workspace. Plug in your own API keys for OpenAI, Gemini, Claude, or Sarvam, and access unparalleled intelligence without monthly lock-ins.',
};

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect('/chat');
  }

  return <OpenAILanding />;
}
