import { eq, and, isNull } from "drizzle-orm";
import TelegramBot from "node-telegram-bot-api";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { expenses } from "../db/schema";
import { getUserCategories } from "./categoryManagement";

// Дефолтные категории будут использоваться только если у пользователя нет своих
const DEFAULT_CATEGORIES = [
  "Продукты",
  "Транспорт",
  "Развлечения",
  "Коммунальные услуги",
  "Прочее",
];

export async function handleCategories(
  bot: TelegramBot,
  db: BetterSQLite3Database,
  chatId: number,
) {
  try {
    // Получаем расходы без категорий
    const uncategorizedExpenses = await db
      .select()
      .from(expenses)
      .where(
        and(isNull(expenses.category), eq(expenses.userId, chatId.toString())),
      );

    if (uncategorizedExpenses.length === 0) {
      await bot.sendMessage(chatId, "✨ Нет расходов без категории!");
      return;
    }

    // Получаем пользовательские категории
    const userCategories = await getUserCategories(db, chatId.toString());

    // Используем пользовательские категории или дефолтные, если своих нет
    const categoriesToUse =
      userCategories.length > 0 ? userCategories : DEFAULT_CATEGORIES;

    for (const expense of uncategorizedExpenses) {
      const keyboard = {
        inline_keyboard: categoriesToUse.map((cat) => [
          {
            text: cat,
            callback_data: `cat_${expense.id}_${cat}`,
          },
        ]),
      };

      await bot.sendMessage(
        chatId,
        `💰 Расход: ${expense.amount}₽\n📝 Описание: ${expense.description}\n📅 Дата: ${new Date(expense.date).toLocaleDateString()}\n\nВыберите категорию:`,
        { reply_markup: keyboard },
      );
    }
  } catch (error) {
    console.error("Error in handleCategories:", error);
    await bot.sendMessage(
      chatId,
      "❌ Произошла ошибка при обработке категорий",
    );
  }
}
