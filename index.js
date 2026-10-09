/**
 * Pappu Bhai AI - Server entry point
 * Express (REST API + static UI) + Socket.IO (live ticks, agent reports, decisions)
 */
const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const config = require('./config');
const { db, settings, log } = require('./db/database');
const feed = require('./market/marketFeed');
const TradingEngine = require('./trading/tradingEngine');
const PappuBhaiAI = require('./agents/pappuBhaiAI');
const apiRouter = require('./routes/api');
const { verifyToken } = require('./utils/security');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ---------- Core services ----------
const engine = new TradingEngine(feed);
const pappu = new PappuBhaiAI(feed, engine);

for (const s of db.prepare('SELECT * FROM symbols WHERE active = 1').all()) {
  feed.addSymbol(s.symbol, s.base_price);
}

// ---------- HTTP ----------
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api', apiRouter({ feed, engine, pappu, io }));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'admin.html')));

// ---------- Socket.IO (login token zaroori) ----------
io.use((socket, next) => {
  const user = verifyToken(socket.handshake.auth?.token);
  if (!user) return next(new Error('unauthorized'));
  socket.user = user;
  next();
});

io.on('connection', (socket) => {
  socket.emit('stats', engine.stats());
  if (pappu.focus) socket.emit('astro:pick', pappu.focus);
});

// ---------- Wiring: feed -> engine/AI -> clients ----------
feed.on('tick', (t) => {
  io.emit('tick', t);
  engine.onTick(t);
});

feed.on('candleClosed', ({ symbol }) => {
  // har candle close par Pappu Bhai poori team ke saath analysis karta hai
  // (astro mode me sirf Jyotish Guru ke chune token + open positions par)
  if (pappu.shouldAnalyze(symbol)) pappu.analyze(symbol);
});

// 🔮 Jyotish Guru: panchang har 'astro_refresh_sec' par dobara check
pappu.refreshAstro();
let lastAstro = Date.now();
setInterval(() => {
  const every = Math.max(10, Number(settings.get('astro_refresh_sec')) || 60) * 1000;
  if (Date.now() - lastAstro >= every) {
    lastAstro = Date.now();
    pappu.refreshAstro();
  }
}, 5000);

pappu.on('astroPick', (p) => io.emit('astro:pick', p));
pappu.on('analysisStart', (e) => io.emit('analysis:start', e));
pappu.on('agentSignal', (s) => io.emit('agent:signal', s));
pappu.on('decision', (d) => io.emit('pappu:decision', d));

engine.on('notice', (n) => io.emit('notice', n));

engine.on('trade', (e) => {
  io.emit('trade', e);
  io.emit('stats', engine.stats());
});

// stats (unrealized P&L) har 2 sec
setInterval(() => io.emit('stats', engine.stats()), 2000);

feed.start();
server.listen(config.port, () => {
  log('info', `🚀 Pappu Bhai AI chal raha hai: http://localhost:${config.port}`);
});
