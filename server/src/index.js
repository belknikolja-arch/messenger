/**
 * Мессенджер — серверная часть.
 *
 * Express отдаёт собранный клиент (в продакшене) и health-check,
 * Socket.IO обеспечивает чат в реальном времени.
 *
 * Состояние (пользователи, каналы, история) хранится в памяти процесса —
 * для демо-проекта этого достаточно. Для продакшена подключите БД.
 */
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { Server } from 'socket.io';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

/* ----------------------------- Константы ------------------------------ */

const HISTORY_LIMIT = 100; // храним последние 100 сообщений на канал
const NAME_MAX = 24;
const TEXT_MAX = 2000;

const DEFAULT_ROOMS = [
  { id: 'general', label: 'общий' },
  { id: 'random', label: 'флудилка' },
  { id: 'dev', label: 'разработка' },
];

const PALETTE = [
  '#7c5bff', '#ff6b9d', '#4ecdc4', '#ffa94d', '#74c0fc',
  '#b197fc', '#63e6be', '#f783ac', '#ffd43b', '#a9e34b',
];

/* ----------------------------- Хранилище ------------------------------ */

const rooms = new Map();   // roomId -> { id, label }
for (const room of DEFAULT_ROOMS) rooms.set(room.id, { ...room });

const users = new Map();   // socket.id -> { id, name, color, room }
const history = new Map(); // roomId -> Message[]

/* ------------------------------ Хелперы ------------------------------- */

const hash = (s) => [...s].reduce((acc, ch) => (acc * 31 + ch.codePointAt(0)) >>> 0, 7);
const colorFor = (name) => PALETTE[hash(name) % PALETTE.length];

/** Нормализует строку: схлопывает пробелы, тримит и обрезает по длине */
const clean = (value, max) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

const publicUser = ({ id, name, color }) => ({ id, name, color });

const usersInRoom = (roomId) =>
  [...users.values()].filter((u) => u.room === roomId).map(publicUser);

const nameTaken = (name) => [...users.values()].some((u) => u.name === name);

/** Если имя занято — добавляет « (2)», « (3)» и т.д. */
function uniqueName(base) {
  if (!nameTaken(base)) return base;
  for (let i = 2; ; i++) {
    const candidate = `${base} (${i})`;
    if (!nameTaken(candidate)) return candidate;
  }
}

function addMessage(roomId, message) {
  if (!history.has(roomId)) history.set(roomId, []);
  const list = history.get(roomId);
  list.push(message);
  if (list.length > HISTORY_LIMIT) list.splice(0, list.length - HISTORY_LIMIT);
}

/* ------------------------------- HTTP --------------------------------- */

const app = express();

app.get('/api/health', (_req, res) => res.json({ ok: true, online: users.size }));

// В продакшене отдаём собранный клиент; любой маршрут -> index.html (SPA)
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));

const httpServer = app.listen(PORT, HOST, () => {
  console.log(`✅ Сервер мессенджера запущен: http://localhost:${PORT}`);
});

/* ----------------------------- Socket.IO ------------------------------ */

