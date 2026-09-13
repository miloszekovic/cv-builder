# CV Builder

A web app for building CVs: a validated form, live preview, themes, browser storage, and PDF export. Optionally generate a draft CV from a short description via the OpenAI API.

**Repository:** [github.com/miloszekovic/cv-builder](https://github.com/miloszekovic/cv-builder)

## Features

- **Editor** — profile, experience (with per-role and per-bullet visibility), education, skills (tag library), sidebar details, photo, layout options.
- **Preview** — updates as you type; theme and accent selection.
- **Local storage** — multiple named CV versions in `localStorage` (prefix `cv-gen:`); JSON import/export.
- **PDF** — server-side rendering (Playwright + Chromium), print CSS (`public/cv-print.css` built from Tailwind entry).
- **AI draft** (optional) — `POST /api/generate-cv` with `OPENAI_API_KEY`; returns JSON matching the app schema.

## Future ideas

- **Job-tailored variants** — generate a CV variant from a job posting, with a review step for each suggested change before anything is applied.
- **Version compare & rollback** — diff two saved versions side by side and restore a previous revision.

## Requirements

- Node.js 20+
- pnpm 9+ (recommended: enable via Corepack — `corepack enable`)
- For PDF: Playwright Chromium installed locally (`pnpm run playwright:install` after `pnpm install`). Browsers must live under `node_modules` because scripts set `PLAYWRIGHT_BROWSERS_PATH=0`. On Vercel, PDF uses `@sparticuz/chromium` automatically — no extra install step.

## Getting started

```bash
pnpm install
pnpm run playwright:install             # only if you use PDF export / preview
pnpm run build:print-css                # before first build / PDF (also runs in pnpm run build)
pnpm run dev
```

Open [http://localhost:3010](http://localhost:3010).

## Environment variables

Copy `.env.example` to `.env.local` and set values there (secrets stay untracked):

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | If missing, the AI generate UI/API returns 503. |
| `OPENAI_MODEL` | No | Defaults to `gpt-4o-mini`. |
| `PDF_EXPORT_ENABLED` | No | Set to `false` to disable `POST /api/export-pdf` (403). |

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm run dev` | Next.js dev server (port 3010). |
| `pnpm run build` | Build print CSS, then production Next build. |
| `pnpm run start` | Production server (after `build`). |
| `pnpm run build:print-css` | Tailwind → `public/cv-print.css`. |
| `pnpm run demo:pdf` | Writes a demo PDF under `output/pdf/` (local only; `output/` is gitignored). |
| `pnpm run playwright:install` | Download Chromium into local `node_modules` (needed after fresh install). |
| `pnpm run lint` | ESLint. |
| `pnpm run typecheck` | TypeScript check without emit. |

## Stack

Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, React Hook Form, Zod, OpenAI SDK, Playwright (local) / `@sparticuz/chromium` (Vercel).

## API (short)

- **`POST /api/generate-cv`** — body: `{ "description": "...", "targetRole": "...", "tone": "professional"|"direct"|"friendly", "maxCvLength": "short"|"medium" }`. Response: `{ "cv": { ... } }` or an error object with `code`.
- **`POST /api/export-pdf`** — body: `{ "cv": { ... } }` (same shape as in the app). Response: PDF bytes or JSON error.

Schema and defaults: `lib/cv-schema.ts`, `lib/default-cv-data.ts`.
