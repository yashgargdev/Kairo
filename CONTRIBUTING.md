# Contributing to Kairo

Thank you for your interest in contributing to Kairo! 🎉

We welcome bug reports, feature requests, documentation improvements, and code contributions. Here's how to get started.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Coding Standards](#coding-standards)
- [Reporting Bugs](#reporting-bugs)

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please be kind and respectful.

---

## How to Contribute

### 🐛 Reporting Bugs

1. Check if the bug is already reported in [Issues](../../issues).
2. If not, open a new issue using the **Bug Report** template.
3. Include steps to reproduce, expected behaviour, actual behaviour, and screenshots if relevant.

### 💡 Suggesting Features

1. Open a [Feature Request](../../issues/new) issue.
2. Describe the feature, why it is useful, and any implementation ideas you have.

### 🛠 Writing Code

1. Fork the repository.
2. Create a new branch: `git checkout -b feat/your-feature-name`
3. Make your changes following the [Coding Standards](#coding-standards).
4. Commit with a descriptive message (see [Commit Format](#commit-format)).
5. Push your branch and open a Pull Request against `main`.

---

## Development Setup

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/kairo.git
cd kairo

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Fill in your Supabase and Sarvam API keys

# 4. Start dev server
npm run dev
```

See the [README](README.md) for the full Supabase database setup SQL.

---

## Pull Request Guidelines

- **One feature/fix per PR** — keep PRs small and focused.
- **Link the related issue** — reference it in the PR description (`Fixes #123`).
- **Include a description** — explain what changed and why.
- **Test your changes** — make sure the app runs without errors before opening a PR.
- **No new hardcoded secrets** — all API URLs and credentials must use environment variables.

### Commit Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add voice input support
fix: resolve empty message bug on new chat
docs: update README setup instructions
style: format sidebar component
refactor: extract sarvam client into services
chore: update dependencies
```

---

## Coding Standards

- **TypeScript** — all new files must be typed. Avoid `any` where possible.
- **Server vs Client** — use Server Components and Server Actions by default. Only add `'use client'` when necessary (event handlers, hooks).
- **No hardcoded values** — API base URLs, secrets, and environment-specific config belong in `.env.local` and `.env.example`.
- **File naming** — `PascalCase` for components, `camelCase` for utilities and services.
- **Imports** — use the `@/` alias for all project-internal imports.
- **Comments** — add JSDoc comments to all exported functions in `services/`.

---

## Project Areas

| Area | Location | Notes |
|---|---|---|
| AI Chat API | `app/api/chat/route.ts` | Streaming, history, file attachments |
| Document Parsing | `app/api/parse-document/route.ts` | PDF, DOCX, TXT, CSV |
| Auth & 2FA | `app/login/actions.ts` | Server actions for Supabase MFA |
| AI Services | `services/` | Sarvam client, RAG, prompt builder |
| UI Components | `components/` | Chat, Modals, Sidebar, Header |

---

Thank you for helping make Kairo better! 🚀
