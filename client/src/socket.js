import { io } from 'socket.io-client';

/**
 * Подключаемся к тому же origin:
 *  - в dev-режиме Vite проксирует /socket.io на сервер (см. vite.config.js);
 *  - в продакшене клиент отдаётся самим сервером.
 * Адрес можно переопределить через VITE_SOCKET_URL (см. .env.example).
 */
export const socket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin);
