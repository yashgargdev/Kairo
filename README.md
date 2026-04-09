<div align="center">
  <img src="public/favicon.svg" alt="Kairo Logo" width="64" height="64" />
  <h1>Kairo</h1>
  <p><strong>Open-source AI chat. Bring your own keys. Zero data stored.</strong></p>

  <p>
    <a href="https://github.com/yashgargdev/Kairo/releases"><img src="https://img.shields.io/badge/version-3.0.0-amber" alt="Version" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>
    <a href="https://github.com/yashgargdev/Kairo/stargazers"><img src="https://img.shields.io/github/stars/yashgargdev/Kairo?style=flat" alt="Stars" /></a>
    <a href="https://github.com/yashgargdev/Kairo/issues"><img src="https://img.shields.io/github/issues/yashgargdev/Kairo" alt="Issues" /></a>
  </p>

  <p>
    <a href="https://kairo.yashgarg.co.in"><strong>Live Demo</strong></a> ·
    <a href="https://github.com/yashgargdev/Kairo/issues/new?template=bug_report.md"><strong>Report Bug</strong></a> ·
    <a href="https://github.com/yashgargdev/Kairo/issues/new?template=feature_request.md"><strong>Request Feature</strong></a>
  </p>

  <br />
  <img src="public/og.png" alt="Kairo Screenshot" width="100%" style="border-radius:12px" />
</div>

---

## What is Kairo?

Kairo is a privacy-first AI chat interface that lets you talk to the world's best AI models using **your own API keys**. No account needed. No data ever leaves your device. Everything is stored in your browser's `localStorage`.

---

## Features

- **Bring Your Own Keys (BYOK)** — Your API keys stay in your browser. They are never sent to any Kairo server (there are none).
- **22 models across 7 providers** — Claude, GPT, Gemini, Llama, Groq, Sarvam AI, and image generation models.
- **Image generation** — Switch to Image mode to generate with DALL·E, Stable Diffusion, Imagen, and more.
- **File attachments** — Attach `.txt`, `.md`, `.pdf`, `.docx`, `.xlsx`, `.pptx` files. Text is extracted and sent to the model.
- **Code tool** — Syntax-highlighted code blocks with one-click copy.
- **CSV/spreadsheet viewer** — AI-generated CSV output renders as an interactive Excel-like table.
- **Retry & copy** — Retry any AI response or copy it instantly.
- **Thinking blocks** — See the model's reasoning steps (for models that support it).
- **Streaming responses** — Responses stream word-by-word in real time.
- **Conversation history** — All chats saved locally in `localStorage`.
- **Dark amber UI** — Polished dark theme built with Tailwind CSS and Framer Motion.
- **Zero telemetry** — No analytics, no tracking, no cookies.

---

## Supported Providers & Models

| Provider | Models |
|---|---|
| Anthropic | Claude Opus 4.6, Claude Sonnet 4.6, Claude Haiku 4.5 |
| OpenAI | GPT-5.4, GPT-5.4 mini, GPT-5.4 nano, o3, o4-mini |
| Google AI | Gemini 3.1 Pro, Gemini 3 Flash, Gemini 2.5 Pro + image models |
| Groq | Llama 4 Maverick, DeepSeek R1, Mixtral 8x7B |
| Meta (via OpenRouter) | Llama 4 Maverick 400B, Llama 4 Scout 109B, Llama 3.1 70B |
| Sarvam AI | Sarvam 105B, Sarvam 30B, Sarvam-M |
| Stability AI | SD 3.5 Large, Stable Image Ultra, Stable Image Core + more |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm
- API key(s) from at least one provider

### Installation

```bash
# Clone the repository
git clone https://github.com/yashgargdev/Kairo.git
cd Kairo

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Add your API keys

1. Click **Settings** in the top right
2. Go to the **API Keys** tab
3. Paste your key for any provider and click **Save**
4. Start chatting

No `.env` file is required. Kairo is fully client-side.

---

## Environment Variables

Kairo requires **no server-side environment variables**. It is a pure client-side app.

An optional variable exists for customising the public URL (used in OG metadata):

```env
NEXT_PUBLIC_APP_URL=https://your-deployment-url.com
```

See [`.env.example`](.env.example) for reference.

---

## Deployment

Kairo deploys to any platform that supports Next.js.

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

### Docker / self-hosted

```bash
npm run build
npm start
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Icons | Lucide React |
| Markdown | react-markdown + remark-gfm |
| File parsing | pdf-parse, mammoth, xlsx, jszip |
| State | Zustand-style React hooks + localStorage |
| Runtime | Edge (chat proxy) + Node.js (file extraction) |

---

## Project Structure

```
Kairo/
├── app/                  # Next.js App Router pages & API routes
│   ├── api/chat/         # Chat proxy (edge runtime)
│   ├── api/extract/      # File text extraction (node runtime)
│   ├── chat/             # Chat page
│   └── settings/         # Settings page
├── components/
│   ├── chat/             # Chat UI (messages, bubbles, sidebar)
│   ├── settings/         # Settings interface
│   └── ui/               # Shared UI components (input, etc.)
├── hooks/                # use-api-keys, use-chat-store
├── lib/
│   └── api/              # model-config, chat-client, parse-thinking
└── types/                # Shared TypeScript types
```

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for full details.

---

<div align="center">
  <p>Made with love by <a href="https://github.com/yashgargdev">yashgargdev</a></p>
  <p>
    <a href="https://github.com/yashgargdev/Kairo">⭐ Star this repo</a> if you find it useful!
  </p>
</div>
