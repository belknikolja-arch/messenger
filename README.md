# 💬 Мессенджер

**Веб-мессенджер в реальном времени** — React + Node.js + Socket.IO.

**⚡ Живое демо:** [открыть чат](https://5173-i4x647c1qfldc4qjph94y.e2b.app) 🚀

> Ссылка ведёт на временную демо-песочницу — если чат офлайн, запустите приложение локально (инструкция ниже).

Откройте приложение в двух окнах браузера и общайтесь: сообщения, список онлайн-участников и индикатор «печатает…» обновляются мгновенно, без перезагрузки страницы.

## ✨ Возможности

- 🔑 **Вход по имени** — без регистрации и паролей
- 💬 **Каналы** — три готовых + создание собственных
- 🟢 **Онлайн-статусы** — кто сейчас в канале
- ✍️ **Индикатор набора** — «Алиса печатает…»
- 🔔 **Непрочитанные** — счётчики по каналам
- 😀 **Быстрые эмодзи** и переносы строк (Shift+Enter)
- 🕘 **История** — последние 100 сообщений каждого канала
- 🌙 **Тёмная тема** и адаптивная вёрстка (десктоп + мобильные)
- 🔌 **Автопереподключение** при обрыве связи

## 🛠 Технологии

| Слой | Стек |
| --- | --- |
| Клиент | [React 18](https://react.dev), [Vite](https://vitejs.dev), socket.io-client |
| Сервер | Node.js, [Express](https://expressjs.com), [Socket.IO](https://socket.io) |
| Транспорт | WebSocket (Socket.IO) |

## 🚀 Быстрый старт

> Требуется Node.js **18+**.

```bash
# 1. Установить зависимости (корень + server + client)
npm run setup

# 2. Запустить сервер и клиент одновременно
npm run dev
```

- Клиент: **http://localhost:5173**
- Сервер: **http://localhost:3001** (Vite проксирует `/socket.io` и `/api` на сервер)

## 📦 Продакшен-режим

```bash
npm run setup
npm run build   # собирает клиент в client/dist
npm start       # Express отдаёт клиент и WebSocket на одном порту
```

Приложение будет доступно на `http://localhost:3001` (порт задаётся переменной `PORT`).

## 📁 Структура проекта

```
messenger/
├── package.json            # скрипты запуска всего проекта
├── server/                 # Node.js-сервер
│   ├── src/index.js        # Express + Socket.IO, вся логика чата
│   └── package.json
└── client/                 # React-приложение (Vite)
    ├── src/
    │   ├── App.jsx         # состояние чата и подписки на события
    │   ├── socket.js       # подключение Socket.IO
    │   ├── components/     # Login, Sidebar, Chat, Message, MessageInput
    │   └── styles.css      # тёмная тема, адаптив
    ├── vite.config.js      # dev-сервер + прокси на API
    └── index.html
```

## 🔌 Протокол WebSocket

| Направление | Событие | Данные |
| --- | --- | --- |
| клиент → сервер | `user:join` | `{ name }` |
| клиент → сервер | `room:join` | `{ roomId }` |
| клиент → сервер | `room:create` | `{ name }` |
| клиент → сервер | `message:send` | `{ text }` |
| клиент → сервер | `typing:start` / `typing:stop` | — |
| сервер → клиент | `user:init` | `{ user, rooms, activeRoom, users, history }` |
| сервер → клиент | `user:error` | `{ message }` |
| сервер → клиент | `room:joined` | `{ roomId, users, history }` |
| сервер → клиент | `rooms:update` | `Room[]` |
| сервер → клиент | `users:update` | `User[]` |
| сервер → клиент | `message:new` | `Message` |
| сервер → клиент | `typing:update` | `{ roomId, name, isTyping }` |

Состояние (пользователи, каналы, история) хранится **в памяти процесса** — при перезапуске сервера чат обнуляется. Для продакшена подключите базу данных (например, PostgreSQL + Redis для Socket.IO-адаптера).

## ☁️ Деплой — постоянная ссылка

### Render (бесплатно, один клик)

Нажмите кнопку и войдите в Render через свой GitHub-аккаунт (карта не нужна):

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/belknikolja-arch/messenger)

1. Подтвердите параметры сервиса — всё уже настроено в `render.yaml` — и нажмите **Apply**.
2. Через 2–3 минуты мессенджер получит постоянный адрес вида `https://messenger-xxxx.onrender.com`.

> На бесплатном тарифе сервис «засыпает» после 15 минут без посетителей — первое открытие после паузы занимает до минуты, дальше работает мгновенно.

### Другие платформы (Railway, Fly.io, Koyeb, свой сервер)

В корне репозитория есть `Dockerfile`:

```bash
docker build -t messenger .
docker run -p 80:3001 messenger   # порт задаётся переменной окружения PORT
```

| Параметр | Значение |
| --- | --- |
| Build command | `npm run setup && npm run build` |
| Start command | `npm start` |
| Порт | из переменной окружения `PORT` |

Клиент и сервер живут на одном домене, поэтому CORS не требуется.

## 📄 Лицензия

[MIT](LICENSE)
