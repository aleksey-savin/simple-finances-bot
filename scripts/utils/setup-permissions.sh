#!/bin/bash

# Проверяем, что скрипт запущен с sudo
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (with sudo)"
  exit 1
fi

# Создаем необходимые директории
mkdir -p /opt/backups/telegram-bot/pre-deploy
mkdir -p /opt/telegram-bot/data
mkdir -p /opt/scripts

# Устанавливаем владельца
chown -R github-runner:github-runner /opt/backups/telegram-bot
chown -R github-runner:github-runner /opt/telegram-bot
chown -R github-runner:github-runner /opt/scripts

# Устанавливаем права
chmod -R 755 /opt/backups/telegram-bot
chmod -R 755 /opt/telegram-bot
chmod -R 755 /opt/scripts

echo "Done! The system is ready for deployments"
