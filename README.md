# CV Builder

A web app for building CVs: a validated form, live preview, themes, browser storage, and PDF export. Optionally generate a draft CV from a short description via the OpenAI API.

**Repository:** [github.com/miloszekovic/cv-builder](https://github.com/miloszekovic/cv-builder)

## Features

- **Editor** — profile, experience, education, skills (tag library), photo, layout options.
- **Preview** — updates as you type; theme selection (light / dark variants).
- **Local storage** — CV versions in `localStorage` (prefix `cv-gen:`).
- **PDF** — server-side rendering (Playwright + Chromium), print CSS (`public/cv-print.css` built from Tailwind entry).
- **AI draft** (optional) — `POST /api/generate-cv` with `OPENAI_API_KEY`; returns JSON matching the app schema.

## Requirements

- Node.js 20+
- For PDF: Playwright Chromium installed (`npx playwright install chromium` after `npm install`).

## Getting started

```bash
npm install
npx playwright install chromium   # only if you use PDF export
npm run build:print-css           # before first build / PDF (also runs in npm run build)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Create `.env.local` (see `.gitignore` for `.env*` patterns):

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | If missing, the AI generate UI/API returns 503. |
| `OPENAI_MODEL` | No | Defaults to `gpt-4o-mini`. |
| `PDF_EXPORT_ENABLED` | No | Set to `false` to disable `POST /api/export-pdf` (403). |

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js dev server. |
| `npm run build` | Build print CSS, then production Next build. |
| `npm run start` | Production server (after `build`). |
| `npm run build:print-css` | Tailwind → `public/cv-print.css`. |
| `npm run demo:pdf` | Writes a demo PDF under `output/pdf/` (helper script). |
| `npm run lint` | ESLint. |
| `npm run typecheck` | TypeScript check without emit. |

## Stack

Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, React Hook Form, Zod, OpenAI SDK, Playwright.

## API (short)

- **`POST /api/generate-cv`** — body: `{ "description": "...", "targetRole": "...", "tone": "professional"|"direct"|"friendly", "maxCvLength": "short"|"medium" }`. Response: `{ "cv": { ... } }` or an error object with `code`.
- **`POST /api/export-pdf`** — body: `{ "cv": { ... } }` (same shape as in the app). Response: PDF bytes or JSON error.

Schema and defaults: `lib/cv-schema.ts`, `lib/default-cv-data.ts`.
