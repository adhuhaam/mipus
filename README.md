# Xpat Lookup PWA

A minimal Progressive Web App to look up Maldives work permits — same data as the official **Xpat MV** mobile app: employee details, photo, and permit card image.

## Features

- Lookup by **work permit number** + **passport number** (both required by the API)
- Shows all fields returned by `/api/v1/WorkPermit`
- Employee photo via proxied `/WorkPermit/GetImage`
- Full permit card PNG via `/WorkPermitCard/GetWorkPermitCard`
- Link to official QR verification URL (`verifyUrl`)
- Installable PWA (manifest + service worker)
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
3. Add environment variable:
   - `XPAT_API_KEY` = your Xpat Mobile API key
4. Deploy (framework preset: **Next.js**).

No extra `vercel.json` is required.

## API routes (proxy)

| Route | Upstream |
|-------|----------|
| `GET /api/work-permit` | `WorkPermit` JSON |
| `GET /api/work-permit/photo` | `WorkPermit/GetImage` |
| `GET /api/work-permit/card` | `WorkPermitCard/GetWorkPermitCard` |

## Disclaimer

Unofficial tool. Use only for permits you are authorized to view. Data is sourced from `mobile-xpat.egov.mv`.
