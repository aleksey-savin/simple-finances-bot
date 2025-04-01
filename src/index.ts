import TelegramBot from "node-telegram-bot-api";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { setupCommands } from "./handlers/commands";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
  throw new Error("BOT_TOKEN must be provided!");
}

const dbPath =
  process.env.DB_PATH || path.join(__dirname, "../data/expenses.db");
console.log("Using database at:", dbPath);

const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

const bot = new TelegramBot(TOKEN, { polling: true });

const context = { bot, db };
const handlers = setupCommands(context);

// Настраиваем обработчики
handlers.setupCallbacks();
handlers.setupMessageHandlers();

console.log("Bot started successfully!");

// Обработка ошибок
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});