const io = new Server(httpServer, {
  // нужно, только если клиент и сервер живут на разных доменах
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const emitRooms = () => io.emit('rooms:update', [...rooms.values()]);
const emitUsers = (roomId) => io.to(roomId).emit('users:update', usersInRoom(roomId));

/** Системное сообщение (вошёл/вышел) — сохраняется в историю и рассылается */
function systemMessage(roomId, text) {
  const message = { id: crypto.randomUUID(), roomId, type: 'system', text, time: Date.now() };
  addMessage(roomId, message);
  io.to(roomId).emit('message:new', message);
}

/** Сброс индикатора «печатает…» у сокета */
function stopTyping(socket) {
  clearTimeout(socket.data.typingTimer);
  if (!socket.data.isTyping) return;
  socket.data.isTyping = false;
  const user = socket.data.user;
  if (user) {
    socket.to(user.room).emit('typing:update', { roomId: user.room, name: user.name, isTyping: false });
  }
}

/** Переводит пользователя в другой канал */
function joinRoom(socket, roomId) {
  const user = socket.data.user;
  if (!user || !rooms.has(roomId) || user.room === roomId) return;

  const from = user.room;
  socket.leave(from);
  socket.join(roomId);
  user.room = roomId;

  socket.emit('room:joined', {
    roomId,
    users: usersInRoom(roomId),
    history: history.get(roomId) ?? [],
  });
  emitUsers(from);
  emitUsers(roomId);
  systemMessage(from, `${user.name} покинул канал`);
  systemMessage(roomId, `${user.name} вошёл в канал`);
}

io.on('connection', (socket) => {
  socket.data.isTyping = false;
  socket.data.typingTimer = null;
  console.log(`🔌 Подключение: ${socket.id}`);

  /* --- Вход в чат --- */
  socket.on('user:join', ({ name } = {}) => {
    const cleaned = clean(name, NAME_MAX);
    if (cleaned.length < 2) {
      return socket.emit('user:error', { message: 'Имя должно быть не короче 2 символов' });
    }

    // повторный вход с этого же сокета (например, смена имени при переподключении)
    if (socket.data.user) {
      const prev = socket.data.user;
      users.delete(socket.id);
      socket.leave(prev.room);
      emitUsers(prev.room);
    }

    const finalName = uniqueName(cleaned);
    const user = { id: socket.id, name: finalName, color: colorFor(finalName), room: 'general' };
    users.set(socket.id, user);
    socket.data.user = user;
    socket.join('general');
    console.log(`👤 ${finalName} вошёл в чат`);

    socket.emit('user:init', {
      user: publicUser(user),
      rooms: [...rooms.values()],
      activeRoom: 'general',
      users: usersInRoom('general'),
      history: history.get('general') ?? [],
    });
    emitUsers('general');
    emitRooms();
    systemMessage('general', `${finalName} присоединился к чату`);
  });

  /* --- Смена канала --- */
  socket.on('room:join', ({ roomId } = {}) => joinRoom(socket, String(roomId || '')));

  /* --- Создание канала (создатель сразу попадает в него) --- */
  socket.on('room:create', ({ name } = {}) => {
    const label = clean(name, NAME_MAX);
    if (!socket.data.user || !label) return;
    const id = `r-${crypto.randomUUID().slice(0, 8)}`;
    rooms.set(id, { id, label });
    emitRooms();
    joinRoom(socket, id);
  });

  /* --- Новое сообщение --- */
  socket.on('message:send', ({ text } = {}) => {
    const user = socket.data.user;
    const content = String(text ?? '').trim().slice(0, TEXT_MAX);
    if (!user || !content) return;

    const message = {
      id: crypto.randomUUID(),
      roomId: user.room,
      type: 'user',
      user: publicUser(user),
      text: content,
      time: Date.now(),
    };
    addMessage(user.room, message);
    io.to(user.room).emit('message:new', message);
    stopTyping(socket);
  });

  /* --- Индикатор «печатает…» --- */
  socket.on('typing:start', () => {
    const user = socket.data.user;
    if (!user) return;
    if (!socket.data.isTyping) {
      socket.data.isTyping = true;
      socket.to(user.room).emit('typing:update', { roomId: user.room, name: user.name, isTyping: true });
    }
    clearTimeout(socket.data.typingTimer);
    // авто-сброс, если клиент молчит (закрыл вкладку и т.п.)
    socket.data.typingTimer = setTimeout(() => stopTyping(socket), 3000);
  });

  socket.on('typing:stop', () => stopTyping(socket));

  /* --- Отключение --- */
  socket.on('disconnect', () => {
    const user = socket.data.user;
    stopTyping(socket);
    if (!user) return;

    users.delete(socket.id);
    emitUsers(user.room);
    systemMessage(user.room, `${user.name} покинул чат`);
    console.log(`👋 ${user.name} вышел`);

    // удаляем созданные вручную каналы, если они опустели
    let roomsChanged = false;
    for (const [id] of rooms) {
      if (id.startsWith('r-') && usersInRoom(id).length === 0) {
        rooms.delete(id);
        history.delete(id);
        roomsChanged = true;
      }
    }
    if (roomsChanged) emitRooms();
  });
});
