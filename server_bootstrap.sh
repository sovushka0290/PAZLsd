#!/usr/bin/env bash
###############################################################################
# PAZL SERVER BOOTSTRAP — Полная настройка сервера с нуля
# Сервер: 91.217.10.143 | Ubuntu | 6 vCPU / 16 GB RAM / 216 GB SSD
#
# ЗАПУСК: скопировать весь файл и вставить в терминал сервера:
#   ssh root@91.217.10.143
#   <вставить весь скрипт>
#
# Скрипт делает:
#   1. Обновляет ОС
#   2. Устанавливает Docker + Docker Compose
#   3. Настраивает Firewall (UFW)
#   4. Устанавливает Fail2ban
#   5. Создаёт структуру каталогов
#   6. Клонирует репозиторий PAZLsd
#   7. Создаёт docker-compose.yml, nginx.conf, .env
#   8. Собирает и запускает всё
#   9. Настраивает автобэкапы (cron)
###############################################################################

set -euo pipefail

echo "============================================"
echo "🚀 PAZL Server Bootstrap — Начало установки"
echo "============================================"

# ─── Переменные ──────────────────────────────────────────────────────────────
PAZL_DIR="/opt/pazl"
DATA_DIR="/data"
GITHUB_REPO="https://github.com/sovushka0290/PAZLsd.git"
DOMAIN="_"  # Пока по IP, домен привяжем позже
SERVER_IP="91.217.10.143"

# Генерируем надёжные пароли
DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
REDIS_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
NUXT_SECRET=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 48)

# ─── Фаза 1: Обновление ОС ──────────────────────────────────────────────────
echo ""
echo "📦 [1/9] Обновление ОС..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl wget git nano htop unzip software-properties-common \
  ca-certificates gnupg lsb-release ufw fail2ban

echo "✅ ОС обновлена и базовые пакеты установлены"

# ─── Фаза 2: Firewall (UFW) ─────────────────────────────────────────────────
echo ""
echo "🔒 [2/9] Настройка Firewall (UFW)..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
echo "y" | ufw enable
ufw status verbose

echo "✅ Firewall активирован (открыты только 22, 80, 443)"

# ─── Фаза 3: Fail2ban ───────────────────────────────────────────────────────
echo ""
echo "🛡️ [3/9] Настройка Fail2ban..."
cat > /etc/fail2ban/jail.local << 'JAIL'
[DEFAULT]
bantime  = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port    = ssh
filter  = sshd
logpath = /var/log/auth.log
maxretry = 3
JAIL

systemctl enable fail2ban
systemctl restart fail2ban

echo "✅ Fail2ban включён (блокировка после 3 неудачных SSH-попыток)"

# ─── Фаза 4: Docker + Docker Compose ────────────────────────────────────────
echo ""
echo "🐳 [4/9] Установка Docker..."

# Удалим старые версии если есть
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
  apt-get remove -y -qq $pkg 2>/dev/null || true
done

# Установка Docker через официальный скрипт
curl -fsSL https://get.docker.com | sh

# Проверка
docker --version
docker compose version

systemctl enable docker
systemctl start docker

echo "✅ Docker и Docker Compose установлены"

# ─── Фаза 5: Структура каталогов ────────────────────────────────────────────
echo ""
echo "📁 [5/9] Создание структуры каталогов..."
mkdir -p ${PAZL_DIR}/{nginx,scripts}
mkdir -p ${DATA_DIR}/{postgres,redis,backups,uploads,logs}

echo "✅ Каталоги созданы: ${PAZL_DIR} и ${DATA_DIR}"

# ─── Фаза 6: Клонирование репозитория ────────────────────────────────────────
echo ""
echo "📥 [6/9] Клонирование репозитория PAZL..."
if [ -d "${PAZL_DIR}/frontend" ]; then
  echo "  Репозиторий уже существует, обновляем..."
  cd ${PAZL_DIR}/frontend && git pull origin main
else
  git clone ${GITHUB_REPO} ${PAZL_DIR}/frontend
fi

echo "✅ Репозиторий склонирован в ${PAZL_DIR}/frontend"

# ─── Фаза 7: Создание конфигов ──────────────────────────────────────────────
echo ""
echo "⚙️ [7/9] Создание конфигурационных файлов..."

# .env файл (секреты)
cat > ${PAZL_DIR}/.env << ENVEOF
# PAZL Production Environment
# Сгенерировано автоматически $(date '+%Y-%m-%d %H:%M:%S')
# ⚠️ НИКОГДА не добавляйте этот файл в Git!

