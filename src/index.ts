import TelegramBot from "node-telegram-bot-api";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { setupCommands } from "./handlers/commands";
import dotenv from "dotenv";
import path from "path";
import * as fs from "fs";
import * as schema from "./db/schema";
import { loggers } from "./utils/logger";

dotenv.config();

// Get token and provide type assertion
const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
  throw new Error("BOT_TOKEN must be provided!");
}

// Use a clean token variable that's definitely not undefined
const botToken: string = TOKEN;

// Используем путь к базе данных из переменных окружения или по умолчанию
const dbPath =
  process.env.DB_PATH || path.join(__dirname, "../data/expenses.db");
console.log("Using database at:", dbPath);

// Создаем директорию для базы данных если её нет
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let sqlite: Database.Database;
let db: ReturnType<typeof drizzle<typeof schema>>;
let bot: TelegramBot;

function setupBot() {
  loggers.system.info("Setting up bot...");

  // Initialize database
  sqlite = new Database(dbPath);
  db = drizzle(sqlite, { schema });

  // Initialize bot with the token that we know is not undefined
  bot = new TelegramBot(botToken, { polling: true });

  const context = { bot, db };
  const handlers = setupCommands(context);

  // Set up handlers
  handlers.setupCallbacks();
  handlers.setupMessageHandlers();

  loggers.system.info("Bot started successfully!", { dbPath });

  return { bot, db, sqlite };
}

// Set up the bot
const { bot: runningBot, db: runningDb, sqlite: runningSqlite } = setupBot();

// Handle shutdown gracefully
function shutdown() {
  loggers.system.info("Shutting down bot...");
  if (runningBot) {
    runningBot.stopPolling();
  }
  if (runningSqlite) {
    runningSqlite.close();
  }
  loggers.system.info("Bot shutdown complete");
}

// Handle process termination
process.on("SIGINT", () => {
  console.log("Received SIGINT signal");
  shutdown();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Received SIGTERM signal");
  shutdown();
  process.exit(0);
});

// Handle uncaught exceptions and rejections
process.on("uncaughtException", (error) => {
  loggers.system.error("Uncaught Exception", {
    error: error.message,
    stack: error.stack,
  });
  shutdown();
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  loggers.system.error("Unhandled Rejection", {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
});
