import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * One-time webhook registration from Vercel (no local script).
 * POST with header: x-setup-secret: <SETUP_SECRET>
 * Optional JSON body: { "url": "https://your-app.vercel.app/api/telegram/webhook" }
 */
export async function POST(request: NextRequest) {
  const setupSecret = process.env.SETUP_SECRET;
  if (!setupSecret) {
    return NextResponse.json(
      { error: "SETUP_SECRET not configured on Vercel" },
      { status: 503 },
    );
  }

  if (request.headers.get("x-setup-secret") !== setupSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN not configured" },
      { status: 503 },
    );
  }

  let webhookUrl =
    process.env.VERCEL_URL != null
      ? `https://${process.env.VERCEL_URL}/api/telegram/webhook`
      : null;

  try {
    const body = await request.json().catch(() => ({}));
    if (body && typeof body.url === "string" && body.url.startsWith("https://")) {
      webhookUrl = body.url;
    }
  } catch {
    /* use default */
  }

  if (!webhookUrl) {
    return NextResponse.json(
      {
        error:
          "Could not determine webhook URL. Pass { \"url\": \"https://...\" } or set VERCEL_URL.",
      },
      { status: 400 },
    );
  }

  const payload: {
    url: string;
    allowed_updates: string[];
    drop_pending_updates: boolean;
    secret_token?: string;
  } = {
    url: webhookUrl,
    allowed_updates: ["message"],
    drop_pending_updates: true,
  };

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) payload.secret_token = secret;

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  return NextResponse.json({ webhookUrl, telegram: data }, { status: data.ok ? 200 : 502 });
}
