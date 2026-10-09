# 🧠 Pappu Bhai AI — Multi-Agent Auto Trading Platform

**Pappu Bhai AI** ek main (orchestrator) agent hai. Har candle close hone par wo apni **10 technical indicator agents ki team** (+ 🛡️ Risk Rakshak + 🔮 Jyotish Guru) ko **ek saath (parallel)** analysis ka kaam deta hai. Har agent apni report jaise hi taiyaar karta hai, live Pappu Bhai ko bhej deta hai. Phir Pappu Bhai weighted voting karke aur Risk agent ka veto dekhkar final **BUY / SELL / HOLD** decision leta hai, aur auto-trading ON ho to order laga deta hai.

> ⚠️ **Disclaimer:** Ye educational/demo project hai. Default me **simulated market + paper trading** chalti hai. Real paisa lagane se pehle achhe se backtest karein, SEBI ke algo-trading rules follow karein aur risk samjhein.

## ✨ Features
- 🤖 **Multi-agent AI** — 10 technical indicator agents (EMA/VWAP/RSI/MACD/Volume/Supertrend/ADX/Bollinger/ATR) voting karte hain + Risk agent (veto) + Jyotish Guru, sab `Promise.all` se parallel
- 🧩 **Custom agent builder** — Admin → Agents me **indicator + params + weight** de kar apna naya technical agent banao (jaise EMA 200, RSI 7, Supertrend 7/2) - code chhune ki zarurat nahi
- 📈 **Live candlestick chart** (TradingView Lightweight Charts) — **time frame selector (5s / 15s / 1m / 5m / 15m / 1H)**, EMA 9/21/50, volume, trade markers, SL/Target lines (5s base candles se client par aggregate hota hai, aakhri 5 ghante ki history)
- ⚡ **Real-time** updates Socket.IO se: ticks, agent reports, decisions, trades
- 💼 **Paper trading engine** — auto position sizing, ATR based SL/Target, max positions, short selling option
- 💰 **Wallet** — dashboard se **Add Funds** aur **Withdraw**, poori transaction history, available/blocked balance (open positions me laga paisa withdraw nahi hota)
- ⚙️ **Responsive admin panel** — overview, agent weights ON/OFF, symbols, trades, users, settings, logs
- 🏦 **Brokers** — Paper, Zerodha, Upstox, Angel, Dhan, Fyers, **Delta Exchange (crypto)**; add/edit/test/activate + **🔍 search karke broker chunne ka picker** aur saved broker cards ka search filter
- 🗄️ **SQLite database** (Node ka built-in `node:sqlite`, koi extra install nahi)
- 🔐 Login + roles (admin / trader), scrypt password hashing, signed tokens
- 📱 Mobile, tablet aur desktop par responsive

## 🤖 Agent Team
Har technical agent ka ek **indicator + params** hota hai (DB `agents` table me) - Admin → Agents me weight/ON-OFF/edit/delete kiya ja sakta hai.

### 📈 Technical agents (voting)
| Agent | Indicator (params) | Kaam | Default weight |
|---|---|---|---|
| 📈 EMA 20 | EMA (20) | Short-term trend - price EMA ke upar/neeche + slope | 1.2 |
| 🧭 EMA 50 | EMA (50) | Medium-term trend - bade trend ka rukh | 1.2 |
| ⚖️ VWAP | VWAP | Intraday trend / average price | 1.1 |
| 🌡️ RSI 14 | RSI (14, 30/70) | Momentum - oversold BUY / overbought SELL | 1.1 |
| 📉 MACD | MACD (12/26/9) | Trend + momentum confirmation | 1.2 |
| 🔊 Volume | Volume (20, 1.5×) | Buying/selling activity - volume spike + price direction | 1.0 |
| 🌊 Supertrend | Supertrend (10, 3) | Trend direction | 1.2 |
| 💪 ADX | ADX (14, ≥20) | Trend ki strength | 1.0 |
| 📏 Bollinger Bands | Bollinger (20, 2σ) | Volatility aur price range | 1.0 |
| 🛑 ATR | ATR (14, 2%) | Volatility + stop-loss planning | 1.0 |

### 🛡️ System agents (voting nahi / special)
| Agent | Kaam | Default weight |
|---|---|---|
| 🛡️ Risk Rakshak | ATR, volatility, max positions → **VETO** + SL/Target | voting nahi karta |
| 🔮 Jyotish Guru | Real-time panchang se **token chunta hai** + hora/paksha/Rahu Kaal par vote | 0.5 |

