import { CommandContext, BUTTONS } from "../types";
import { loggers } from "../../utils/logger";

export function setupStartCommand({ bot }: CommandContext) {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    loggers.bot.info(`Bot started by user`, {
      userId: chatId.toString(),
    });

    const keyboard = {
      keyboard: [
        [{ text: BUTTONS.CATEGORIZE }, { text: BUTTONS.STATISTICS }],
        [{ text: BUTTONS.MANAGE_CATEGORIES }, { text: BUTTONS.HELP }],
      ],
      resize_keyboard: true,
    };

    bot.sendMessage(
      chatId,
      'Привет! Я помогу вам вести учет расходов. \n\nПросто отправьте мне сумму и описание расхода, например:\n"1000 продукты"',
      {
        reply_markup: keyboard,
      },
    );
  });
}
