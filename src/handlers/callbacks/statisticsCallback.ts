import TelegramBot from "node-telegram-bot-api";
import { CommandContext } from "../types";
import {
  PERIOD_ACTIONS,
  StatsPeriod,
  getStatistics,
  formatStatistics,
} from "../commands/statistics";

export function setupStatisticsCallback(context: CommandContext) {
  const { bot, db } = context;

  return async (query: TelegramBot.CallbackQuery) => {
    if (!query.data || !query.message) return;
    if (!Object.values(PERIOD_ACTIONS).includes(query.data as any)) return;

    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    let period: StatsPeriod;
    switch (query.data) {
      case PERIOD_ACTIONS.DAY:
        period = "day";
        break;
      case PERIOD_ACTIONS.WEEK:
        period = "week";
        break;
      case PERIOD_ACTIONS.MONTH:
        period = "month";
        break;
      default:
        return;
    }

    try {
      const stats = await getStatistics(db, chatId.toString(), period);
      const message = await formatStatistics(stats, period);

      // Добавляем клавиатуру с периодами
      const keyboard = {
        inline_keyboard: [
          [
            { text: "📅 День", callback_data: PERIOD_ACTIONS.DAY },
            { text: "📅 Неделя", callback_data: PERIOD_ACTIONS.WEEK },
            { text: "📅 Месяц", callback_data: PERIOD_ACTIONS.MONTH },
          ],
        ],
      };

      // Пытаемся обновить сообщение
      try {
        await bot.editMessageText(message, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "HTML",
          reply_markup: keyboard,
        });
      } catch (editError: any) {
        // Если сообщение не изменилось, просто отвечаем на callback
        if (
          editError.description ===
          "Bad Request: message is not modified: specified new message content and reply markup are exactly the same as a current content and reply markup of the message"
        ) {
          await bot.answerCallbackQuery(query.id, {
            text: "📊 Статистика уже актуальна",
          });
        } else {
          throw editError; // Пробрасываем другие ошибки
        }
      }

      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("Error getting statistics:", error);
      await bot.answerCallbackQuery(query.id, {
        text: "❌ Ошибка при получении статистики",
        show_alert: true,
      });
    }
  };
}
