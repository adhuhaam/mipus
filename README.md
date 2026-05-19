# Xpat Lookup PWA

Look up Maldives work permits (same data as **Xpat MV**): employee details, photo, and permit card — on the **web** or via **Telegram**.

## How it works

1. **Input** — either:
   - Type **work permit** + **passport** (both required), or
   - Upload / photograph a document that shows **both numbers**
2. **OCR** (images only) — server reads the image with **Tesseract.js** (open source)
3. **Lookup** — app calls `mobile-xpat.egov.mv` with both numbers
4. **Output** — full profile on the website, or Telegram messages + photo + card

## Features

- Manual two-field lookup
- Camera / gallery scan → auto-fill → lookup
- Telegram bot: two lines of text **or** a photo
- API key stays server-side (`XPAT_API_KEY` on Vercel)

## Local development

```bash
npm install
cp .env.example .env.local
# Set XPAT_API_KEY (and optional TELEGRAM_* for the bot)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Import repo in [Vercel](https://vercel.com) (Next.js).
2. Environment variables:

| Variable | Required | Notes |
|----------|----------|--------|
| `XPAT_API_KEY` | Yes | Xpat Mobile API key |
| `TELEGRAM_BOT_TOKEN` | For bot | From [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_WEBHOOK_SECRET` | Recommended | Random string; same value in `setWebhook` script |

3. Deploy. OCR uses **Tesseract** (~19 MB function bundle, fits Vercel limits).

`vercel.json` sets **60s** timeout on OCR + Telegram routes (needs a plan that allows >10s).

### Telegram webhook (after deploy)

```bash
TELEGRAM_BOT_TOKEN=your-token \
WEBHOOK_URL=https://workpermit-mv.vercel.app/api/telegram/webhook \
TELEGRAM_WEBHOOK_SECRET=your-secret \
node scripts/telegram-set-webhook.mjs
```

Check webhook health:

```text
GET https://workpermit-mv.vercel.app/api/telegram/webhook
→ {"ok":true,"bot":true,"secret":true}
```

If the bot never replies, check Vercel logs for `401` (secret mismatch) or `TELEGRAM_BOT_TOKEN` missing.

**First image scan** after deploy may take 15–30s while English OCR data downloads to `/tmp`; later scans are faster.

## API routes

| Route | Purpose |
|-------|---------|
| `GET /api/work-permit` | Permit JSON |
| `GET /api/work-permit/photo` | Employee photo |
| `GET /api/work-permit/card` | Permit card PNG |
| `POST /api/ocr` | Extract WP + passport from image |
| `POST /api/telegram/webhook` | Bot updates |

## Disclaimer

Unofficial tool. Use only for permits you are authorized to view.
