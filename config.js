const path = require('path');

const env = process.env;

module.exports = {
  port: Number(env.PORT || 3000),
  secret: env.APP_SECRET || 'dev-secret-change-me',
  tokenTtlMs: 1000 * 60 * 60 * 12, // 12 ghante
  dbPath: path.resolve(env.DB_PATH || path.join(__dirname, '..', 'data', 'pappu.db')),
  tickMs: Number(env.TICK_MS || 1000),
  candleSeconds: Number(env.CANDLE_SECONDS || 5),
  // Itni purani history rakhi jati hai taaki dashboard me bade time frame (5m/15m/1h) ban sakein
  historyCandles: Number(env.HISTORY_CANDLES || 3600),
  adminEmail: env.ADMIN_EMAIL || 'admin@pappubhai.ai',
  adminPassword: env.ADMIN_PASSWORD || 'admin123',
  broker: env.BROKER || 'paper',
};
