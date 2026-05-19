import { NextRequest, NextResponse } from "next/server";
import { warmOcrEngine } from "@/lib/ocr-scan-server";
import { handleTelegramUpdate } from "@/lib/telegram-handler";
import { verifyTelegramSecret } from "@/lib/telegram-api";

export const dynamic = "force-dynamic";
/** PaddleOCR model load + recognition */
export const maxDuration = 60;

warmOcrEngine();

export async function POST(request: NextRequest) {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN not configured" },
      { status: 503 },
    );
  }

  if (!verifyTelegramSecret(request)) {
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
