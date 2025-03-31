import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq, and } from "drizzle-orm";
import { userCategories } from "../db/schema";
import TelegramBot from "node-telegram-bot-api";

export const CATEGORY_ACTIONS = {
  ADD: "add_cat",
  DELETE: "del_cat",
  LIST: "list_cat",
  CANCEL: "cancel_cat",
} as const;

export async function getUserCategories(
  db: BetterSQLite3Database,
  userId: string,
): Promise<string[]> {
  const categories = await db
    .select({ name: userCategories.name })
    .from(userCategories)
    .where(eq(userCategories.userId, userId));

  return categories.map((cat) => cat.name);
}

export async function showCategoryMenu(bot: TelegramBot, chatId: number) {
  const keyboard = {
    inline_keyboard: [
      [{ text: "➕ Добавить категорию", callback_data: CATEGORY_ACTIONS.ADD }],
      [
        {
          text: "❌ Удалить категорию",
          callback_data: CATEGORY_ACTIONS.DELETE,
        },
      ],
      [{ text: "📋 Список категорий", callback_data: CATEGORY_ACTIONS.LIST }],
      [{ text: "🔙 Отмена", callback_data: CATEGORY_ACTIONS.CANCEL }],
    ],
  };

  await bot.sendMessage(chatId, "Управление категориями расходов:", {
    reply_markup: keyboard,
  });
}

export async function handleCategoryManagement(
  bot: TelegramBot,
  db: BetterSQLite3Database,
  action: string,
  chatId: number,
  messageId?: number,
) {
  switch (action) {
    case CATEGORY_ACTIONS.ADD:
      await bot.sendMessage(chatId, "Отправьте название новой категории:");
      // Устанавливаем флаг ожидания ввода категории
      await bot.sendMessage(
        chatId,
        "⚠️ Следующее сообщение будет распознано как название категории",
        { reply_markup: { force_reply: true } },
      );
      break;

    case CATEGORY_ACTIONS.DELETE:
      const categories = await getUserCategories(db, chatId.toString());
      if (categories.length === 0) {
        await bot.sendMessage(chatId, "У вас пока нет категорий.");
        return;
      }

      const deleteKeyboard = {
        inline_keyboard: categories.map((cat) => [
          {
            text: `❌ ${cat}`,
            callback_data: `delete_category_${cat}`,
          },
        ]),
      };

      await bot.sendMessage(chatId, "Выберите категорию для удаления:", {
        reply_markup: deleteKeyboard,
      });
      break;

    case CATEGORY_ACTIONS.LIST:
      const userCategories = await getUserCategories(db, chatId.toString());
      if (userCategories.length === 0) {
        await bot.sendMessage(chatId, "У вас пока нет категорий.");
        return;
      }

      const categoriesList = userCategories
        .map((cat, index) => `${index + 1}. ${cat}`)
        .join("\n");

      await bot.sendMessage(chatId, `📋 Ваши категории:\n\n${categoriesList}`);
      break;

    case CATEGORY_ACTIONS.CANCEL:
      if (messageId) {
        await bot.editMessageText("🔙 Операция отменена", {
          chat_id: chatId,
          message_id: messageId,
        });
      }
      break;
  }
}
