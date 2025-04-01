FROM node:20-alpine

# Создаем директорию приложения
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Собираем TypeScript
RUN npm run build

# Создаем директорию для базы данных
RUN mkdir -p /app/data

# Добавляем скрипт инициализации
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Запускаем приложение через entrypoint скрипт
ENTRYPOINT ["/docker-entrypoint.sh"]
