# AGENTS.md

## Cursor Cloud specific instructions

Next.js PWA for Maldives Xpat work permit lookup (`xpat-lookup-pwa`).

### Commands

- Install: `npm install`
- Dev: `npm run dev` (requires `XPAT_API_KEY` in `.env.local`)
- Build: `npm run build`
- Lint: `npm run lint`

### Environment

- `XPAT_API_KEY` — required for API proxy routes (`lib/xpat-api.ts`). Set in Vercel project settings for production.
- `TELEGRAM_BOT_TOKEN` — required for `/api/telegram/webhook`.
- `TELEGRAM_WEBHOOK_SECRET` — optional; set same value when calling `scripts/telegram-set-webhook.mjs`.

### Architecture

- UI: `app/page.tsx` → `components/LookupApp.tsx` (client)
- Proxies: `app/api/work-permit/*` → `mobile-xpat.egov.mv/api/v1`
- Telegram: `app/api/telegram/webhook` → `lib/telegram-handler.ts`
- OCR server: `lib/ocr-scan-server.ts` (PaddleOCR / `@gutenye/ocr-node` + `sharp` preprocess)
- OCR browser: `lib/ocr-scan-browser.ts` (Tesseract.js, reused worker, image resize)
- PWA: `public/manifest.webmanifest`, `public/sw.js`, registered in `components/PwaRegister.tsx`

### Gotchas

- Upstream API requires **both** work permit number and passport number; single-field lookup returns 400.
- Do not expose `XPAT_API_KEY` in client bundles; always use API routes.
