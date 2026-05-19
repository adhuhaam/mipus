import {
  buildCardUrl,
  buildImageUrl,
  parsePhotoIds,
  xpatHeaders,
} from "@/lib/xpat-api";
import type { WorkPermitRecord } from "@/types/work-permit";

function botBase(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  return `https://api.telegram.org/bot${token}`;
}

export async function telegramSendMessage(
  chatId: number,
  text: string,
): Promise<void> {
  const res = await fetch(`${botBase()}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Telegram sendMessage failed", res.status, body);
  }
}

async function telegramSendPhoto(
  chatId: number,
  imageBytes: Uint8Array,
  filename: string,
  mime: string,
  caption?: string,
): Promise<void> {
  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append(
    "photo",
    new Blob([Buffer.from(imageBytes)], { type: mime }),
    filename,
  );
  if (caption) {
    form.append("caption", caption.slice(0, 1024));
    form.append("parse_mode", "HTML");
  }

  const res = await fetch(`${botBase()}/sendPhoto`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Telegram sendPhoto failed", res.status, body);
  }
}

async function fetchProtectedImage(url: string): Promise<{
  bytes: Uint8Array;
  mime: string;
} | null> {
  try {
    const res = await fetch(url, { headers: xpatHeaders(), cache: "no-store" });
    if (!res.ok) return null;
    const mime = res.headers.get("content-type") ?? "image/jpeg";
    const bytes = new Uint8Array(await res.arrayBuffer());
    return { bytes, mime };
  } catch {
    return null;
  }
}

export async function telegramSendPermitMedia(
  chatId: number,
  record: WorkPermitRecord,
  workPermitNumber: string,
  passportNumber: string,
): Promise<void> {
  const photoIds = parsePhotoIds(record.photoUrl);
  if (photoIds) {
    const img = await fetchProtectedImage(
      buildImageUrl(photoIds.photoId, photoIds.serviceId),
    );
    if (img) {
      await telegramSendPhoto(
        chatId,
        img.bytes,
        "photo.jpg",
        img.mime,
        "📷 Employee photo",
      );
    }
  }

  const card = await fetchProtectedImage(
    buildCardUrl(workPermitNumber, passportNumber),
  );
  if (card) {
    await telegramSendPhoto(
      chatId,
      card.bytes,
      "card.png",
      card.mime,
      "🪪 Work permit card",
    );
  }
}

type TelegramFileResponse = {
  ok: boolean;
  result?: { file_path?: string };
};

/** Download a file uploaded to Telegram (photo or document). */
export async function telegramDownloadFile(fileId: string): Promise<Buffer> {
  const metaRes = await fetch(
    `${botBase()}/getFile?file_id=${encodeURIComponent(fileId)}`,
  );
  const meta = (await metaRes.json()) as TelegramFileResponse;

  if (!meta.ok || !meta.result?.file_path) {
    throw new Error("Could not get file from Telegram");
  }

  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const fileRes = await fetch(
    `https://api.telegram.org/file/bot${token}/${meta.result.file_path}`,
  );

  if (!fileRes.ok) {
    throw new Error("Could not download file from Telegram");
  }

  return Buffer.from(await fileRes.arrayBuffer());
}

export function verifyTelegramSecret(request: Request): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return true;
  return request.headers.get("x-telegram-bot-api-secret-token") === secret;
}
