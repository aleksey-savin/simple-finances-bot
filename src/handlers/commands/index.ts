import { CommandContext, CommandHandlers } from "../types";
import { setupStartCommand } from "./start";
import { setupHelpCommand } from "./help";
import { setupStatisticsCommands } from "./statistics";
import { setupExpenseHandler } from "./expenses";
import { setupCategoryCommands } from "./categories";
import { setupHistoryCommands } from "./history";
import { setupCallbackHandlers } from "../callbacks";
import { setupExportCommand } from "./export";

export function setupCommands(context: CommandContext): CommandHandlers {
  // Настраиваем обработчики команд
  setupStartCommand(context);
  setupHelpCommand(context);
  setupStatisticsCommands(context);
  setupExpenseHandler(context);
  setupCategoryCommands(context);
  setupHistoryCommands(context);
  setupExportCommand(context);

  // Настраиваем обработчики callback-запросов
  const callbackHandlers = setupCallbackHandlers(context);

  return {
    setupCallbacks: () => callbackHandlers.setup(),
    setupMessageHandlers: () => {
      // Дополнительная настройка обработчиков сообщений, если необходимо
    },
  };
}
