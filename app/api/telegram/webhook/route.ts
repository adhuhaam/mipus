import { NextRequest, NextResponse } from "next/server";
import { warmOcrEngine } from "@/lib/ocr-scan-server";
import { handleTelegramUpdate } from "@/lib/telegram-handler";
import { verifyTelegramSecret } from "@/lib/telegram-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

warmOcrEngine();

export async function GET() {
  return NextResponse.json({
    ok: true,
    bot: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    secret: Boolean(process.env.TELEGRAM_WEBHOOK_SECRET),
  });
}

export async function POST(request: NextRequest) {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN not configured" },
      { status: 503 },
    );
  }

  if (!verifyTelegramSecret(request)) {
    console.error(
      "Telegram webhook rejected: X-Telegram-Bot-Api-Secret-Token mismatch",
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const update = await request.json();
    await handleTelegramUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook error", err);
    return NextResponse.json({ ok: true });
  }
}
