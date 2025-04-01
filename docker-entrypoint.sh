#!/bin/sh

# Инициализируем базу данных
echo "Initializing database..."
node dist/db/init.js

# Запускаем приложение
echo "Starting the bot..."
exec npm start
