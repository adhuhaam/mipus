import { formatTelegramErrorMessage, formatTelegramStatusMessage } from "@/lib/format-telegram-message";
import { lookupWorkPermit } from "@/lib/xpat-lookup";
import {
  telegramSendMessage,
  telegramSendPermitMedia,
} from "@/lib/telegram-api";

export async function processPermitLookup(
  chatId: number,
  workPermitNumber: string,
  passportNumber: string,
): Promise<void> {
  await telegramSendMessage(chatId, "⏳ Looking up permit…");

  const result = await lookupWorkPermit(workPermitNumber, passportNumber);

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
    workPermitNumber,
    passportNumber,
  );
}