### ➕ Apna technical agent kaise banayein (Admin → Agents)
1. **➕ Naya technical agent** form me naam likhein (jaise "EMA 200 long trend"), icon (emoji) aur weight dein.
2. **Indicator** chunein (EMA, VWAP, RSI, MACD, Volume, Supertrend, ADX, Bollinger, ATR) - uske params (period, level, multiplier...) neeche khud aa jate hain.
3. **💾 Agent save karo** - agent turant team me aa jayega aur agli analysis se vote karega.
4. Har agent ke aage **⚙️** se naam/params/indicator badlein, **🗑** se delete karein (Risk Rakshak aur Jyotish Guru system agents hain - delete nahi hote, sirf OFF ho sakte hain).

### 🔮 Jyotish Guru (Astrologer AI) - kaise kaam karta hai
1. Har `astro_refresh_sec` (default 60s) par asli **IST date/time** se panchang nikalta hai: vaar, hora (planetary hour), tithi, paksha, nakshatra, Chandra rashi, Rahu Kaal, mulank/bhagyank (`server/agents/astro/panchang.js`).
2. Har token ka ek **swami grah** hota hai (Admin → Symbols me set karein; khali ho to naam ke ank se auto).
3. Score: hora swami = +3, vaar swami = +2, nakshatra swami = +1.5, Chandra rashi swami = +1, bhagyank match = +1.5, mitra grah = +1, shatru grah = -1.
4. Sabse zyada score wala token chuna jata hai. **Astro mode ON** ho to baaki saare agents **sirf usi token** (aur jin tokens me position open hai) par analysis karke Pappu Bhai ko report karte hain.
5. Hora badalte hi (har ghante) naya pick ho sakta hai. Har pick `astro_picks` table me save hota hai.

> ⚠️ Jyotish belief/entertainment hai, iska koi scientific market edge nahi hai.

**Decision formula:** `score = Σ(weight × direction × confidence) / Σ weight` (−1 se +1 tak)
`score ≥ threshold` → BUY, `score ≤ −threshold` → SELL, warna HOLD. Risk Rakshak naye trade ko veto kar sakta hai.

## 📁 Folder Structure
```
pappu-bhai-ai/
├── package.json
├── .env.example
├── server/
│   ├── index.js                 # Express + Socket.IO, sabko jodta hai
│   ├── config.js
│   ├── db/
│   │   ├── schema.sql           # Database tables
│   │   └── database.js          # SQLite connection, seed data, helpers
│   ├── market/
│   │   └── marketFeed.js        # Live ticks + OHLCV candles (simulated)
│   ├── agents/
│   │   ├── pappuBhaiAI.js       # 🧠 MAIN AGENT (orchestrator)
│   │   ├── baseAgent.js
│   │   ├── indicators.js        # EMA, RSI, MACD, ATR, Bollinger, OBV, VWAP, Supertrend, ADX
│   │   ├── indicatorSignals.js  # Indicator → BUY/SELL/HOLD signal logic (agents ka config)
│   │   └── specialists/         # indicatorAgent (DB agents) + riskAgent + astroAgent
│   ├── trading/
│   │   ├── tradingEngine.js     # Orders, positions, SL/Target
│   │   └── brokers.js           # Paper broker + Zerodha Kite template
│   ├── routes/api.js            # REST API (user + admin)
│   ├── middleware/auth.js
│   └── utils/security.js        # Password hash, tokens
├── public/
│   ├── login.html
│   ├── index.html               # Trading dashboard
│   ├── admin.html               # Admin panel
│   ├── css/style.css
│   └── js/ common.js, dashboard.js, admin.js
└── data/pappu.db                # Pehli baar chalane par apne aap banta hai
```

## 🚀 Kaise chalayein
**Zaroori:** Node.js 22.13+ (Node 24 recommended)

```bash
cd pappu-bhai-ai
npm install
copy .env.example .env      # (Linux/Mac: cp .env.example .env)
npm start
```
Browser me kholein: **http://localhost:3000**
Login: `admin@pappubhai.ai` / `admin123` (Admin → Users se naya admin banakar ye wala badal dein)

Dashboard par **Auto Trading** switch ON karein. Pappu Bhai har candle (default 5 sec) par team se analysis karwayega aur paper trades lega.

Database reset karna ho: `npm run reset-db`

## 🗄️ Database Tables
`users`, `symbols` (+ `planet`, `broker_token`), `astro_picks`, `agents` (weight/enabled + `indicator`, `params` JSON, `custom`), `signals` (har agent ki report), `decisions` (Pappu Bhai ke faisle), `trades`, `brokers` (encrypted credentials), `api_keys` (encrypted), `wallet_tx` (paisa add / withdrawal), `settings`, `logs`

