import Database from "better-sqlite3";
import path from "path";
import { Migrator } from "./migrator";

const dbPath =
  process.env.DB_PATH || path.join(__dirname, "../../../data/expenses.db");
const targetVersion = process.argv[2] ? parseInt(process.argv[2]) : undefined;

async function rollback() {
  const db = new Database(dbPath);

  try {
    const migrator = new Migrator(db);
    await migrator.rollback(targetVersion);
    console.log("Rollback completed successfully");
  } catch (error) {
    console.error("Error during rollback:", error);
    process.exit(1);
  } finally {
    db.close();
  }
}

rollback();
