import { CommandContext } from "../types";
import { eq } from "drizzle-orm";
import { expenses } from "../../db/schema";

export const HISTORY_ACTIONS = {
  CONFIRM_CLEAR: "confirm_clear",
  CANCEL_CLEAR: "cancel_clear",
} as const;

async function clearHistory(context: CommandContext, chatId: number) {
  const confirmKeyboard = {
    inline_keyboard: [
      [
        {
          text: "❌ Да, удалить все",
          callback_data: HISTORY_ACTIONS.CONFIRM_CLEAR,
        },
        {
          text: "🔙 Отмена",
          callback_data: HISTORY_ACTIONS.CANCEL_CLEAR,
        },
      ],
    ],
  };

  await context.bot.sendMessage(
    chatId,
    "⚠️ Вы уверены, что хотите удалить ВСЮ историю расходов?\n\nЭто действие нельзя отменить!",
    { reply_markup: confirmKeyboard },
  );
}

export function setupHistoryCommands(context: CommandContext) {
  const { bot } = context;

  // Update the command handler to match both text and slash command
  bot.onText(/\/clear|Очистить историю/, async (msg) => {
    const chatId = msg.chat.id;
    await clearHistory(context, chatId);
  });

  return {
    clearHistory,
  };
}
