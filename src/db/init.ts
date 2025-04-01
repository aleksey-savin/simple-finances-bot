import Database from "better-sqlite3";
import path from "path";
import { Migrator } from "./migrations/migrator";
import { loggers } from "../utils/logger";

const dbPath =
  process.env.DB_PATH || path.join(__dirname, "../../data/expenses.db");
loggers.db.info("Initializing database", { path: dbPath });

const db = new Database(dbPath);

async function initialize() {
  try {
    const migrator = new Migrator(db);
    await migrator.migrate();
    loggers.db.info("Database initialized successfully");
  } catch (error) {
    loggers.db.error("Error initializing database", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  } finally {
    db.close();
  }
}

initialize();
