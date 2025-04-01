#!/bin/bash

BACKUP_DIR="/opt/backups/telegram-bot/pre-deploy"
APP_DATA_DIR="/opt/telegram-bot/data"

# Функция для отката к конкретному бэкапу
do_rollback() {
    local backup_file=$1

    if [ ! -f "$backup_file" ]; then
        echo "❌ Backup file not found: $backup_file"
        exit 1
    }

    echo "Starting rollback process..."

    # Останавливаем контейнеры
    docker compose down

    # Сохраняем текущую версию базы как дополнительный бэкап
    timestamp=$(date +%Y%m%d_%H%M%S)
    if [ -f "$APP_DATA_DIR/expenses.db" ]; then
        cp "$APP_DATA_DIR/expenses.db" "$BACKUP_DIR/expenses_pre_rollback_${timestamp}.db"
    fi

    # Восстанавливаем базу из бэкапа
    cp "$backup_file" "$APP_DATA_DIR/expenses.db"

    # Перезапускаем контейнеры
    docker compose up -d

    echo "✅ Rollback completed successfully"
}
