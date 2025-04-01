import { CommandContext, BUTTONS } from "../types";

export function setupStartCommand({ bot }: CommandContext) {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const keyboard = {
      keyboard: [
        [{ text: BUTTONS.CATEGORIZE }],
        [{ text: BUTTONS.STATISTICS }],
        [{ text: BUTTONS.MANAGE_CATEGORIES }],
        [{ text: BUTTONS.CLEAR_HISTORY }],
      ],
      resize_keyboard: true,
    };

    bot.sendMessage(
      chatId,
      'Привет! Я помогу вам вести учет расходов. \n\nПросто отправьте мне сумму и описание расхода, например:\n"5000 продукты"',
      {
        reply_markup: keyboard,
      },
    );
  });
}
