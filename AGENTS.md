# AGENTS.md

## Cursor Cloud specific instructions

Next.js PWA + Telegram bot for Maldives Xpat work permit lookup (official mobile API).

### Commands

- `npm install` / `npm run dev` / `npm run build` / `npm run lint`
- Dev needs `XPAT_API_KEY` in `.env.local`

### Environment

- `XPAT_API_KEY` — required for lookups
- `TELEGRAM_BOT_TOKEN` — required for bot
- `TELEGRAM_WEBHOOK_SECRET` — recommended; must match `setWebhook` / `scripts/telegram-set-webhook.mjs`
- `SETUP_SECRET` — optional; for `POST /api/telegram/setup`

### Architecture

- UI: `components/LookupApp.tsx` → `DocumentScan` uses **browser** OCR (`lib/ocr-scan-browser.ts`, Tesseract v7)
- Telegram: `lib/telegram-handler.ts` → **server** OCR (`lib/ocr-scan-server.ts`) → `lib/telegram-process-lookup.ts`
- Shared extraction: `lib/ocr-extract.ts` (xxpat + label patterns)
- Telegram text: `lib/format-telegram-message.ts` (sectioned HTML)
- Proxies: `app/api/work-permit/*`

### Gotchas

- Both permit + passport required upstream (400 if one missing).
- Bot needs **webhook registration** (`telegram-set-webhook.mjs` or `/api/telegram/setup`).
- WASM: `outputFileTracingIncludes` only on `/api/telegram/webhook` in `next.config.ts`.
- PWA service worker: network-first HTML; do not cache `/_next` chunks.
