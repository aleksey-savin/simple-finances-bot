#!/bin/bash

if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (with sudo)"
  exit 1
fi

echo "🚀 Starting server initialization..."

# Определяем директории
BACKUP_DIR="/opt/backups/telegram-bot/pre-deploy"
APP_DIR="/opt/simple-finances-bot"
APP_DATA_DIR="$APP_DIR/data"
SCRIPTS_DIR="/scripts"
RUNNER_DIR="/opt/actions-runner"
RUNNER_WORK_DIR="$RUNNER_DIR/_work"

echo "📁 Creating directories..."
mkdir -p $BACKUP_DIR
mkdir -p $APP_DIR
mkdir -p $APP_DATA_DIR
mkdir -p $SCRIPTS_DIR
mkdir -p $RUNNER_WORK_DIR

echo "👤 Setting up permissions..."
# Устанавливаем владельца
chown -R github-runner:github-runner /opt/backups
chown -R github-runner:github-runner $APP_DIR
chown -R github-runner:github-runner $SCRIPTS_DIR
chown -R github-runner:github-runner $RUNNER_DIR

# Устанавливаем права
chmod -R 755 /opt/backups
chmod -R 755 $APP_DIR
chmod -R 755 $SCRIPTS_DIR
chmod -R 755 $RUNNER_DIR

echo "🐳 Setting up Docker permissions..."
usermod -aG docker github-runner

echo "📝 Creating required files..."
touch $APP_DATA_DIR/expenses.db
chown github-runner:github-runner $APP_DATA_DIR/expenses.db
chmod 644 $APP_DATA_DIR/expenses.db

echo "✅ Checking results..."
echo "Directory permissions:"
ls -la /opt/backups/telegram-bot
ls -la $APP_DIR
ls -la $SCRIPTS_DIR
ls -la $RUNNER_DIR

echo "Docker group membership:"
groups github-runner

echo "🔍 Verifying access..."
sudo -u github-runner docker ps
sudo -u github-runner docker compose version

echo "Done! The system is ready for deployments"
