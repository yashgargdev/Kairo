# Contributing to Kairo

Thank you for your interest in contributing! Kairo is open source and contributions of all kinds are welcome — bug fixes, new features, documentation improvements, and more.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Development Guidelines](#development-guidelines)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## Code of Conduct

By participating in this project, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Kairo.git
   cd Kairo
   ```
3. **Install** dependencies:
   ```bash
   npm install
   ```
4. **Run** the development server:
   ```bash
   npm run dev
   ```
5. Create a new branch for your change:
   ```bash
   git checkout -b feat/your-feature-name
   ```

---

## How to Contribute

### Bug Fixes

- Check the [issue tracker](https://github.com/yashgargdev/Kairo/issues) to see if the bug has already been reported.
- If not, open a new issue with steps to reproduce before submitting a fix.

### New Features

- Open an issue first to discuss the feature. This avoids wasted effort if the direction doesn't fit the project.
- Keep features focused — one feature per PR.

### Documentation

- Typos, clearer wording, missing examples — all welcome, no issue needed.

---

## Pull Request Process

1. Make sure your branch is up to date with `main`:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. Ensure the project builds without errors:
   ```bash
   npm run build
   ```
3. Write a clear PR description:
   - **What** changed
   - **Why** it was changed
   - **How** to test it
4. Link any related issues using `Closes #123` in the PR description.
5. A maintainer will review your PR. Be open to feedback and revision requests.

---

## Development Guidelines

### Code Style

- TypeScript everywhere — no `any` unless absolutely necessary.
- Use existing component patterns and Tailwind class conventions.
- Keep components small and focused on a single responsibility.
- Do not add unnecessary dependencies.

### Privacy First

Kairo is a privacy-first app. Contributions must **never**:
- Send user API keys to any server other than the intended AI provider.
- Add analytics, tracking, or telemetry of any kind.
- Store user data outside of the user's own browser `localStorage`.

### Commits

Use clear, descriptive commit messages:
```
feat: add retry button to assistant messages
fix: correct sarvam model API ID casing
docs: update README with new providers
```

---

## Reporting Bugs

Open an issue at [github.com/yashgargdev/Kairo/issues](https://github.com/yashgargdev/Kairo/issues) and include:

- Steps to reproduce
- Expected behaviour
- Actual behaviour
- Browser and OS
- Screenshots if applicable

---

## Requesting Features

Open a feature request issue with:

- A clear description of the problem it solves
- Your proposed solution (optional)
- Any alternatives you've considered

---

Thank you for helping make Kairo better!
