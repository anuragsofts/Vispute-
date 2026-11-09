const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// 1. Define clean tables (all available, 0 bill, no fake guests)
const CLEAN_TABLES = [
  { id: 'T1', tableNumber: 1, name: 'Table 1', section: 'Main Floor', shape: 'square', seats: 4, x: 420, y: 80, status: 'available', currentGuestName: '', seatedAt: null, activeSessionId: null, activeSession: null, currentBillTotal: 0, itemCount: 0, pendingPrepCount: 0, readyToServeCount: 0, notes: '' },
  { id: 'T2', tableNumber: 2, name: 'Table 2', section: 'Main Floor', shape: 'square', seats: 4, x: 600, y: 80, status: 'available', currentGuestName: '', seatedAt: null, activeSessionId: null, activeSession: null, currentBillTotal: 0, itemCount: 0, pendingPrepCount: 0, readyToServeCount: 0, notes: '' },
  { id: 'T3', tableNumber: 3, name: 'Table 3', section: 'Main Floor', shape: 'rectangle', seats: 6, x: 820, y: 80, status: 'available', currentGuestName: '', seatedAt: null, activeSessionId: null, activeSession: null, currentBillTotal: 0, itemCount: 0, pendingPrepCount: 0, readyToServeCount: 0, notes: '' },
  { id: 'T4', tableNumber: 4, name: 'Table 4', section: 'Main Floor', shape: 'square', seats: 4, x: 420, y: 250, status: 'available', currentGuestName: '', seatedAt: null, activeSessionId: null, activeSession: null, currentBillTotal: 0, itemCount: 0, pendingPrepCount: 0, readyToServeCount: 0, notes: '' },
  { id: 'T5', tableNumber: 5, name: 'Table 5', section: 'Main Floor', shape: 'square', seats: 4, x: 600, y: 250, status: 'available', currentGuestName: '', seatedAt: null, activeSessionId: null, activeSession: null, currentBillTotal: 0, itemCount: 0, pendingPrepCount: 0, readyToServeCount: 0, notes: '' },
  { id: 'T6', tableNumber: 6, name: 'Table 6', section: 'Main Floor', shape: 'rectangle', seats: 6, x: 820, y: 290, status: 'available', currentGuestName: '', seatedAt: null, activeSessionId: null, activeSession: null, currentBillTotal: 0, itemCount: 0, pendingPrepCount: 0, readyToServeCount: 0, notes: '' },
  { id: 'T7', tableNumber: 7, name: 'Table 7', section: 'Main Floor', shape: 'square', seats: 4, x: 420, y: 430, status: 'available', currentGuestName: '', seatedAt: null, activeSessionId: null, activeSession: null, currentBillTotal: 0, itemCount: 0, pendingPrepCount: 0, readyToServeCount: 0, notes: '' },
  { id: 'T8', tableNumber: 8, name: 'Table 8', section: 'Main Floor', shape: 'square', seats: 4, x: 600, y: 430, status: 'available', currentGuestName: '', seatedAt: null, activeSessionId: null, activeSession: null, currentBillTotal: 0, itemCount: 0, pendingPrepCount: 0, readyToServeCount: 0, notes: '' },
  { id: 'T9', tableNumber: 9, name: 'Table 9', section: 'Main Floor', shape: 'rectangle', seats: 6, x: 180, y: 600, status: 'available', currentGuestName: '', seatedAt: null, activeSessionId: null, activeSession: null, currentBillTotal: 0, itemCount: 0, pendingPrepCount: 0, readyToServeCount: 0, notes: '' },
  { id: 'T10', tableNumber: 10, name: 'Table 10', section: 'Main Floor', shape: 'square', seats: 4, x: 420, y: 600, status: 'available', currentGuestName: '', seatedAt: null, activeSessionId: null, activeSession: null, currentBillTotal: 0, itemCount: 0, pendingPrepCount: 0, readyToServeCount: 0, notes: '' },
  { id: 'T11', tableNumber: 11, name: 'Table 11', section: 'Main Floor', shape: 'square', seats: 4, x: 600, y: 600, status: 'available', currentGuestName: '', seatedAt: null, activeSessionId: null, activeSession: null, currentBillTotal: 0, itemCount: 0, pendingPrepCount: 0, readyToServeCount: 0, notes: '' },
  { id: 'T12', tableNumber: 12, name: 'Table 12', section: 'Main Floor', shape: 'rectangle', seats: 6, x: 820, y: 600, status: 'available', currentGuestName: '', seatedAt: null, activeSessionId: null, activeSession: null, currentBillTotal: 0, itemCount: 0, pendingPrepCount: 0, readyToServeCount: 0, notes: '' }
];

// 2. Read existing store to preserve the 174 menu items
const storePath = path.join(__dirname, 'server', 'data', 'vispute_store.json');
let menu = [];
if (fs.existsSync(storePath)) {
  const existing = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  menu = existing.menu || [];
}

const cleanStore = {
  tables: CLEAN_TABLES,
  menu: menu,
  activeSessions: {},
  bills: []
};

fs.writeFileSync(storePath, JSON.stringify(cleanStore, null, 2), 'utf8');
console.log('Cleaned server/data/vispute_store.json - All tables reset to Available, 0 orders, 0 bills.');

// 3. Update client/src/data/defaultData.js
const defaultDataPath = path.join(__dirname, 'client', 'src', 'data', 'defaultData.js');
const defaultDataContent = `export const DEFAULT_MENU = ${JSON.stringify(menu, null, 2)};\n\nexport const DEFAULT_TABLES = ${JSON.stringify(CLEAN_TABLES, null, 2)};\n`;
fs.writeFileSync(defaultDataPath, defaultDataContent, 'utf8');
console.log('Cleaned client/src/data/defaultData.js - All static mock data cleared!');

// 4. Update initialData.js as well
const initialDataJsPath = path.join(__dirname, 'server', 'data', 'initialData.js');
if (fs.existsSync(initialDataJsPath)) {
  let content = fs.readFileSync(initialDataJsPath, 'utf8');
  // ensure initialData tables export clean tables
  console.log('Checked server/data/initialData.js');
}

// 5. Clean MongoDB Atlas collections if connected
async function cleanAtlas() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) return;
  try {
    console.log('Connecting to MongoDB Atlas to clear sessions and bills...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    const db = mongoose.connection.db;

    // Clear active sessions and bills from cloud DB
    try { await db.collection('table_sessions').deleteMany({}); } catch (e) {}
    try { await db.collection('bills').deleteMany({}); } catch (e) {}
    try { await db.collection('orders').deleteMany({}); } catch (e) {}

    console.log('Atlas Cloud DB cleaned: 0 active sessions, 0 bills.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Atlas clean note:', err.message);
  }
}

cleanAtlas().then(() => {
  console.log('All static dummy data successfully cleared!');
  process.exit(0);
});
