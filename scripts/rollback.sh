#!/bin/bash

BACKUP_DIR="/opt/backups/simple-finances-bot/pre-deploy"

# Функция для вывода списка доступных бэкапов
list_backups() {
    echo "Available backups:"
    ls -lt $BACKUP_DIR/expenses_*.db | awk '{print NR")", $9}'
}

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
    if [ -f data/expenses.db ]; then
        cp data/expenses.db "$BACKUP_DIR/expenses_pre_rollback_${timestamp}.db"
    fi

    # Восстанавливаем базу из бэкапа
    cp "$backup_file" data/expenses.db

    # Перезапускаем контейнеры
    docker compose up -d

    echo "✅ Rollback completed successfully"
}

# Основной код
if [ "$1" == "list" ]; then
    list_backups
    exit 0
fi

if [ -z "$1" ]; then
    echo "Usage:"
    echo "  $0 list            - show available backups"
    echo "  $0 <backup_file>   - rollback to specific backup"
    echo "  $0 latest          - rollback to latest backup"
    list_backups
    exit 1
fi

if [ "$1" == "latest" ]; then
    latest_backup=$(ls -t $BACKUP_DIR/expenses_*.db | head -1)
    if [ -z "$latest_backup" ]; then
        echo "❌ No backups found"
        exit 1
    fi
    do_rollback "$latest_backup"
else
    do_rollback "$1"
fi
