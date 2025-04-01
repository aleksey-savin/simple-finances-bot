#!/bin/bash

# Подключаем вспомогательные скрипты
source /scripts/utils/check-prerequisites.sh

echo "🔍 Checking prerequisites..."
check_prerequisites

echo "🚀 Starting deployment..."

# Проверяем наличие .env файла
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    exit 1
fi

# Создаем директорию для данных, если её нет
mkdir -p data
chmod 777 data

# Остановка и удаление старых контейнеров
docker compose down

# Удаление старых образов
docker image prune -f

# Сборка и запуск новых контейнеров
docker compose up -d --build

# Ждем немного, чтобы контейнер успел запуститься
sleep 5

# Проверяем логи на наличие ошибок
docker compose logs

echo "✅ Deployment completed"
