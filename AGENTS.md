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

### Architecture

- UI: `app/page.tsx` → `components/LookupApp.tsx` (client)
- Proxies: `app/api/work-permit/*` → `mobile-xpat.egov.mv/api/v1`
- PWA: `public/manifest.webmanifest`, `public/sw.js`, registered in `components/PwaRegister.tsx`

### Gotchas

- Upstream API requires **both** work permit number and passport number; single-field lookup returns 400.
- Do not expose `XPAT_API_KEY` in client bundles; always use API routes.
