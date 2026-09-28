/**
 * Печенько-кликер — серверная часть.
 * Игра полностью работает в браузере (прогресс — в localStorage),
 * сервер лишь отдаёт статические файлы собранного клиента и health-check.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
const clientDist = path.join(__dirname, '../../client/dist');

app.get('/api/health', (_req, res) => res.json({ ok: true, game: 'cookie-clicker' }));

app.use(express.static(clientDist));
app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));

app.listen(PORT, HOST, () => {
  console.log(`✅ Печенько-кликер запущен: http://localhost:${PORT}`);
});
