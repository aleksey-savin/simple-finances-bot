import { CommandContext, BUTTONS } from "../types";

export function setupHelpCommand({ bot }: CommandContext) {
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpText = `
Как пользоваться ботом:

1. Добавить расход:
   Просто напишите сумму и описание
   Например: "1000 продукты" или "500 такси"

2. Кнопка "${BUTTONS.CATEGORIZE}":
   Позволяет указать категории для расходов

3. Кнопка "${BUTTONS.STATISTICS}":
   Показывает статистику расходов

4. Кнопка "${BUTTONS.MANAGE_CATEGORIES}":
   Управление своими категориями расходов

5. Кнопка "${BUTTONS.CLEAR_HISTORY}":
   Удаление всей истории расходов

Дополнительные команды:
/start - Перезапустить бота
/help - Показать эту справку
    `;

    bot.sendMessage(chatId, helpText);
  });
}