## 💰 Wallet (Dashboard → Add Funds / Withdraw)
Hisaab ka formula:
```
available (cash) = initial_capital + deposits - withdrawals + realized P&L - blocked
blocked          = open positions me laga paisa (qty × entry price)
equity           = available + blocked + unrealized P&L
```
- **➕ Add Funds** — paisa add karo, AI ke trades ka budget (equity × position size %) turant badhta hai
- **⬆ Withdraw** — sirf *available* paisa nikal sakte hain; open positions me laga paisa blocked rehta hai
- Har transaction `wallet_tx` table me save hoti hai (type, amount, note, balance_after, user, time)
- API: `GET /api/wallet`, `POST /api/wallet/deposit`, `POST /api/wallet/withdraw` (body: `{ amount, note }`)
- Ye **wallet ka internal hisaab** hai. LIVE broker par asli withdrawal sirf broker app se hota hai.

## 🏦 Brokers (Admin → Brokers)
| Broker | Chahiye | Symbol ke liye "Broker token" |
|---|---|---|
| Paper (Demo) | kuch nahi | - |
| Zerodha Kite Connect | API key, Access token | optional (tradingsymbol) |
| Upstox v2 | Access token | **zaroori** - instrument_key (`NSE_EQ\|INE...`) |
| Angel One SmartAPI | Client code, API key, JWT token | **zaroori** - symboltoken |
| Dhan v2 | Client ID, Access token | **zaroori** - securityId |
| Delta Exchange | API key, API secret (HMAC sign) | **zaroori** - product_id (jaise 27 = BTCUSD) |
| Fyers v3 | App ID (`XXXX-100`), Access token | optional (`NSE:SBIN-EQ`) |

- Secrets DB me **AES-256-GCM encrypted** rehte hain, UI me sirf aakhri 4 akshar dikhte hain.
- **🔌 Test** button broker ki profile/funds API call karke connection check karta hai.
- LIVE broker activate karne ke liye: test OK hona + `LIVE` likh kar confirm + koi open position na ho.
- **Safety:** LIVE broker par AI auto-orders default **band** (`allow_live_ai`), har order ki max value limit (`live_max_order_value`). Exit orders hamesha allowed.
- ⚠️ Adapters official docs ke hisaab se hain, asli account ke bina order placement test nahi hua. Pehle 1 share se test karein. Market orders ka fill price = LTP (approx).
- Access tokens (Zerodha/Upstox/Fyers/Angel) roz expire hote hain - roz subah Edit karke naya token daalein.

## 🔑 API Keys (Admin → API Keys)
- **NewsAPI.org** → news headlines (10 min cache) - news sentiment pipeline ke liye ready
- **OpenAI-compatible / Gemini** → headlines ka sentiment AI se (warna keyword scoring)
- **Custom** → apne code me `getKey('custom')` (`server/integrations/apiKeys.js`)
- Abhi ki default team me news agent nahi hai (10 technical indicator agents + Risk + Jyotish); keys save rehti hain, jab chahein news-based agent jod sakte hain.

## 🔌 Real data se jodna
1. **Live data:** `server/market/marketFeed.js` me simulated `tick()` ki jagah broker websocket (Kite Ticker / Angel SmartAPI / Upstox) se `tick` aur `candleClosed` events emit karein. `CANDLE_SECONDS=60` rakhein. **LIVE broker ke saath AI trading sirf real data feed ke baad hi ON karein.**
2. Naya broker: `server/trading/brokers/adapters.js` me class banayein (`testConnection`, `placeOrder`) aur `brokers/index.js` ke `BROKER_TYPES` me jodein.
3. Naya **type ka** agent (naya formula) banana ho: `BaseAgent` extend karein (`server/agents/specialists/`), `pappuBhaiAI.js` me jodein. Bas **parameterized** indicator chahiye tha to `indicatorSignals.js` me `INDICATORS` + `FUNCS` me entry daalein - fir wo admin panel se add/edit hota hai.
4. Sirf **apna ek agent** chahiye to code ki zarurat nahi: Admin → Agents → ➕ form (indicator + params + weight).

## 📡 API (short)
| Method | Endpoint | Kaam |
|---|---|---|
| POST | `/api/auth/login` | Login |
| GET | `/api/symbols`, `/api/candles/:symbol` | Market data |
| GET | `/api/decisions`, `/api/signals/latest/:symbol` | AI output |
| POST | `/api/analyze/:symbol` | Turant analysis karwayein |
| GET | `/api/stats`, `/api/positions`, `/api/trades` | Trading |
| POST | `/api/trade/manual`, `/api/trade/close/:symbol` | Manual trade |
| POST | `/api/bot/toggle` `{enabled}` | Auto-trading ON/OFF (admin) |
| GET | `/api/agents`, `/api/admin/agent-indicators` | Agent team + indicator schema (admin) |
| POST/PUT/DELETE | `/api/admin/agents[/:key]` | Custom agent add / edit / delete (admin) |
| * | `/api/admin/...` | settings, agents, symbols, users, logs, overview |

Socket events: `tick`, `analysis:start`, `agent:signal`, `pappu:decision`, `trade`, `stats`, `bot`