# PostgreSQL
POSTGRES_DB=pazl_db
POSTGRES_USER=pazl_user
POSTGRES_PASSWORD=${DB_PASSWORD}

# Redis
REDIS_PASSWORD=${REDIS_PASSWORD}

# Nuxt
NUXT_SECRET=${NUXT_SECRET}
NUXT_PUBLIC_API_BASE_URL=http://${SERVER_IP}
NODE_ENV=production

# Server
SERVER_IP=${SERVER_IP}
ENVEOF
chmod 600 ${PAZL_DIR}/.env

echo "  ✅ .env создан (пароли сгенерированы автоматически)"

# Nginx конфигурация
cat > ${PAZL_DIR}/nginx/pazl.conf << 'NGINXEOF'
upstream nuxt_app {
    server frontend:3000;
}

server {
    listen 80;
    server_name _;

    # Gzip сжатие
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 256;
    gzip_comp_level 6;

    # Лимиты загрузки (для прайс-листов)
    client_max_body_size 50M;

    # Логи
    access_log /var/log/nginx/pazl_access.log;
    error_log  /var/log/nginx/pazl_error.log;

    # Загруженные файлы
    location /uploads/ {
        alias /data/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Статические файлы Nuxt (кэш 1 год)
    location /_nuxt/ {
        proxy_pass http://nuxt_app;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Всё остальное → Nuxt SSR
    location / {
        proxy_pass http://nuxt_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
        proxy_connect_timeout 10s;
    }
}
NGINXEOF

echo "  ✅ nginx.conf создан"

# Dockerfile для Nuxt (мультистейдж)
cat > ${PAZL_DIR}/Dockerfile.frontend << 'DOCKERFILE'
# ─── Stage 1: Build ──────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Копируем package файлы и устанавливаем зависимости
COPY frontend/package*.json ./
RUN npm ci --ignore-scripts

# Копируем весь код и собираем
COPY frontend/ ./
RUN npm run build

# ─── Stage 2: Production ─────────────────────
FROM node:22-alpine AS production

WORKDIR /app

# Копируем собранное приложение
COPY --from=builder /app/.output /app/.output

# Переменные окружения
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
DOCKERFILE

echo "  ✅ Dockerfile.frontend создан"

# Docker Compose
cat > ${PAZL_DIR}/docker-compose.yml << 'COMPOSEEOF'
services:

  # ─── Nginx (Reverse Proxy) ───────────────────
  nginx:
    image: nginx:alpine
    container_name: pazl-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/pazl.conf:/etc/nginx/conf.d/default.conf:ro
      - /data/uploads:/data/uploads:ro
      - /data/logs/nginx:/var/log/nginx
    depends_on:
      frontend:
        condition: service_healthy
    networks:
      - pazl-net

  # ─── Nuxt.js Frontend (SSR) ─────────────────
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: pazl-frontend
    restart: unless-stopped
    env_file: .env
    environment:
      - DATA_DIR=/data
    volumes:
      - /data:/data
    expose:
      - "3000"
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - pazl-net

  # ─── PostgreSQL ─────────────────────────────
  postgres:
    image: postgres:16-alpine
    container_name: pazl-postgres
    restart: unless-stopped
    env_file: .env
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-pazl_db}
      POSTGRES_USER: ${POSTGRES_USER:-pazl_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme}
    volumes:
      - /data/postgres:/var/lib/postgresql/data
    expose:
      - "5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-pazl_user} -d ${POSTGRES_DB:-pazl_db}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - pazl-net

  # ─── Redis ──────────────────────────────────
  redis:
    image: redis:7-alpine
    container_name: pazl-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD:-changeme} --appendonly yes
    volumes:
      - /data/redis:/data
    expose:
      - "6379"
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD:-changeme}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - pazl-net

networks:
  pazl-net:
    driver: bridge
COMPOSEEOF

echo "  ✅ docker-compose.yml создан"

# ─── Фаза 8: Сборка и запуск ────────────────────────────────────────────────
echo ""
echo "🔨 [8/9] Сборка и запуск Docker контейнеров..."
cd ${PAZL_DIR}
docker compose build --no-cache frontend
docker compose up -d

echo ""
echo "⏳ Ждём запуск контейнеров (60 сек)..."
sleep 60

docker compose ps
echo "✅ Контейнеры запущены"

# ─── Фаза 9: Автобэкапы ─────────────────────────────────────────────────────
echo ""
echo "💾 [9/9] Настройка автоматических бэкапов БД..."

