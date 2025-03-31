import TelegramBot from "node-telegram-bot-api";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

export interface CommandContext {
  bot: TelegramBot;
  db: BetterSQLite3Database;
}

export interface CommandHandlers {
  setupCallbacks: () => void;
  setupMessageHandlers: () => void;
}

export interface CategoryStat {
  category: string | null;
  sum: number;
}

export interface Statistics {
  total: number;
  byCategory: CategoryStat[];
}

export const BUTTONS = {
  CATEGORIZE: "Распределить расходы",
  STATISTICS: "Статистика",
  CLEAR_HISTORY: "Очистить историю",
  MANAGE_CATEGORIES: "Управление категориями",
} as const;

export const CALLBACKS = {
  CONFIRM_CLEAR: "confirm_clear",
  CANCEL_CLEAR: "cancel_clear",
} as const;
