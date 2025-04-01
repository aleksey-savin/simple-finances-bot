import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";
import fs from "fs";

// Создаем директорию для логов, если она не существует
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Определяем форматы для различных типов вывода логов
const formats = {
  // Формат для консоли - цветной, с временем и уровнем лога
  console: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      const metaString = Object.keys(meta).length
        ? ` ${JSON.stringify(meta)}`
        : "";
      return `${timestamp} [${level}]: ${message}${metaString}`;
    }),
  ),

  // Формат для файла - JSON для удобства парсинга и анализа
  file: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.json(),
  ),
};

// Создаем транспорт для ротации файлов
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, "application-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m", // Максимальный размер файла перед ротацией
  maxFiles: "14d", // Хранить логи за 14 дней
  format: formats.file,
});

// Создаем транспорт для ошибок
const errorFileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  level: "error",
  format: formats.file,
});

// Настройка логгера
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  defaultMeta: { service: "expenses-bot" },
  transports: [
    // Вывод в консоль всегда
    new winston.transports.Console({
      format: formats.console,
    }),
    // Логирование в файлы, если не в тестах
    ...(process.env.NODE_ENV !== "test"
      ? [fileRotateTransport, errorFileRotateTransport]
      : []),
  ],
  // Обработка исключений
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "exceptions.log"),
    }),
    new winston.transports.Console({
      format: formats.console,
    }),
  ],
  // Не завершать процесс при необработанных исключениях
  exitOnError: false,
});

// Создаем пространства имен для логгера для лучшей организации
export function createNamespace(namespace: string) {
  return {
    debug: (message: string, meta: Record<string, any> = {}) => {
      logger.debug(message, { namespace, ...meta });
    },
    info: (message: string, meta: Record<string, any> = {}) => {
      logger.info(message, { namespace, ...meta });
    },
    warn: (message: string, meta: Record<string, any> = {}) => {
      logger.warn(message, { namespace, ...meta });
    },
    error: (message: string, meta: Record<string, any> = {}) => {
      logger.error(message, { namespace, ...meta });
    },
  };
}

// Логгеры для различных модулей
export const loggers = {
  db: createNamespace("database"),
  bot: createNamespace("bot"),
  expenses: createNamespace("expenses"),
  categories: createNamespace("categories"),
  statistics: createNamespace("statistics"),
  export: createNamespace("export"),
  system: createNamespace("system"),
};

export default logger;
