#!/bin/bash

# Подключаем вспомогательные скрипты
source /scripts/utils/check-prerequisites.sh

# Конфигурация
BACKUP_DIR="/opt/backups/simple-finances-bot/pre-deploy"
APP_DATA_DIR="/opt/simple-finances-bot/data"
WORK_DIR="/opt/actions-runner/_work/simple-finances-bot/simple-finances-bot"
LOG_FILE="/var/log/simple-finances-bot-deploy.log"

# Функция для логирования
log() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $message" | tee -a "$LOG_FILE"
}

# Функция для создания бэкапа
create_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/expenses_$timestamp.db"

    if [ -f "$APP_DATA_DIR/expenses.db" ]; then
        cp "$APP_DATA_DIR/expenses.db" "$backup_file"
        if [ $? -eq 0 ]; then
            log "✅ Created backup: $backup_file"
            return 0
        else
            log "❌ Failed to create backup"
            return 1
        fi
    else
        log "⚠️ No database file found to backup"
        return 0
    fi
}

# Функция для очистки старых бэкапов
cleanup_old_backups() {
    log "🧹 Cleaning up old backups..."
    find "$BACKUP_DIR" -name "expenses_*.db" -type f -mtime +7 -delete
    find "$BACKUP_DIR" -name "expenses_*.db.gz" -type f -mtime +7 -delete
}

# Функция для проверки здоровья контейнера
check_container_health() {
    local max_attempts=5
    local attempt=1
    local delay=10

    while [ $attempt -le $max_attempts ]; do
        log "Health check attempt $attempt of $max_attempts..."

        if docker compose ps | grep -q "Up"; then
            log "✅ Container is healthy"
            return 0
        fi

        log "⏳ Container not ready, waiting $delay seconds..."
        sleep $delay
        attempt=$((attempt+1))
    done

    log "❌ Container health check failed"
    return 1
}

# Основной процесс развертывания
main() {
    log "🚀 Starting deployment process..."

    # Проверяем prerequisites
    log "🔍 Checking prerequisites..."
    check_prerequisites
    if [ $? -ne 0 ]; then
        log "❌ Prerequisites check failed"
        exit 1
    fi

    # Создаем бэкап
    log "📦 Creating backup..."
    create_backup
    if [ $? -ne 0 ]; then
        log "❌ Backup failed, aborting deployment"
        exit 1
    fi

    # Останавливаем текущие контейнеры
    log "🛑 Stopping current containers..."
    docker compose down
    if [ $? -ne 0 ]; then
        log "⚠️ Failed to stop containers, but continuing..."
    fi

    # Удаляем старые образы
    log "🧹 Cleaning up old images..."
    docker image prune -f

    # Собираем и запускаем новые контейнеры
    log "🏗️ Building and starting containers..."
    if ! docker compose up -d --build; then
        log "❌ Failed to start containers"
        exit 1
    fi

    # Проверяем здоровье контейнера
    log "🏥 Checking container health..."
    if ! check_container_health; then
        log "❌ Container failed health check"
        log "📋 Container logs:"
        docker compose logs
        exit 1
    fi

    # Очищаем старые бэкапы
    cleanup_old_backups

    log "✅ Deployment completed successfully"
}

# Обработка ошибок
set -e
trap 'log "❌ Error on line $LINENO"' ERR

# Запуск
main "$@"
