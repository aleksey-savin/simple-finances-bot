import TelegramBot from "node-telegram-bot-api";
import { CommandContext } from "../types";
import { eq, and } from "drizzle-orm";
import { expenses, userCategories } from "../../db/schema";
import {
  CATEGORY_ACTIONS,
  handleCategoryManagement,
  awaitingCategoryInput,
} from "../commands/categories";

export function setupCategoryCallback(context: CommandContext) {
  const { bot, db } = context;

  return async (query: TelegramBot.CallbackQuery) => {
    if (!query.data || !query.message) return;

    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    // Обработка действий управления категориями
    if (Object.values(CATEGORY_ACTIONS).includes(query.data as any)) {
      try {
        await handleCategoryManagement(context, query.data, chatId, messageId);
        await bot.answerCallbackQuery(query.id);
      } catch (error) {
        console.error("Error handling category management:", error);
        await bot.answerCallbackQuery(query.id, {
          text: "❌ Произошла ошибка",
          show_alert: true,
        });
      }
      return;
    }

    // Обработка удаления категории
    if (query.data.startsWith("delete_category_")) {
      const categoryName = query.data.replace("delete_category_", "");
      try {
        await db
          .delete(userCategories)
          .where(
            and(
              eq(userCategories.name, categoryName),
              eq(userCategories.userId, chatId.toString()),
            ),
          );

        await bot.answerCallbackQuery(query.id, {
          text: `Категория "${categoryName}" удалена`,
        });

        await bot.editMessageText(
          `✅ Категория "${categoryName}" успешно удалена`,
          { chat_id: chatId, message_id: messageId },
        );
      } catch (error) {
        console.error("Error deleting category:", error);
        await bot.answerCallbackQuery(query.id, {
          text: "❌ Ошибка при удалении категории",
          show_alert: true,
        });
      }
      return;
    }

    // Обработка установки категории для расхода
    if (query.data.startsWith("cat_")) {
      const [, expenseId, category] = query.data.split("_");
      try {
        await db
          .update(expenses)
          .set({ category })
          .where(eq(expenses.id, parseInt(expenseId)));

        await bot.answerCallbackQuery(query.id, {
          text: `Категория "${category}" установлена`,
        });

        await bot.editMessageText(`✅ Установлена категория "${category}"`, {
          chat_id: chatId,
          message_id: messageId,
        });
      } catch (error) {
        console.error("Error updating category:", error);
        await bot.answerCallbackQuery(query.id, {
          text: "❌ Ошибка при установке категории",
          show_alert: true,
        });
      }
    }
  };
}
