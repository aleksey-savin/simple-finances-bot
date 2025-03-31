import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  category: text("category"),
  userId: text("user_id").notNull(),
});

export const userCategories = sqliteTable("user_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  userId: text("user_id").notNull(),
});
