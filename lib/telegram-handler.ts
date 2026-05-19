import { formatTelegramErrorMessage } from "@/lib/format-telegram-message";
import { scanBufferForPermitFieldsServer } from "@/lib/ocr-scan-server";
import {
  formatOcrFailureMessage,
  getBotHelpText,
  parsePermitMessage,
} from "@/lib/parse-bot-message";
import { processPermitLookup } from "@/lib/telegram-process-lookup";
import {
  telegramDownloadFile,
  telegramSendMessage,
} from "@/lib/telegram-api";

type TelegramPhotoSize = { file_id: string };

type TelegramDocument = {
  file_id: string;
  mime_type?: string;
  file_name?: string;
};

type TelegramMessage = {
  message_id: number;
  chat: { id: number; type: string };
  text?: string;
  caption?: string;
  photo?: TelegramPhotoSize[];
  document?: TelegramDocument;
};

export type TelegramUpdate = {
  message?: TelegramMessage;
};

const IMAGE_MIME_PREFIX = "image/";

function getTelegramImageFileId(message: TelegramMessage): string | null {
  if (message.document) {
    const mime = message.document.mime_type ?? "";
    if (mime.startsWith(IMAGE_MIME_PREFIX)) {
      return message.document.file_id;
    }
    return null;
  }

  if (message.photo?.length) {
    return message.photo[message.photo.length - 1].file_id;
  }

  return null;
}

async function handleImageUpload(
  chatId: number,
  fileId: string,
): Promise<void> {
  await telegramSendMessage(
    chatId,
    "📷 <b>Scanning your document…</b>\nUsually 5–15 seconds.",
  );

  let buffer: Buffer;
  try {
    buffer = await telegramDownloadFile(fileId);
  } catch {
    await telegramSendMessage(
      chatId,
      formatTelegramErrorMessage("Could not download the image from Telegram."),
    );
    return;
  }

  let fields;
  try {
    fields = await scanBufferForPermitFieldsServer(buffer);
  } catch (err) {
    console.error("Telegram OCR failed", err);
    await telegramSendMessage(
      chatId,
      formatTelegramErrorMessage(
        "Document scan failed on the server. Try a clearer photo or send two lines of text:\n<code>WP00595305</code>\n<code>V7255877</code>",
      ),
    );
    return;
  }

  const wp = fields.workPermitNumber?.trim() ?? "";
  const pass = fields.passportNumber?.trim() ?? "";

  if (wp && pass) {
    await telegramSendMessage(
      chatId,
      `✅ Found <code>${wp}</code> and <code>${pass}</code>`,
    );
    await processPermitLookup(chatId, wp, pass);
    return;
  }

  await telegramSendMessage(
    chatId,
    formatOcrFailureMessage({
      ...(wp ? { workPermitNumber: wp } : {}),
      ...(pass ? { passportNumber: pass } : {}),
    }),
  );
}

async function handleTextMessage(
  chatId: number,
  text: string,
): Promise<void> {
  if (text === "/start" || text === "/help") {
    await telegramSendMessage(chatId, getBotHelpText());
    return;
  }

  const parsed = parsePermitMessage(text);
  if (!parsed.ok) {
    await telegramSendMessage(chatId, parsed.error);
    return;
  }

  await processPermitLookup(
    chatId,
    parsed.workPermitNumber,
    parsed.passportNumber,
  );
}

export async function handleTelegramUpdate(
  update: TelegramUpdate,
): Promise<void> {
  const message = update.message;
  if (!message) return;

  const chatId = message.chat.id;

  const imageFileId = getTelegramImageFileId(message);
  if (imageFileId) {
    await handleImageUpload(chatId, imageFileId);
    return;
  }

  if (message.document && !message.document.mime_type?.startsWith(IMAGE_MIME_PREFIX)) {
    await telegramSendMessage(
      chatId,
      "Please send an <b>image</b> (photo or picture file), not this document type.\n\nOr send two lines of text:\n<code>WP00595305</code>\n<code>V7255877</code>",
    );
    return;
  }

  const text = (message.text ?? message.caption ?? "").trim();
  if (text) {
    await handleTextMessage(chatId, text);
    return;
  }
}
