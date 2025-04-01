import { CommandContext } from "../types";
import { eq, and, sql } from "drizzle-orm";
import { expenses } from "../../db/schema";
import { loggers } from "../../utils/logger";

export interface CategoryStat {
  category: string | null;
  sum: number;
}

export interface Statistics {
  total: number;
  byCategory: CategoryStat[];
}

export type StatsPeriod = "day" | "week" | "month";

export const PERIOD_ACTIONS = {
  DAY: "stats_day",
  WEEK: "stats_week",
  MONTH: "stats_month",
} as const;

function getDateFilter(period: StatsPeriod): string {
  const date = new Date();
  switch (period) {
    case "day":
      date.setHours(0, 0, 0, 0);
      break;
    case "week":
      date.setDate(date.getDate() - 7);
      break;
    case "month":
      date.setMonth(date.getMonth() - 1);
      break;
  }
  return date.toISOString();
}

export async function getStatistics(
  db: CommandContext["db"],
  userId: string,
  period: StatsPeriod,
): Promise<Statistics> {
  const dateFilter = getDateFilter(period);

  const totalExpenses = await db
    .select({
      sum: sql`COALESCE(sum(${expenses.amount}), 0)`.mapWith(Number),
    })
    .from(expenses)
    .where(and(eq(expenses.userId, userId), sql`date >= ${dateFilter}`));

  const categoryStats = await db
    .select({
      category: expenses.category,
      sum: sql`COALESCE(sum(${expenses.amount}), 0)`.mapWith(Number),
    })
    .from(expenses)
    .where(and(eq(expenses.userId, userId), sql`date >= ${dateFilter}`))
    .groupBy(expenses.category);

  return {
    total: totalExpenses[0]?.sum || 0,
    byCategory: categoryStats,
  };
}

export async function formatStatistics(
  stats: Statistics,
  period: StatsPeriod,
): Promise<string> {
  const periodText = {
    day: "за сегодня",
    week: "за неделю",
    month: "за месяц",
  }[period];

  const date = new Date();
  const dateText = {
    day: date.toLocaleDateString(),
    week: `${new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} - ${date.toLocaleDateString()}`,
    month: `${new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()} - ${date.toLocaleDateString()}`,
  }[period];

  let message = `📊 Статистика расходов ${periodText}\n`;
  message += `📅 Период: ${dateText}\n\n`;
  message += `💰 Общая сумма: ${stats.total}₽\n\n`;

  if (stats.byCategory.length > 0) {
    message += "📋 По категориям:\n";
    stats.byCategory
      .sort((a, b) => b.sum - a.sum) // сортировка по убыванию суммы
      .forEach((stat) => {
        const categoryName = stat.category || "Без категории";
        const percentage = ((stat.sum / stats.total) * 100).toFixed(1);
        const progressBar = getProgressBar(parseFloat(percentage));
        message += `${categoryName}: ${stat.sum}₽ (${percentage}%)\n${progressBar}\n`;
      });
  } else {
    message += "📭 Нет расходов по категориям";
  }

  return message;
}

function getProgressBar(percentage: number): string {
  const fullBlocks = Math.floor(percentage / 10);
  const emptyBlocks = 10 - fullBlocks;
  return "▓".repeat(fullBlocks) + "░".repeat(emptyBlocks);
}

async function showPeriodSelector(bot: CommandContext["bot"], chatId: number) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: "За сегодня", callback_data: PERIOD_ACTIONS.DAY },
        { text: "За неделю", callback_data: PERIOD_ACTIONS.WEEK },
        { text: "За месяц", callback_data: PERIOD_ACTIONS.MONTH },
      ],
    ],
  };

  await bot.sendMessage(chatId, "Выберите период для просмотра статистики:", {
    reply_markup: keyboard,
  });
}

export function setupStatisticsCommands(context: CommandContext) {
  const { bot } = context;

  // Обработчик команды статистики
  bot.onText(/statistics|Статистика/, async (msg) => {
    const chatId = msg.chat.id;
    await showPeriodSelector(bot, chatId);
  });

  // Обработчик выбора периода
  bot.on("callback_query", async (query) => {
    if (!query.data || !query.message) return;
    if (!Object.values(PERIOD_ACTIONS).includes(query.data as any)) return;

    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    let period: "day" | "week" | "month";
    switch (query.data) {
      case PERIOD_ACTIONS.DAY:
        period = "day";
        break;
      case PERIOD_ACTIONS.WEEK:
        period = "week";
        break;
      case PERIOD_ACTIONS.MONTH:
        period = "month";
        break;
      default:
        return;
    }

    try {
      const stats = await getStatistics(context.db, chatId.toString(), period);
      const message = await formatStatistics(stats, period);

      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "HTML",
      });

      await bot.answerCallbackQuery(query.id);
    } catch (error) {
      loggers.expenses.error(`Error getting statistics`, {
        userId: chatId.toString(),
        error: error instanceof Error ? error.message : String(error),
      });
      await bot.answerCallbackQuery(query.id, {
        text: "❌ Ошибка при получении статистики",
        show_alert: true,
      });
    }
  });

  return {
    getStatistics,
    formatStatistics,
  };
}
