import Database from "better-sqlite3";
import { Migration, migrations } from "./index";
import { loggers } from "../../utils/logger";

export class Migrator {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  async initialize() {
    loggers.db.debug("Creating migrations table if not exists");
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
    const version = result ? (result as { version: number }).version : 0;
    loggers.db.debug("Current database version", { version });
    return version;
  }

  async migrate() {
    await this.initialize();
    const currentVersion = await this.getCurrentVersion();
    loggers.db.info(`Database migration started`, { currentVersion });

    const pendingMigrations = migrations
      .filter((m) => m.version > currentVersion)
      .sort((a, b) => a.version - b.version);

    if (pendingMigrations.length === 0) {
      loggers.db.info("Database is up to date");
      return;
    }

    loggers.db.info(`Applying migrations`, { count: pendingMigrations.length });

    for (const migration of pendingMigrations) {
      try {
        loggers.db.info(`Applying migration`, { version: migration.version });

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

        loggers.db.info(`Migration successfully applied`, {
          version: migration.version,
        });
      } catch (error) {
        // В случае ошибки откатываем транзакцию
        this.db.exec("ROLLBACK;");
        loggers.db.error(`Error applying migration`, {
          version: migration.version,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
      }
    }

    const newVersion = await this.getCurrentVersion();
    loggers.db.info(`Database migration completed`, {
      fromVersion: currentVersion,
      toVersion: newVersion,
    });
  }

  async rollback(targetVersion?: number) {
    const currentVersion = await this.getCurrentVersion();
    if (currentVersion === 0) {
      loggers.db.info("No migrations to rollback");
      return;
    }

    const migrationsToRollback = migrations
      .filter(
        (m) => m.version <= currentVersion && m.version > (targetVersion || 0),
      )
      .sort((a, b) => b.version - a.version);

    loggers.db.info(`Rolling back migrations`, {
      count: migrationsToRollback.length,
      fromVersion: currentVersion,
      toVersion: targetVersion || 0,
    });

    for (const migration of migrationsToRollback) {
      try {
        loggers.db.info(`Rolling back migration`, {
          version: migration.version,
        });

        this.db.exec("BEGIN TRANSACTION;");

        // Применяем откат
        this.db.exec(migration.down);

        // Удаляем запись о миграции
        this.db
          .prepare("DELETE FROM migrations WHERE version = ?")
          .run(migration.version);

        this.db.exec("COMMIT;");

        loggers.db.info(`Successfully rolled back migration`, {
          version: migration.version,
        });
      } catch (error) {
        this.db.exec("ROLLBACK;");
        loggers.db.error(`Error rolling back migration`, {
          version: migration.version,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
      }
    }

    const newVersion = await this.getCurrentVersion();
    loggers.db.info(`Database rollback completed`, {
      fromVersion: currentVersion,
      toVersion: newVersion,
    });
  }
}
