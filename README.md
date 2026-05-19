# Xpat Lookup PWA

A minimal Progressive Web App to look up Maldives work permits — same data as the official **Xpat MV** mobile app: employee details, photo, and permit card image.

## Features

- Lookup by **work permit number** + **passport number** (both required by the API)
- Shows all fields returned by `/api/v1/WorkPermit`
- Employee photo via proxied `/WorkPermit/GetImage`
- Full permit card PNG via `/WorkPermitCard/GetWorkPermitCard`
- Link to official QR verification URL (`verifyUrl`)
- Installable PWA (manifest + service worker)
- **Document scan** (camera/upload) via server **PaddleOCR** (PP-OCRv4, MIT) — same engine as the Telegram bot
- API key kept **server-side** via Next.js route handlers (safe for Vercel)

## Local development

```bash
npm install
cp .env.example .env.local
# Edit .env.local and set XPAT_API_KEY (from the mobile app / your API provider)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add environment variables:
   - `XPAT_API_KEY` = your Xpat Mobile API key
   - `TELEGRAM_BOT_TOKEN` = from [@BotFather](https://t.me/BotFather) (for the bot)
   - `TELEGRAM_WEBHOOK_SECRET` = optional random string (recommended)
4. Deploy (framework preset: **Next.js**).

No extra `vercel.json` is required.

## Telegram bot

Users can either:

**Text** — two lines (work permit, then passport):

```
WP00595305
V7255877
```

**Photo or image document** — permit card, passport page, etc. The bot and PWA use **PaddleOCR** (open source, via `@gutenye/ocr-node`), find both numbers, then look up the record. First scan after deploy may be slower while models load; later scans are much faster (~5–15s).

The bot replies with status text, employee photo, and permit card image.

**After deploy**, register the webhook (replace URL):

```bash
TELEGRAM_BOT_TOKEN=your-token \
WEBHOOK_URL=https://YOUR-APP.vercel.app/api/telegram/webhook \
TELEGRAM_WEBHOOK_SECRET=your-secret \
node scripts/telegram-set-webhook.mjs
```

Commands: `/start` and `/help` show the format.

**Security:** Never commit `TELEGRAM_BOT_TOKEN`. If a token was shared publicly, revoke it in BotFather and create a new one.

## API routes (proxy)

| Route | Upstream |
|-------|----------|
| `GET /api/work-permit` | `WorkPermit` JSON |
| `GET /api/work-permit/photo` | `WorkPermit/GetImage` |
| `GET /api/work-permit/card` | `WorkPermitCard/GetWorkPermitCard` |

## Disclaimer

Unofficial tool. Use only for permits you are authorized to view. Data is sourced from `mobile-xpat.egov.mv`.
