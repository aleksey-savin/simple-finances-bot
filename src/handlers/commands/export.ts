import { CommandContext } from "../types";
import { eq } from "drizzle-orm";
import { expenses } from "../../db/schema";
import { createObjectCsvStringifier } from "csv-writer";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export async function exportUserData(
  context: CommandContext,
  chatId: number,
): Promise<void> {
  const { bot, db } = context;

  try {
    // Отправляем сообщение о начале экспорта
    await bot.sendMessage(chatId, "🔄 Подготовка экспорта данных...");

    // Получаем все расходы пользователя
    const userExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, chatId.toString()))
      .orderBy(expenses.date);

    if (userExpenses.length === 0) {
      await bot.sendMessage(chatId, "📭 У вас пока нет данных для экспорта.");
      return;
    }

    // Создаем CSV строку с заголовками
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: "id", title: "ID" },
        { id: "amount", title: "Сумма" },
        { id: "description", title: "Описание" },
        { id: "date", title: "Дата" },
        { id: "category", title: "Категория" },
      ],
    });

    // Форматируем данные - преобразуем даты, заменяем null значения и т.д.
    const formattedExpenses = userExpenses.map((expense) => ({
      ...expense,
      date: new Date(expense.date).toLocaleString(),
      category: expense.category || "Без категории",
    }));

    // Создаем CSV контент
    const csvContent =
      csvStringifier.getHeaderString() +
      csvStringifier.stringifyRecords(formattedExpenses);

    // Готовим имя файла с текущей датой
    const now = new Date();
    const fileName = `expenses_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}.csv`;

    // Создаем временный файл
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, fileName);

    // Записываем CSV в файл
    fs.writeFileSync(filePath, csvContent);

    // Отправляем файл с использованием рекомендуемого подхода
    await bot.sendDocument(
      chatId,
      fs.createReadStream(filePath),
      {
        caption: `📊 Экспорт данных (${userExpenses.length} записей)`,
      },
      {
        // Явно указываем mime-тип и имя файла
        filename: fileName,
        contentType: "text/csv",
      },
    );

    // Удаляем временный файл после отправки
    fs.unlinkSync(filePath);

    await bot.sendMessage(chatId, "✅ Экспорт данных успешно завершен!");
  } catch (error) {
    console.error("Error exporting data:", error);
    await bot.sendMessage(
      chatId,
      "❌ Произошла ошибка при экспорте данных. Попробуйте позже.",
    );
  }
}

export function setupExportCommand(context: CommandContext): void {
  const { bot } = context;

  // Устанавливаем обработчик для команды /export
  bot.onText(/\/export/, async (msg) => {
    const chatId = msg.chat.id;
    await exportUserData(context, chatId);
  });
}
