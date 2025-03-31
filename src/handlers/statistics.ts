import { eq, and, sql } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { expenses } from "../db/schema";
import { getDateFilter } from "../utils/date";

interface CategoryStat {
  category: string | null;
  sum: number;
}

interface Statistics {
  total: number;
  byCategory: CategoryStat[];
}

export async function getStatistics(
  db: BetterSQLite3Database,
  userId: string,
  period: "day" | "week" | "month",
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
