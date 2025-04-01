#!/bin/bash

# Проверяем, что скрипт запущен с sudo
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (with sudo)"
  exit 1
fi

# Создаем необходимые директории
mkdir -p /opt/backups/simple-finances-bot/pre-deploy
mkdir -p /opt/scripts

# Устанавливаем владельца
chown -R github-runner:github-runner /opt/backups/simple-finances-bot
chown -R github-runner:github-runner /opt/scripts

# Устанавливаем права
chmod -R 755 /opt/backups/simple-finances-bot
chmod -R 755 /opt/scripts

# Проверяем результат
echo "Checking permissions..."
ls -la /opt/backups/simple-finances-bot
ls -la /opt/scripts

echo "Done! The system is ready for deployments"
