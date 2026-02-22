<div align="center">

<img src="public/Kairo-Logo-White.png" alt="Kairo Logo" width="72"/>

# Kairo

**Evolving Intelligence — Open Source AI Assistant Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ecf8e?logo=supabase)](https://supabase.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

---

Kairo is a **production-ready, open-source multilingual AI assistant** built on Next.js 15 and powered by the [Sarvam AI](https://sarvam.ai) API. It features real-time streaming responses, conversation memory, multi-mode AI personas, Two-Factor Authentication, document upload & parsing, and a premium dark interface.

> **Why Kairo?** Most open-source AI chat apps are demos. Kairo is a full platform — auth, history, file uploads, 2FA, and deployable in minutes.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 **Streaming AI Chat** | Real-time responses from Sarvam-M via the Vercel AI SDK |
| 💬 **Conversation Memory** | Full history stored per-user in Supabase, loaded on every request |
| 🌐 **Multilingual** | Native Hindi/English (Hinglish) understanding and normalization |
| 📄 **Document Upload** | Parse PDF, DOCX, TXT, CSV files and chat about their contents |
| 🖼️ **Image Analysis** | Describe uploaded images using Sarvam Vision API |
| 🎯 **AI Personas** | Switch between Study, Coding, ELI5, and MCQ modes |
| 🔐 **Full Auth** | Email/password + Google OAuth via Supabase Auth |
| 🔑 **2FA (TOTP)** | Time-based one-time passwords with QR code enrollment |
| 🎨 **Premium Dark UI** | Glassmorphism, gold accents, smooth animations via Framer Motion |
| 📱 **Responsive** | Mobile-first sidebar drawer with desktop persistent layout |

---

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router, Server Actions)
- **AI**: [Sarvam AI](https://sarvam.ai) via [`@ai-sdk`](https://sdk.vercel.ai) streaming
- **Auth & DB**: [Supabase](https://supabase.com) (PostgreSQL + Row-Level Security)
- **Styling**: Tailwind CSS v4, Framer Motion, Playfair Display + Inter fonts
- **File Parsing**: `pdf2json`, `mammoth` (DOCX), native CSV
- **2FA**: Supabase TOTP MFA

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- A [Supabase](https://app.supabase.com) project (free tier works)
- A [Sarvam AI](https://sarvam.ai) API key

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/kairo.git
cd kairo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your credentials (see [Environment Variables](#-environment-variables) below).

### 4. Set up the Supabase database

Run the following SQL in your [Supabase SQL editor](https://app.supabase.com/project/_/sql):

```sql
-- Conversations table
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'New Chat',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages table
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  role text check (role in ('user', 'assistant', 'system')) not null,
  content text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table conversations enable row level security;
alter table messages enable row level security;

-- Policies: users only see their own data
create policy "Users own conversations" on conversations
  for all using (auth.uid() = user_id);

create policy "Users own messages" on messages
  for all using (
    conversation_id in (
      select id from conversations where user_id = auth.uid()
    )
  );
```

### 5. Enable Google OAuth (optional)

In your Supabase dashboard → **Authentication → Providers → Google**, enter your Google OAuth credentials.

### 6. Enable MFA (for 2FA support)

In your Supabase dashboard → **Authentication → Sign In Methods**, enable **Multi-Factor Authentication (TOTP)**.

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔑 Environment Variables

Create a `.env.local` file based on `.env.example`:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Your Supabase anon/public key |
| `SARVAM_API_KEY` | ✅ | Your Sarvam AI API key |
| `SARVAM_BASE_URL` | ❌ | Override Sarvam API base URL (default: `https://api.sarvam.ai`) |

---

## 📁 Project Structure

```
kairo/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/
│   │   ├── chat/           # Streaming chat API endpoint
│   │   └── parse-document/ # File upload & content extraction API
│   ├── chat/[id]/          # Dynamic chat page
│   ├── login/              # Auth pages & server actions
│   ├── terms/              # Terms of Service page
│   └── privacy/            # Privacy Policy page
├── components/
│   ├── Chat/               # InputBar, MessageBubble
│   ├── Modals/             # Settings, Profile, Personalization modals
│   ├── Providers/          # UIProvider (mobile menu state)
│   ├── Header.tsx          # Top bar with model selector
│   ├── Sidebar.tsx         # Navigation, chat history, user profile
│   └── NavigationProgress.tsx  # Top-of-page navigation loading bar
├── services/               # Business logic & AI integrations
│   ├── sarvamClient.ts     # Sarvam AI streaming client
│   ├── modePromptBuilder.ts # System prompt generation per mode
│   ├── ragService.ts       # Document retrieval (RAG) service
│   ├── hinglishProcessor.ts # Hindi/English text normalization
│   └── usageLimiter.ts     # Per-user request rate limiting
├── utils/
│   └── supabase/           # Supabase client helpers (server + client)
├── public/                 # Static assets (logos, background images)
├── .env.example            # Environment variable template
└── README.md
```

---

## 🤝 Contributing

We welcome contributions from the community! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

---

## 📜 License

[MIT License](LICENSE) — free to use for personal and commercial projects.

---

## 🙏 Acknowledgements

- [Sarvam AI](https://sarvam.ai) — for the Sarvam-M multilingual model
- [Supabase](https://supabase.com) — for open-source auth and database
- [Vercel AI SDK](https://sdk.vercel.ai) — for streaming infrastructure
