#!/bin/bash
set -e  # если ошибка — сразу выходим

# === ⚙️ Настройки ===
PROJECT_ID="carwash-master"
SERVICE_NAME="frontend-bot"
REGION="us-central1"
IMAGE="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"

echo "🚀 Деплой фронтенда $SERVICE_NAME в проект $PROJECT_ID ($REGION)"
echo "============================================"

# 1️⃣ Авторизация в gcloud (если не авторизован)
echo "✅ Авторизация gcloud..."
gcloud auth login
gcloud config set project $PROJECT_ID

# 2️⃣ Создаём билдер для Docker Buildx (если ещё нет)
docker buildx create --use --name cloudrun-builder || docker buildx use cloudrun-builder

# 3️⃣ Сборка Docker-образа под linux/amd64 и пуш
echo "🐳 Собираем Docker-образ для linux/amd64 и пушим..."
docker buildx build --platform linux/amd64 -t $IMAGE --push .

# 4️⃣ Деплой на Cloud Run
echo "🚀 Деплой на Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated

echo "✅ Готово! Сервис задеплоен: https://$SERVICE_NAME-$REGION.a.run.app"
