# ---------- Этап 1: сборка ----------
FROM node:20-alpine AS build
WORKDIR /app

# Сначала только манифесты зависимостей — слои кэшируются
COPY server/package*.json server/
COPY client/package*.json client/
RUN npm ci --prefix server --omit=dev && npm ci --prefix client

# Исходный код и сборка клиента
COPY server server
COPY client client
RUN npm run build --prefix client

# ---------- Этап 2: запуск ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/server server
COPY --from=build /app/client/dist client/dist

# Порт по умолчанию; платформы (Render/Railway/Fly) подставляют свой через PORT
EXPOSE 3001
CMD ["node", "server/src/index.js"]
