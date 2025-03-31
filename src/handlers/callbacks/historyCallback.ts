import TelegramBot from "node-telegram-bot-api";
import { CommandContext } from "../types";
import { eq } from "drizzle-orm";
import { expenses } from "../../db/schema";
import { HISTORY_ACTIONS } from "../commands/history";

export function setupHistoryCallback(context: CommandContext) {
  const { bot, db } = context;

  return async (query: TelegramBot.CallbackQuery) => {
    if (!query.data || !query.message) return;

    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    switch (query.data) {
      case HISTORY_ACTIONS.CONFIRM_CLEAR:
        try {
          await db
            .delete(expenses)
            .where(eq(expenses.userId, chatId.toString()));

          await bot.answerCallbackQuery(query.id, {
            text: "✅ История расходов очищена",
          });

          await bot.editMessageText("✅ Вся история расходов успешно удалена", {
            chat_id: chatId,
            message_id: messageId,
          });
        } catch (error) {
          console.error("Error clearing history:", error);
          await bot.answerCallbackQuery(query.id, {
            text: "❌ Ошибка при очистке истории",
            show_alert: true,
          });
        }
        break;

      case HISTORY_ACTIONS.CANCEL_CLEAR:
        try {
          await bot.answerCallbackQuery(query.id, {
            text: "🔙 Операция отменена",
          });

          await bot.editMessageText("🔙 Очистка истории отменена", {
            chat_id: chatId,
            message_id: messageId,
          });
        } catch (error) {
          console.error("Error canceling history clear:", error);
          await bot.answerCallbackQuery(query.id, {
            text: "❌ Ошибка при отмене операции",
            show_alert: true,
          });
        }
        break;
    }
  };
}
