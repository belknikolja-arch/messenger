import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // слушать 0.0.0.0 — доступ из локальной сети/превью
    port: 5173,
    strictPort: true,
    allowedHosts: true, // разрешаем любые Host (нужно для превью-прокси)
    proxy: {
      // В dev-режиме браузер ходит на тот же origin — проксируем на сервер
      '/socket.io': { target: 'http://localhost:3001', ws: true },
      '/api': 'http://localhost:3001',
    },
  },
});
