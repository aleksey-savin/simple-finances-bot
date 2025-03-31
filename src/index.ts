import TelegramBot from "node-telegram-bot-api";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { setupCommands } from "./handlers/commands";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
  throw new Error("BOT_TOKEN must be provided!");
}

const sqlite = new Database("expenses.db");
const db = drizzle(sqlite);

const bot = new TelegramBot(TOKEN, { polling: true });

const context = { bot, db };
const handlers = setupCommands(context);

// Настраиваем обработчики
handlers.setupCallbacks();
handlers.setupMessageHandlers();

console.log("Bot started successfully!");
