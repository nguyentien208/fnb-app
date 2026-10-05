import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initMySqlDatabase, saveStateToMySql, loadStateFromMySql } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database.json');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

let stateData = null;

// Initialize MySQL database
await initMySqlDatabase();

async function loadInitialState() {
  // Try loading from MySQL first
  const dbState = await loadStateFromMySql();
  if (dbState) {
    stateData = dbState;
    console.log('✅ Loaded persistent state from MySQL (fnb_saas)');
    return;
  }

  // Fallback to database.json if MySQL snapshot is empty
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      stateData = JSON.parse(raw);
      console.log('✅ Loaded database state from database.json');
      await saveStateToMySql(stateData);
      return;
    } catch (e) {
      console.error('Failed to read database state:', e);
    }
  }
}

await loadInitialState();

async function persistState(newState) {
  if (newState && typeof newState === 'object') {
    stateData = newState;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(stateData, null, 2), 'utf8');
    } catch (e) {}
    await saveStateToMySql(stateData);
  }
}

// Broadcast event to all WebSocket clients (Phones, POS, KDS, Admin)
function broadcast(type, payload, senderWs = null) {
  const msg = JSON.stringify({ type, payload });
  wss.clients.forEach(client => {
    if (client !== senderWs && client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

// REST API Endpoints (v1)
app.get('/api/v1/state', async (req, res) => {
  if (!stateData) {
    stateData = await loadStateFromMySql();
  }
  res.json({ success: true, data: stateData, engine: 'MySQL 8.0 (fnb_saas)' });
});

app.post('/api/v1/state/sync', async (req, res) => {
  const newState = req.body;
  if (newState && typeof newState === 'object') {
    await persistState(newState);
    broadcast('STATE_SYNC', newState);
    return res.json({ success: true, message: 'State saved to MySQL & broadcasted' });
  }
  res.status(400).json({ success: false, message: 'Invalid payload' });
});

// WebSocket Connection Handler
wss.on('connection', (ws) => {
  console.log('📱 New WebSocket Client Connected (Phone/POS/KDS/Admin)');
  
  if (stateData) {
    ws.send(JSON.stringify({ type: 'STATE_SYNC', payload: stateData }));
  }

  ws.on('message', async (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (parsed.type === 'SYNC_ACTION') {
        await persistState(parsed.payload);
        broadcast('STATE_SYNC', parsed.payload, ws);
      }
    } catch (e) {
      console.error('WS parse error:', e);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Integrate Static Serving for Production or Vite Middleware for Development
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
    console.log('📦 Production static assets loaded from /dist');
  } else {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.log('Vite middleware skipped in production environment');
    }
  }

  const PORT = process.env.PORT || 3000;
  const HOST = '0.0.0.0';

  server.listen(PORT, HOST, () => {
    console.log(`
==========================================================
🚀 GOURMETOS F&B REST API & WEBSOCKET REALTIME SERVER RUNNING
==========================================================
  ➜ Database Engine: MySQL 8.0 (fnb_saas)
  ➜ Local:   http://localhost:${PORT}/
  ➜ Network: http://192.168.11.107:${PORT}/
  ➜ WebSocket: ws://192.168.11.107:${PORT}/ws
==========================================================
`);
  });
}

startServer();
