import { formatTelegramErrorMessage, formatTelegramStatusMessage } from "@/lib/format-telegram-message";
import { getBotHelpText, parsePermitMessage } from "@/lib/parse-bot-message";
import { lookupWorkPermit } from "@/lib/xpat-lookup";
import {
  telegramSendMessage,
  telegramSendPermitMedia,
} from "@/lib/telegram-api";

type TelegramUpdate = {
  message?: {
    message_id: number;
    chat: { id: number; type: string };
    text?: string;
  };
};

export async function handleTelegramUpdate(update: TelegramUpdate): Promise<void> {
  const message = update.message;
  if (!message?.text) return;

  const chatId = message.chat.id;
  const text = message.text.trim();

  if (text === "/start" || text === "/help") {
    await telegramSendMessage(chatId, getBotHelpText());
    return;
  }

  const parsed = parsePermitMessage(text);
  if (!parsed.ok) {
    await telegramSendMessage(chatId, parsed.error);
    return;
  }

  await telegramSendMessage(chatId, "⏳ Looking up permit…");

  const result = await lookupWorkPermit(
    parsed.workPermitNumber,
    parsed.passportNumber,
  );

  if (!result.ok) {
    await telegramSendMessage(
      chatId,
      formatTelegramErrorMessage(result.error),
    );
    return;
  }

  await telegramSendMessage(
    chatId,
    formatTelegramStatusMessage(result.record),
  );

  await telegramSendPermitMedia(
    chatId,
    result.record,
    parsed.workPermitNumber,
    parsed.passportNumber,
  );
}
