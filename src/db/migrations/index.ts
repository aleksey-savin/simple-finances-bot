export interface Migration {
  version: number;
  up: string;
  down: string;
}

export const migrations: Migration[] = [
  {
    version: 1,
    up: `
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
    `,
    down: `
      DROP TABLE IF EXISTS expenses;
      DROP TABLE IF EXISTS user_categories;
    `,
  },
  /* Пример следующей миграции
  {
    version: 2,
    up: `
      -- Добавляем новые поля или таблицы
      ALTER TABLE expenses ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP;
    `,
    down: `
      -- Откатываем изменения
      -- SQLite не поддерживает DROP COLUMN, поэтому нужно будет пересоздавать таблицу
      -- или оставить колонку
    `,
    }, */
];
