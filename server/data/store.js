const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { initialMenu, initialTables, initialSessions } = require('./initialData');

const DB_FILE = path.join(__dirname, 'vispute_store.json');

class Store {
  constructor() {
    this.menu = [];
    this.tables = [];
    this.sessions = [];
    this.bills = [];
    this.isMongoConnected = false;
    this.io = null;

    this.init();
  }

  setIO(io) {
    this.io = io;
  }

  emitUpdate(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  init() {
    // Attempt to load from JSON file first as safe fallback
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.menu = parsed.menu || initialMenu;
        this.tables = parsed.tables || initialTables;
        this.sessions = parsed.sessions || initialSessions;
        this.bills = parsed.bills || [];
      } catch (err) {
        console.error('Error reading local store file, initializing defaults:', err);
        this.resetDefaults();
      }
    } else {
      this.resetDefaults();
      this.saveToFile();
    }

    // Try connecting to MongoDB Atlas asynchronously
    this.connectMongoDB();
  }

  resetDefaults() {
    this.menu = [...initialMenu];
    this.tables = [...initialTables];
    this.sessions = [...initialSessions];
    this.bills = [];
  }

  saveToFile() {
    try {
      const data = {
        menu: this.menu,
        tables: this.tables,
        sessions: this.sessions,
        bills: this.bills,
        lastSaved: new Date().toISOString()
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save to local store file:', err);
    }
  }

  async connectMongoDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri) return;

    try {
      console.log('🔄 Connecting to MongoDB Atlas...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
      });
      this.isMongoConnected = true;
      console.log('🌟 [Vispute Food Court] Connected to MongoDB Atlas Cluster!');
    } catch (err) {
      this.isMongoConnected = false;
      console.log('ℹ️ Note on MongoDB Atlas:', err.message);
      console.log('👉 Tip: Whitelist current IP (e.g. 157.32.193.148 or 0.0.0.0/0) in Atlas > Security > Network Access');
      console.log('⚡ Active Store: Persistent local high-performance storage initialized seamlessly.');
    }
  }

  // --- MENU METHODS ---
  getMenu() {
    return this.menu;
  }

  toggleMenuItem(id) {
    const item = this.menu.find(m => m.id === id);
    if (item) {
      item.isAvailable = !item.isAvailable;
      this.saveToFile();
      this.emitUpdate('menu:updated', this.menu);
    }
    return item;
  }

  addMenuItem(itemData) {
    const newItem = {
      id: 'm' + (Date.now()),
      name: itemData.name,
      marathiName: itemData.marathiName || itemData.name,
      category: itemData.category || 'Special Veg',
      categoryMr: itemData.categoryMr || itemData.category || 'स्पेशल व्हेज',
      price: Number(itemData.price),
      isVeg: Boolean(itemData.isVeg),
      rating: 4.8,
      description: itemData.description || '',
      image: itemData.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60',
      isAvailable: true,
      prepTime: itemData.prepTime || '12 mins'
    };
    this.menu.push(newItem);
    this.saveToFile();
    this.emitUpdate('menu:updated', this.menu);
    return newItem;
  }

  // --- TABLES METHODS ---
  getTables() {
    return this.tables.map(table => {
      const activeSession = this.sessions.find(s => s.id === table.activeSessionId && s.status !== 'settled');
      let totalAmount = 0;
      let itemCount = 0;
      let pendingPrepCount = 0;
      let readyToServeCount = 0;

      if (activeSession) {
        activeSession.rounds.forEach(round => {
          round.items.forEach(item => {
            totalAmount += (item.price * item.quantity);
            itemCount += item.quantity;
            if (item.status === 'received' || item.status === 'preparing') {
              pendingPrepCount += item.quantity;
            }
            if (item.status === 'prepared') {
              readyToServeCount += item.quantity;
            }
          });
        });
      }

      return {
        ...table,
        currentBillTotal: totalAmount,
        itemCount,
        pendingPrepCount,
        readyToServeCount,
        activeSession
      };
    });
  }

  getTable(idOrNum) {
    return this.getTables().find(t => t.id === idOrNum || String(t.tableNumber) === String(idOrNum));
  }

  updateTableLayout(id, x, y) {
    const table = this.tables.find(t => t.id === id);
    if (table) {
      table.x = x;
      table.y = y;
      this.saveToFile();
      this.emitUpdate('tables:updated', this.getTables());
    }
    return table;
  }

  // --- ORDER & SESSION METHODS ---
  // Table stays occupied until billing settled! Customer can order repeatedly on same table.
  createOrAppendOrder({ tableIdOrNum, items, guestName, orderType = 'QR Customer', notes = '' }) {
    let table = this.tables.find(t => t.id === tableIdOrNum || String(t.tableNumber) === String(tableIdOrNum));
    if (!table) {
      throw new Error('Table not found: ' + tableIdOrNum);
    }

    let session = this.sessions.find(s => s.id === table.activeSessionId && s.status !== 'settled');

    if (!session) {
      // Start a brand new active session for this table
      const newSessionId = `session-${table.id}-${Date.now()}`;
      session = {
        id: newSessionId,
        tableId: table.id,
        tableNumber: table.tableNumber,
        guestName: guestName || table.currentGuestName || `Guest (T${table.tableNumber})`,
        status: 'active',
        startedAt: new Date().toISOString(),
        rounds: []
      };
      this.sessions.push(session);

      table.activeSessionId = newSessionId;
      table.currentGuestName = session.guestName;
      table.seatedAt = session.startedAt;
    } else if (guestName && !table.currentGuestName) {
      table.currentGuestName = guestName;
      session.guestName = guestName;
    }

    const roundNumber = session.rounds.length + 1;
    const formattedItems = items.map((item, idx) => ({
      id: `item-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
      menuItemId: item.id || item.menuItemId,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity || 1),
      isVeg: Boolean(item.isVeg),
      status: 'received', // received -> preparing -> prepared -> served
      notes: item.notes || notes || '',
      orderedAt: new Date().toISOString()
    }));

    const newRound = {
      roundNumber,
      orderedAt: new Date().toISOString(),
      orderType,
      notes,
      items: formattedItems
    };

    session.rounds.push(newRound);

    // Update table status to occupied/preparing
    table.status = 'preparing';
    table.lastOrderAt = new Date().toISOString();

    this.saveToFile();

    // Real-time broadcast
    this.emitUpdate('order:new', {
      tableId: table.id,
      tableNumber: table.tableNumber,
      session,
      round: newRound
    });
    this.emitUpdate('tables:updated', this.getTables());

    return {
      table: this.getTable(table.id),
      session,
      round: newRound
    };
  }

  // Kitchen or Waiter updates item status
  updateItemStatus({ tableId, roundNumber, itemId, status }) {
    const session = this.sessions.find(s => (s.tableId === tableId || String(s.tableNumber) === String(tableId)) && s.status !== 'settled');
    if (!session) throw new Error('Active session not found');

    const round = session.rounds.find(r => r.roundNumber === Number(roundNumber));
    if (!round) throw new Error('Round not found');

    const item = round.items.find(i => i.id === itemId);
    if (!item) throw new Error('Item not found');

    item.status = status;
    if (status === 'prepared') {
      item.preparedAt = new Date().toISOString();
    } else if (status === 'served') {
      item.servedAt = new Date().toISOString();
    }

    // Refresh table overall status
    this.recomputeTableStatus(session.tableId);
    this.saveToFile();

    this.emitUpdate('order:itemStatusUpdated', {
      tableId: session.tableId,
      tableNumber: session.tableNumber,
      roundNumber,
      itemId,
      status,
      session
    });
    this.emitUpdate('tables:updated', this.getTables());

    return { session, item };
  }

  // Update whole round status at once
  updateRoundStatus({ tableId, roundNumber, status }) {
    const session = this.sessions.find(s => (s.tableId === tableId || String(s.tableNumber) === String(tableId)) && s.status !== 'settled');
    if (!session) throw new Error('Active session not found');

    const round = session.rounds.find(r => r.roundNumber === Number(roundNumber));
    if (!round) throw new Error('Round not found');

    round.items.forEach(item => {
      item.status = status;
      if (status === 'prepared') item.preparedAt = new Date().toISOString();
      if (status === 'served') item.servedAt = new Date().toISOString();
    });

    this.recomputeTableStatus(session.tableId);
    this.saveToFile();

    this.emitUpdate('order:roundUpdated', {
      tableId: session.tableId,
      roundNumber,
      status,
      session
    });
    this.emitUpdate('tables:updated', this.getTables());

    return round;
  }

  recomputeTableStatus(tableId) {
    const table = this.tables.find(t => t.id === tableId);
    if (!table) return;

    const session = this.sessions.find(s => s.id === table.activeSessionId && s.status !== 'settled');
    if (!session) {
      table.status = 'available';
      table.currentGuestName = null;
      table.seatedAt = null;
      return;
    }

    if (session.status === 'bill_requested') {
      table.status = 'bill_requested';
      return;
    }

    // Check all items
    const allItems = session.rounds.flatMap(r => r.items);
    const hasPrepared = allItems.some(i => i.status === 'prepared');
    const hasPreparing = allItems.some(i => i.status === 'received' || i.status === 'preparing');

    if (hasPrepared) {
      table.status = 'ready'; // Food is ready for waiter to pick up
    } else if (hasPreparing) {
      table.status = 'preparing';
    } else {
      table.status = 'occupied';
    }
  }

  requestBill(tableIdOrNum) {
    const table = this.tables.find(t => t.id === tableIdOrNum || String(t.tableNumber) === String(tableIdOrNum));
    if (!table) throw new Error('Table not found');

    const session = this.sessions.find(s => s.id === table.activeSessionId && s.status !== 'settled');
    if (!session) throw new Error('No active order for this table');

    session.status = 'bill_requested';
    table.status = 'bill_requested';

    this.saveToFile();

    this.emitUpdate('bill:requested', {
      tableId: table.id,
      tableNumber: table.tableNumber,
      session
    });
    this.emitUpdate('tables:updated', this.getTables());

    return { table, session };
  }

  // --- BILLING COUNTER SETTLEMENT ---
  settleBill({ tableIdOrNum, paymentMethod = 'Cash', discountPercent = 0, discountAmount = 0, notes = '' }) {
    const table = this.tables.find(t => t.id === tableIdOrNum || String(t.tableNumber) === String(tableIdOrNum));
    if (!table) throw new Error('Table not found');

    const session = this.sessions.find(s => s.id === table.activeSessionId && s.status !== 'settled');
    if (!session) throw new Error('No active session on this table');

    // Consolidate all items across all rounds
    const allItems = [];
    let subtotal = 0;

    session.rounds.forEach(round => {
      round.items.forEach(item => {
        const lineTotal = item.price * item.quantity;
        subtotal += lineTotal;
        allItems.push({
          ...item,
          roundNumber: round.roundNumber,
          lineTotal
        });
      });
    });

    let discount = Number(discountAmount) || 0;
    if (discountPercent > 0) {
      discount = Math.round((subtotal * discountPercent) / 100);
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const cgst = Math.round((discountedSubtotal * 0.025) * 100) / 100;
    const sgst = Math.round((discountedSubtotal * 0.025) * 100) / 100;
    const totalTax = cgst + sgst;
    const grandTotal = Math.round(discountedSubtotal + totalTax);

    const invoiceNumber = `VFC-${new Date().getFullYear()}-${1000 + this.bills.length + 1}`;

    const billRecord = {
      id: `bill-${Date.now()}`,
      invoiceNumber,
      sessionId: session.id,
      tableId: table.id,
      tableNumber: table.tableNumber,
      guestName: session.guestName || 'Valued Customer',
      seatedAt: session.startedAt,
      settledAt: new Date().toISOString(),
      items: allItems,
      roundsCount: session.rounds.length,
      subtotal,
      discount,
      cgst,
      sgst,
      totalTax,
      grandTotal,
      paymentMethod,
      notes,
      status: 'paid'
    };

    this.bills.push(billRecord);

    // Mark session as settled
    session.status = 'settled';
    session.settledAt = billRecord.settledAt;
    session.billId = billRecord.id;

    // IMPORTANT REQUIREMENT: TABLE IS NOW FREED / AVAILABLE
    table.activeSessionId = null;
    table.status = 'available';
    table.currentGuestName = null;
    table.seatedAt = null;
    table.lastOrderAt = null;

    this.saveToFile();

    this.emitUpdate('bill:settled', {
      tableId: table.id,
      tableNumber: table.tableNumber,
      bill: billRecord
    });
    this.emitUpdate('tables:updated', this.getTables());

    return billRecord;
  }

  getBills() {
    return this.bills.slice().reverse();
  }

  getLiveStats() {
    const allTables = this.getTables();
    const occupied = allTables.filter(t => t.status === 'occupied').length;
    const preparing = allTables.filter(t => t.status === 'preparing').length;
    const ready = allTables.filter(t => t.status === 'ready').length;
    const billRequested = allTables.filter(t => t.status === 'bill_requested').length;
    const available = allTables.filter(t => t.status === 'available').length;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayBills = this.bills.filter(b => new Date(b.settledAt) >= todayStart);
    const todayRevenue = todayBills.reduce((acc, b) => acc + (b.grandTotal || 0), 0);

    // Total active kitchen items
    let kitchenQueue = 0;
    this.sessions.filter(s => s.status !== 'settled').forEach(s => {
      s.rounds.forEach(r => {
        r.items.forEach(i => {
          if (i.status === 'received' || i.status === 'preparing') {
            kitchenQueue += i.quantity;
          }
        });
      });
    });

    return {
      totalTables: allTables.length,
      occupied: occupied + preparing + ready,
      available,
      kitchenQueue,
      readyToServe: ready,
      billRequested,
      todayBillsCount: todayBills.length,
      todayRevenue
    };
  }
}

const store = new Store();
module.exports = store;
