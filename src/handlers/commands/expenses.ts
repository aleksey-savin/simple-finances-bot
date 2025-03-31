import { CommandContext, BUTTONS } from "../types";
import { parseExpense } from "../../utils/parser";
import { expenses } from "../../db/schema";
import { awaitingCategoryInput } from "./categories";

export function setupExpenseHandler({ bot, db }: CommandContext) {
  bot.on("message", async (msg) => {
    if (!msg.text || msg.text.startsWith("/")) return;
    const chatId = msg.chat.id;
    const text = msg.text.trim();

    // Пропускаем обработку, если ожидается ввод категории
    if (awaitingCategoryInput.has(chatId)) return;

    // Проверяем, является ли сообщение командой кнопки
    const isButton = Object.values(BUTTONS).includes(text as any);
    if (isButton) return;

    const expense = parseExpense(text);
    if (expense) {
      try {
        await db.insert(expenses).values({
          amount: expense.amount,
          description: expense.description,
          date: new Date().toISOString(),
          userId: chatId.toString(),
        });
        bot.sendMessage(
          chatId,
          `✅ Расход в ${expense.amount}₽ успешно добавлен!`,
        );
      } catch (error) {
        console.error("Error adding expense:", error);
        bot.sendMessage(chatId, "❌ Произошла ошибка при добавлении расхода");
      }
    } else {
      bot.sendMessage(
        chatId,
        '❌ Неправильный формат. Пример: "1000 продукты"',
      );
    }
  });
}
