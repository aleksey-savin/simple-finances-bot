import { CommandContext } from "../types";
import { setupCategoryCallback } from "./categoryCallback";
import { setupStatisticsCallback } from "./statisticsCallback";
import { setupHistoryCallback } from "./historyCallback";

import { CATEGORY_ACTIONS } from "../commands/categories";
import { PERIOD_ACTIONS } from "../commands/statistics";
import { HISTORY_ACTIONS } from "../commands/history";

export function setupCallbackHandlers(context: CommandContext) {
  const categoryCallback = setupCategoryCallback(context);
  const statisticsCallback = setupStatisticsCallback(context);
  const historyCallback = setupHistoryCallback(context);

  return {
    setup: () => {
      context.bot.on("callback_query", async (query) => {
        if (!query.data) return;

        // Обработка callback-запросов для категорий
        if (
          query.data.startsWith("cat_") ||
          query.data.startsWith("delete_category_") ||
          Object.values(CATEGORY_ACTIONS).includes(query.data as any)
        ) {
          await categoryCallback(query);
          return;
        }

        // Обработка callback-запросов для статистики
        if (Object.values(PERIOD_ACTIONS).includes(query.data as any)) {
          await statisticsCallback(query);
          return;
        }

        // Обработка callback-запросов для истории
        if (
          query.data.startsWith("history_") ||
          Object.values(HISTORY_ACTIONS).includes(query.data as any)
        ) {
          await historyCallback(query);
          return;
        }
      });
    },
  };
}
