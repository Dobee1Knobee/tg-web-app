# Базовый образ
FROM node:18-alpine

# Рабочая директория внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --only=production

# Копируем весь проект внутрь контейнера
COPY . .

# Собираем фронт (если нужно)
RUN npm run build

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Открываем порт (важно для Cloud Run)
EXPOSE 8080

# Запускаем сервер
CMD ["node", "server.js"]