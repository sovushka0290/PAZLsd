#!/usr/bin/env bash

# =========================================================
# PAZL Marketplace B2B Automated Linux Server Deploy Script
# =========================================================

set -e

echo "🚀 Начинаем деплой PAZL Marketplace B2B..."

# 1. Проверяем наличие .env
if [ ! -f .env ]; then
  echo "⚠️ Файл .env не найден. Создаем из шаблона .env.production.example..."
  cp .env.production.example .env
fi

# 2. Обновляем код из Git
echo "📥 Получение свежих изменений из репозитория..."
git pull origin main

# 3. Установка зависимостей
echo "📦 Установка npm зависимостей..."
npm install --omit=dev --legacy-peer-deps || npm install

# 4. Сборка продакшн бандла Nuxt
echo "🔨 Сборка проекта Nuxt..."
npm run build

# 5. Перезапуск PM2 (или вывод подсказки для Docker)
if command -v pm2 &> /dev/null; then
  echo "🔄 Перезапуск приложения в PM2..."
  pm2 restart pazl-web || pm2 start .output/server/index.mjs --name "pazl-web"
  pm2 save
  echo "✅ Деплой успешно завершен через PM2!"
elif command -v docker-compose &> /dev/null; then
  echo "🐳 Перезапуск приложения через Docker Compose..."
  docker-compose down
  docker-compose up -d --build
  echo "✅ Деплой успешно завершен через Docker Compose!"
else
  echo "✅ Сборка готова! Запустите сервис командой: node .output/server/index.mjs"
fi
