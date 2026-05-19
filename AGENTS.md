# AGENTS.md

## Cursor Cloud specific instructions

Next.js PWA + Telegram bot for Maldives Xpat work permit lookup.

### Commands

- `npm install` / `npm run dev` / `npm run build` / `npm run lint`
- Dev needs `XPAT_API_KEY` in `.env.local`

### Environment

- `XPAT_API_KEY` — required for lookups
- `TELEGRAM_BOT_TOKEN` — required for bot
- `TELEGRAM_WEBHOOK_SECRET` — optional but recommended; must match `scripts/telegram-set-webhook.mjs`

### Architecture

- UI: `components/LookupApp.tsx` — manual form + `DocumentScan` → `POST /api/ocr` → lookup
- OCR: `lib/ocr-scan-server.ts` — **Tesseract.js** + `sharp` preprocess (not PaddleOCR)
- Telegram: `lib/telegram-handler.ts` — text or photo → OCR or parse → `lib/telegram-process-lookup.ts`
- Proxies: `app/api/work-permit/*`

### Gotchas

- Both permit + passport required upstream (400 if one missing).
- Bot 401 = `TELEGRAM_WEBHOOK_SECRET` mismatch with Telegram `secret_token`.
- OCR routes: `maxDuration = 60` in route + `vercel.json`.
- Tesseract: `outputFileTracingIncludes` must bundle `tesseract.js-core/*.wasm` (ENOENT on Vercel otherwise).
- PWA service worker v2: network-first HTML; do not cache `/_next` chunks.
