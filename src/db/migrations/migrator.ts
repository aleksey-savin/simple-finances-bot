import Database from "better-sqlite3";
import { Migration, migrations } from "./index";

export class Migrator {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  async initialize() {
    // Создаем таблицу для отслеживания версии БД
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER NOT NULL,
        applied_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  async getCurrentVersion(): Promise<number> {
    const result = this.db
      .prepare("SELECT version FROM migrations ORDER BY version DESC LIMIT 1")
      .get();
    return result ? (result as { version: number }).version : 0;
  }

  async migrate() {
    await this.initialize();
    const currentVersion = await this.getCurrentVersion();
    console.log(`Current database version: ${currentVersion}`);

    const pendingMigrations = migrations
      .filter((m) => m.version > currentVersion)
      .sort((a, b) => a.version - b.version);

    if (pendingMigrations.length === 0) {
      console.log("Database is up to date");
      return;
    }

    console.log(`Applying ${pendingMigrations.length} migration(s)...`);

    for (const migration of pendingMigrations) {
      try {
        console.log(`Applying migration version ${migration.version}...`);

        // Начинаем транзакцию
        this.db.exec("BEGIN TRANSACTION;");

        // Применяем миграцию
        this.db.exec(migration.up);

        // Записываем версию
        this.db
          .prepare("INSERT INTO migrations (version) VALUES (?)")
          .run(migration.version);

        // Завершаем транзакцию
        this.db.exec("COMMIT;");

        console.log(
          `Successfully applied migration version ${migration.version}`,
        );
      } catch (error) {
        // В случае ошибки откатываем транзакцию
        this.db.exec("ROLLBACK;");
        console.error(
          `Error applying migration version ${migration.version}:`,
          error,
        );
        throw error;
      }
    }

    const newVersion = await this.getCurrentVersion();
    console.log(`Database migrated to version ${newVersion}`);
  }

  async rollback(targetVersion?: number) {
    const currentVersion = await this.getCurrentVersion();
    if (currentVersion === 0) {
      console.log("No migrations to rollback");
      return;
    }

    const migrationsToRollback = migrations
      .filter(
        (m) => m.version <= currentVersion && m.version > (targetVersion || 0),
      )
      .sort((a, b) => b.version - a.version);

    for (const migration of migrationsToRollback) {
      try {
        console.log(`Rolling back migration version ${migration.version}...`);

        this.db.exec("BEGIN TRANSACTION;");

        // Применяем откат
        this.db.exec(migration.down);

        // Удаляем запись о миграции
        this.db
          .prepare("DELETE FROM migrations WHERE version = ?")
          .run(migration.version);

        this.db.exec("COMMIT;");

        console.log(
          `Successfully rolled back migration version ${migration.version}`,
        );
      } catch (error) {
        this.db.exec("ROLLBACK;");
        console.error(
          `Error rolling back migration version ${migration.version}:`,
          error,
        );
        throw error;
      }
    }
  }
}