cat > ${PAZL_DIR}/scripts/backup.sh << 'BACKUPEOF'
#!/bin/bash
# Ежедневный бэкап PostgreSQL
BACKUP_DIR="/data/backups"
DATE=$(date +%Y-%m-%d_%H%M)
FILENAME="pazl_db_${DATE}.sql.gz"

# Дамп БД через Docker
docker exec pazl-postgres pg_dump -U pazl_user pazl_db | gzip > "${BACKUP_DIR}/${FILENAME}"

# Удаляем бэкапы старше 30 дней
find ${BACKUP_DIR} -name "pazl_db_*.sql.gz" -mtime +30 -delete

echo "[$(date)] Бэкап создан: ${FILENAME}" >> /data/logs/backup.log
BACKUPEOF
chmod +x ${PAZL_DIR}/scripts/backup.sh

# Скрипт деплоя обновлений
cat > ${PAZL_DIR}/scripts/deploy.sh << 'DEPLOYEOF'
#!/bin/bash
# PAZL Deploy Script — обновление одной командой
set -euo pipefail
cd /opt/pazl

echo "💾 Делаем бэкап БД перед обновлением..."
bash scripts/backup.sh

echo "📥 Скачиваем новый код..."
cd frontend && git pull origin main && cd ..

echo "🔨 Пересобираем frontend..."
docker compose build frontend

echo "🔄 Перезапускаем..."
docker compose up -d --remove-orphans

echo "✅ Деплой завершён! $(date)"
DEPLOYEOF
chmod +x ${PAZL_DIR}/scripts/deploy.sh

# Скрипт восстановления
cat > ${PAZL_DIR}/scripts/restore.sh << 'RESTOREEOF'
#!/bin/bash
# Восстановление БД из бэкапа
# Использование: bash restore.sh 2026-07-30
DATE=${1:-$(date +%Y-%m-%d)}
BACKUP=$(ls -t /data/backups/pazl_db_${DATE}*.sql.gz 2>/dev/null | head -1)

if [ -z "$BACKUP" ]; then
  echo "❌ Бэкап за ${DATE} не найден!"
  echo "Доступные бэкапы:"
  ls -la /data/backups/
  exit 1
fi

echo "⚠️  Восстанавливаем из: ${BACKUP}"
echo "Это ПЕРЕЗАПИШЕТ текущую базу данных!"
read -p "Продолжить? (y/N): " confirm
if [ "$confirm" != "y" ]; then
  echo "Отменено."
  exit 0
fi

gunzip -c ${BACKUP} | docker exec -i pazl-postgres psql -U pazl_user pazl_db
echo "✅ БД восстановлена из ${BACKUP}"
RESTOREEOF
chmod +x ${PAZL_DIR}/scripts/restore.sh

# Добавляем бэкап в cron (каждый день в 03:00)
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/pazl/scripts/backup.sh") | crontab -

echo "✅ Автобэкап настроен (каждый день в 03:00)"

# ─── ФИНАЛ ───────────────────────────────────────────────────────────────────
echo ""
echo "============================================"
echo "🎉 PAZL СЕРВЕР ПОЛНОСТЬЮ РАЗВЁРНУТ!"
echo "============================================"
echo ""
echo "📋 Сохраните эту информацию:"
echo "─────────────────────────────────────────"
echo "🌐 Сайт:        http://${SERVER_IP}"
echo "🔧 Оператор:    http://${SERVER_IP}/operator"
echo ""
echo "🗄️ База данных:"
echo "   БД:           pazl_db"
echo "   Юзер:         pazl_user"
echo "   Пароль:       ${DB_PASSWORD}"
echo ""
echo "📦 Redis пароль: ${REDIS_PASSWORD}"
echo "🔑 Nuxt Secret:  ${NUXT_SECRET}"
echo ""
echo "📁 Файлы:"
echo "   Код:          ${PAZL_DIR}/"
echo "   Данные:       ${DATA_DIR}/"
echo "   Бэкапы:       ${DATA_DIR}/backups/"
echo "   Секреты:      ${PAZL_DIR}/.env"
echo ""
echo "🔄 Команды:"
echo "   Обновить:     bash ${PAZL_DIR}/scripts/deploy.sh"
echo "   Бэкап:        bash ${PAZL_DIR}/scripts/backup.sh"
echo "   Логи:         docker compose -f ${PAZL_DIR}/docker-compose.yml logs -f"
echo "   Статус:       docker compose -f ${PAZL_DIR}/docker-compose.yml ps"
echo "─────────────────────────────────────────"
echo ""
echo "⚠️  ЗАПИШИТЕ ПАРОЛИ ВЫШЕ! Они сгенерированы один раз!"
echo ""
