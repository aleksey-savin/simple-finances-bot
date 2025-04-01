import { CommandContext, BUTTONS } from "../types";

export function setupHelpCommand({ bot }: CommandContext) {
  // Match both the /help command and the "Помощь" button text
  bot.onText(new RegExp(`\\/help|${BUTTONS.HELP}`), (msg) => {
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

5. Кнопка "${BUTTONS.HELP}":
   Показывает эту справку

Дополнительные команды:
/start - Перезапустить бота
/help - Показать эту справку
/clear - Очистить историю расходов (будьте осторожны!)
    `;

    bot.sendMessage(chatId, helpText);
  });
}
