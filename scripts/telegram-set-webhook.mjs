/**
 * Register Telegram webhook (run after deploy).
 *
 * Usage:
 *   TELEGRAM_BOT_TOKEN=... WEBHOOK_URL=https://your-app.vercel.app/api/telegram/webhook \
 *   TELEGRAM_WEBHOOK_SECRET=optional-random-string \
 *   node scripts/telegram-set-webhook.mjs
 */

const token = process.env.TELEGRAM_BOT_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!token || !webhookUrl) {
  console.error("Set TELEGRAM_BOT_TOKEN and WEBHOOK_URL");
  process.exit(1);
}

const body = {
  url: webhookUrl,
  allowed_updates: ["message"],
  drop_pending_updates: true,
};
if (secret) body.secret_token = secret;

const res = await fetch(
  `https://api.telegram.org/bot${token}/setWebhook`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  },
);

const data = await res.json();
console.log("setWebhook:", JSON.stringify(data, null, 2));

if (!data.ok) {
  process.exit(1);
}

const cmdRes = await fetch(
  `https://api.telegram.org/bot${token}/setMyCommands`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commands: [
        { command: "help", description: "Show instructions" },
        { command: "start", description: "Show instructions" },
      ],
    }),
  },
);

const cmdData = await cmdRes.json();
console.log("setMyCommands:", JSON.stringify(cmdData, null, 2));
process.exit(cmdData.ok ? 0 : 1);
