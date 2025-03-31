import Database from "better-sqlite3";

const db = new Database("expenses.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount INTEGER NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    category TEXT,
    user_id TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    user_id TEXT NOT NULL,
    UNIQUE(name, user_id)
  );
`);

console.log("Database migration completed");
