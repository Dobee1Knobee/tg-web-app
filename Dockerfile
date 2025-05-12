# Базовый образ
FROM node:18

# Рабочая директория внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь проект внутрь контейнера
COPY . .

# Собираем фронт (если нужно)
RUN npm run build

# Открываем порт (важно для Cloud Run)
EXPOSE 8080

# Запускаем сервер
CMD ["node", "server.js"]
