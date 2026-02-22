# Kairo

**Evolving Intelligence.**

Kairo is a production-ready, open-source multilingual AI assistant platform powered by the Sarvam-M API. Built for real-world interactions, Kairo features conversation memory, multi-mode AI personas, Hinglish native understanding, and foundational RAG architecture. It serves as a robust base for building modern, premium AI SaaS applications.

## Key Features
- **Premium Dark Aesthetics**: A stunning minimal interface with subtle saffron to warm gold accents.
- **Multilingual Support**: Built-in normalization for mixed Hindi-English (Hinglish) queries.
- **Multi-Mode Prompting**: Contextual personas (Study, Coding, ELI5, MCQ).
- **RAG Ready**: Architecture supporting document extraction and vector search via Supabase limit tracking.
- **Markdown & Code**: Full rendering of complex AI replies including code blocks with syntax highlighting.

## Tech Stack
- Next.js 15 (App Router)
- React, Tailwind CSS V4, Framer Motion
- Supabase (Auth + PostgreSQL)
- Sarvam-M API (Streaming)

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yashgargdev/Kairo.git
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Rename `.env.example` to `.env.local` and apply your database credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SARVAM_API_KEY=your_sarvam_api_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## License
Provided under the [MIT License](LICENSE).
