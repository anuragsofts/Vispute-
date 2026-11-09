require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const QRCode = require('qrcode');
const path = require('path');
const store = require('./data/store');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Give store access to Socket.io for live broadcasts
store.setIO(io);

app.use(cors());
app.use(express.json());

// Socket connection
io.on('connection', (socket) => {
  console.log('⚡ Client connected:', socket.id);

  // Send initial data to client
  socket.emit('init:data', {
    tables: store.getTables(),
    menu: store.getMenu(),
    stats: store.getLiveStats()
  });

  socket.on('disconnect', () => {
    // console.log('Client disconnected:', socket.id);
  });
});

// --- REST API ROUTES ---

// 1. Menu
app.get('/api/menu', (req, res) => {
  res.json(store.getMenu());
});

app.post('/api/menu', (req, res) => {
  try {
    const newItem = store.addMenuItem(req.body);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/menu/:id/toggle', (req, res) => {
  const item = store.toggleMenuItem(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
});

// 2. Tables & Floor Plan
app.get('/api/tables', (req, res) => {
  res.json(store.getTables());
});

app.get('/api/tables/:id', (req, res) => {
  const table = store.getTable(req.params.id);
  if (!table) return res.status(404).json({ error: 'Table not found' });
  res.json(table);
});

app.patch('/api/tables/:id/layout', (req, res) => {
  const { x, y } = req.body;
  const table = store.updateTableLayout(req.params.id, x, y);
  if (!table) return res.status(404).json({ error: 'Table not found' });
  res.json(table);
});

// 3. Orders (Customer QR or Waiter POS)
// Table stays occupied; repeated orders append as new rounds to same bill!
app.post('/api/orders', (req, res) => {
  try {
    const { tableId, tableNumber, items, guestName, orderType, notes } = req.body;
    const target = tableId || tableNumber;
    if (!target) return res.status(400).json({ error: 'tableId or tableNumber is required' });
    if (!items || !items.length) return res.status(400).json({ error: 'Order must contain items' });

    const result = store.createOrAppendOrder({
      tableIdOrNum: target,
      items,
      guestName,
      orderType: orderType || 'QR Customer',
      notes
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Kitchen / Waiter Status Updates
app.patch('/api/orders/item-status', (req, res) => {
  try {
    const { tableId, roundNumber, itemId, status } = req.body;
    const result = store.updateItemStatus({ tableId, roundNumber, itemId, status });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/orders/round-status', (req, res) => {
  try {
    const { tableId, roundNumber, status } = req.body;
    const result = store.updateRoundStatus({ tableId, roundNumber, status });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Customer / Waiter requests bill
app.post('/api/tables/:id/request-bill', (req, res) => {
  try {
    const result = store.requestBill(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Billing Counter - Settle Bill & Free Table
app.post('/api/billing/settle', (req, res) => {
  try {
    const { tableId, paymentMethod, discountPercent, discountAmount, notes } = req.body;
    const bill = store.settleBill({
      tableIdOrNum: tableId,
      paymentMethod,
      discountPercent,
      discountAmount,
      notes
    });
    res.json(bill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/billing/history', (req, res) => {
  res.json(store.getBills());
});

// 7. Live Stats
app.get('/api/stats', (req, res) => {
  res.json(store.getLiveStats());
});

// 8. Dynamic QR Code Generator for Tables
app.get('/api/qr/:tableNumber', async (req, res) => {
  try {
    const { tableNumber } = req.params;
    const host = req.get('host');
    const protocol = req.protocol;
    // URL to which QR points: opens the mobile-optimized customer ordering view
    const targetUrl = `${protocol}://${host}/table/${tableNumber}`;

    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    res.json({
      tableNumber,
      targetUrl,
      qrDataUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset demo data
app.post('/api/reset-demo', (req, res) => {
  store.resetDefaults();
  store.saveToFile();
  io.emit('init:data', {
    tables: store.getTables(),
    menu: store.getMenu(),
    stats: store.getLiveStats()
  });
  res.json({ message: 'Demo data reset to fresh state' });
});

// Serve frontend build if in production
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
    const indexHtml = path.join(clientDist, 'index.html');
    return res.sendFile(indexHtml, (err) => {
      if (err) res.status(200).send('Vispute Food Court API is running. Vite dev server on port 3000.');
    });
  }
  next();
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`🏨 VISPUTE FOOD COURT - Hotel Management System`);
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`📡 Socket.io Real-time engine active`);
  console.log(`=================================================\n`);
});
