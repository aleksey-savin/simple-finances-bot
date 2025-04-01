import Database from "better-sqlite3";
import path from "path";
import { Migrator } from "./migrations/migrator";

const dbPath =
  process.env.DB_PATH || path.join(__dirname, "../../data/expenses.db");
console.log("Initializing database at:", dbPath);

const db = new Database(dbPath);

async function initialize() {
  try {
    const migrator = new Migrator(db);
    await migrator.migrate();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  } finally {
    db.close();
  }
}

initialize();
