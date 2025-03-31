import { CommandContext } from "../types";
import { eq, and, isNull } from "drizzle-orm";
import { expenses, userCategories } from "../../db/schema";
import { BUTTONS } from "../types";

export const CATEGORY_ACTIONS = {
  ADD: "add_cat",
  DELETE: "del_cat",
  LIST: "list_cat",
  CANCEL: "cancel_cat",
} as const;

// Set для отслеживания состояния ожидания ввода категории
export const awaitingCategoryInput = new Set<number>();

const DEFAULT_CATEGORIES = [
  "Продукты",
  "Транспорт",
  "Развлечения",
  "Коммунальные услуги",
  "Прочее",
];

export async function getUserCategories(
  db: CommandContext["db"],
  userId: string,
): Promise<string[]> {
  const categories = await db
    .select({ name: userCategories.name })
    .from(userCategories)
    .where(eq(userCategories.userId, userId));

  return categories.map((cat) => cat.name);
}

export async function handleCategories(
  { bot, db }: CommandContext,
  chatId: number,
) {
  try {
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

    const userCategories = await getUserCategories(db, chatId.toString());
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

export async function handleCategoryManagement(
  context: CommandContext,
  action: string,
  chatId: number,
  messageId?: number,
) {
  const { bot, db } = context;

  switch (action) {
    case CATEGORY_ACTIONS.ADD:
      awaitingCategoryInput.add(chatId);
      await bot.sendMessage(chatId, "📝 Отправьте название новой категории:");
      break;

    case CATEGORY_ACTIONS.LIST:
      const categories = await getUserCategories(db, chatId.toString());
      if (categories.length === 0) {
        await bot.sendMessage(chatId, "📭 У вас пока нет категорий.");
        return;
      }

      const categoriesList = categories
        .map((cat, index) => `${index + 1}. ${cat}`)
        .join("\n");

      await bot.sendMessage(chatId, `📋 Ваши категории:\n\n${categoriesList}`);
      break;

    case CATEGORY_ACTIONS.DELETE:
      const userCategories = await getUserCategories(db, chatId.toString());
      if (userCategories.length === 0) {
        await bot.sendMessage(chatId, "📭 У вас пока нет категорий.");
        return;
      }

      const deleteKeyboard = {
        inline_keyboard: userCategories.map((cat) => [
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

    case CATEGORY_ACTIONS.CANCEL:
      awaitingCategoryInput.delete(chatId);
      if (messageId) {
        await bot.editMessageText("🔙 Операция отменена", {
          chat_id: chatId,
          message_id: messageId,
        });
      }
      break;
  }
}

export function setupCategoryCommands(context: CommandContext) {
  const { bot, db } = context;

  // Обработчик команды "Распределить расходы"
  bot.onText(/categorize|Распределить расходы/, async (msg) => {
    const chatId = msg.chat.id;
    await handleCategories(context, chatId);
  });

  // Обработчик команды управления категориями
  bot.onText(new RegExp(BUTTONS.MANAGE_CATEGORIES), async (msg) => {
    const chatId = msg.chat.id;
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "➕ Добавить категорию",
            callback_data: CATEGORY_ACTIONS.ADD,
          },
        ],
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
  });

  // Обработчик сообщений для новых категорий
  bot.on("message", async (msg) => {
    if (!msg.text || msg.text.startsWith("/")) return;
    const chatId = msg.chat.id;
    const text = msg.text.trim();

    // Пропускаем обработку команд кнопок
    if (Object.values(BUTTONS).includes(text as any)) return;

    // Проверяем, ожидаем ли ввод категории
    if (awaitingCategoryInput.has(chatId)) {
      try {
        // Проверяем, не является ли категория числом
        if (!isNaN(Number(text))) {
          await bot.sendMessage(
            chatId,
            "❌ Название категории не может быть числом",
          );
          return;
        }

        await db.insert(userCategories).values({
          name: text,
          userId: chatId.toString(),
        });

        await bot.sendMessage(
          chatId,
          `✅ Категория "${text}" успешно добавлена`,
        );
      } catch (error: any) {
        if (error?.code === "SQLITE_CONSTRAINT") {
          await bot.sendMessage(chatId, "❌ Такая категория уже существует");
        } else {
          console.error("Error adding category:", error);
          await bot.sendMessage(chatId, "❌ Ошибка при добавлении категории");
        }
      } finally {
        // Удаляем состояние ожидания в любом случае
        awaitingCategoryInput.delete(chatId);
      }
    }
  });
}
