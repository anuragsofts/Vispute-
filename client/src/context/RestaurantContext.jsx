import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import { playAudioChime } from '../utils/audio';
import { translations } from '../utils/translations';
import { DEFAULT_MENU, DEFAULT_TABLES } from '../data/defaultData';

const RestaurantContext = createContext(null);

export const RestaurantProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(true); // default true for snappy UI
  const [lang, setLang] = useState('mr'); // Marathi by default
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeNotification, setActiveNotification] = useState(null);

  // Auto-clear old mock/static data on version change
  const STORAGE_VERSION = 'vfc_clean_live_2026';
  try {
    if (typeof window !== 'undefined' && localStorage.getItem('vispute_storage_version') !== STORAGE_VERSION) {
      localStorage.removeItem('vispute_tables');
      localStorage.removeItem('vispute_bills');
      localStorage.removeItem('vispute_orders');
      localStorage.setItem('vispute_storage_version', STORAGE_VERSION);
    }
  } catch (e) {}

  // Initialize Tables with clean fresh tables (all 12 available, 0 bills)
  const [tables, setTables] = useState(() => {
    try {
      const saved = localStorage.getItem('vispute_tables');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_TABLES;
  });

  // Initialize Menu with full 174 items offline seed fallback
  const [menu, setMenu] = useState(() => {
    try {
      const saved = localStorage.getItem('vispute_menu');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_MENU;
  });

  const [bills, setBills] = useState(() => {
    try {
      const saved = localStorage.getItem('vispute_bills');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Calculate live stats dynamically
  const stats = useMemo(() => {
    let occupied = 0;
    let available = 0;
    let kitchenQueue = 0;
    let readyToServe = 0;
    let billRequested = 0;

    tables.forEach(t => {
      if (t.status === 'occupied') occupied++;
      else if (t.status === 'available') available++;
      else if (t.status === 'preparing') {
        occupied++;
        kitchenQueue += t.pendingPrepCount || 1;
      } else if (t.status === 'ready') {
        occupied++;
        readyToServe += t.readyToServeCount || 1;
      } else if (t.status === 'bill_requested') {
        occupied++;
        billRequested++;
      }
    });

    const todayRevenue = bills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);

    return {
      totalTables: tables.length,
      occupied,
      available,
      kitchenQueue,
      readyToServe,
      billRequested,
      todayRevenue
    };
  }, [tables, bills]);

  // Persist state changes in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vispute_tables', JSON.stringify(tables));
    } catch (e) {}
  }, [tables]);

  useEffect(() => {
    try {
      localStorage.setItem('vispute_menu', JSON.stringify(menu));
    } catch (e) {}
  }, [menu]);

  useEffect(() => {
    try {
      localStorage.setItem('vispute_bills', JSON.stringify(bills));
    } catch (e) {}
  }, [bills]);

  const t = useCallback((key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  }, [lang]);

  const toggleLang = () => {
    setLang(prev => prev === 'mr' ? 'en' : 'mr');
  };

  const showNotification = useCallback((message, type = 'info') => {
    setActiveNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setActiveNotification(null);
    }, 4500);
  }, []);

  // Socket & Live API Sync
  useEffect(() => {
    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '/';
    let s = null;
    try {
      s = io(socketUrl, {
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 4000
      });

      s.on('connect', () => {
        setConnected(true);
      });

      s.on('disconnect', () => {
        // on pure static vercel, remains live locally
      });

      s.on('init:data', (data) => {
        if (data.tables && data.tables.length > 0) setTables(data.tables);
        if (data.menu && data.menu.length > 0) setMenu(data.menu);
      });

      s.on('tables:updated', (updatedTables) => {
        if (updatedTables) setTables(updatedTables);
      });

      s.on('menu:updated', (updatedMenu) => {
        if (updatedMenu) setMenu(updatedMenu);
      });

      s.on('order:new', (data) => {
        if (soundEnabled) playAudioChime('order');
        showNotification(`🔔 नवीन ऑर्डर: टेबल ${data.tableNumber} (फेरी ${data.round.roundNumber})!`, 'order');
      });

      s.on('order:itemStatusUpdated', (data) => {
        if (data.status === 'prepared') {
          if (soundEnabled) playAudioChime('ready');
          showNotification(`🍲 टेबल ${data.tableNumber} चे पदार्थ तयार आहेत! वेटरने पिकअप करावे.`, 'ready');
        }
      });

      s.on('bill:requested', (data) => {
        if (soundEnabled) playAudioChime('ready');
        showNotification(`💳 टेबल ${data.tableNumber} ने बिल मागवले!`, 'bill');
      });

      s.on('bill:settled', (data) => {
        if (soundEnabled) playAudioChime('settle');
        showNotification(`✅ टेबल ${data.tableNumber} चे बिल जमा झाले (₹${data.bill.grandTotal}). टेबल मोकळे झाले!`, 'success');
      });

      setSocket(s);
    } catch (e) {}

    // Fetch from REST API if available
    fetch('/api/tables')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && data.length) setTables(data); })
      .catch(() => {});

    fetch('/api/menu')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && data.length) setMenu(data); })
      .catch(() => {});

    fetch('/api/billing/history')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && data.length) setBills(data); })
      .catch(() => {});

    return () => {
      if (s) s.disconnect();
    };
  }, [soundEnabled, showNotification]);

  // Actions with local execution + API sync
  const placeOrder = async ({ tableId, tableNumber, items, guestName, orderType, notes }) => {
    const targetNum = Number(tableNumber);

    // Update local state immediately
    setTables(prev => prev.map(tbl => {
      if (tbl.tableNumber === targetNum) {
        const orderRound = {
          roundNumber: (tbl.activeSession?.rounds?.length || 0) + 1,
          orderedAt: new Date().toISOString(),
          orderType: orderType || 'QR Customer',
          notes: notes || '',
          items: items.map(i => ({
            id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            isVeg: i.isVeg,
            notes: i.notes || '',
            status: 'preparing'
          }))
        };

        const existingRounds = tbl.activeSession?.rounds || [];
        const newRounds = [...existingRounds, orderRound];
        const newBillTotal = newRounds.reduce((sum, r) => {
          return sum + r.items.reduce((rSum, item) => rSum + (item.price * item.quantity), 0);
        }, 0);

        const newSession = {
          id: tbl.activeSession?.id || `session-t${targetNum}-${Date.now()}`,
          tableId: tbl.id,
          tableNumber: targetNum,
          guestName: guestName || tbl.currentGuestName || `Customer (T${targetNum})`,
          status: 'active',
          startedAt: tbl.activeSession?.startedAt || new Date().toISOString(),
          rounds: newRounds
        };

        return {
          ...tbl,
          status: 'preparing',
          currentGuestName: newSession.guestName,
          seatedAt: tbl.seatedAt || newSession.startedAt,
          activeSessionId: newSession.id,
          activeSession: newSession,
          currentBillTotal: newBillTotal,
          itemCount: newRounds.reduce((acc, r) => acc + r.items.length, 0),
          pendingPrepCount: newRounds.reduce((acc, r) => acc + r.items.filter(i => i.status === 'preparing').length, 0),
          lastOrderAt: new Date().toISOString()
        };
      }
      return tbl;
    }));

    if (soundEnabled) playAudioChime('order');

    // Try backend sync
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, tableNumber, items, guestName, orderType, notes })
      });
    } catch (e) {}

    return { success: true };
  };

  const updateItemStatus = async ({ tableId, roundNumber, itemId, status }) => {
    setTables(prev => prev.map(tbl => {
      if (tbl.id === tableId && tbl.activeSession) {
        const updatedRounds = tbl.activeSession.rounds.map(r => {
          if (r.roundNumber === roundNumber) {
            return {
              ...r,
              items: r.items.map(i => i.id === itemId ? { ...i, status } : i)
            };
          }
          return r;
        });

        const hasPreparing = updatedRounds.some(r => r.items.some(i => i.status === 'preparing'));
        const hasPrepared = updatedRounds.some(r => r.items.some(i => i.status === 'prepared'));

        let newStatus = tbl.status;
        if (newStatus !== 'bill_requested') {
          if (hasPrepared) newStatus = 'ready';
          else if (hasPreparing) newStatus = 'preparing';
        }

        return {
          ...tbl,
          status: newStatus,
          activeSession: {
            ...tbl.activeSession,
            rounds: updatedRounds
          }
        };
      }
      return tbl;
    }));

    try {
      await fetch('/api/orders/item-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, roundNumber, itemId, status })
      });
    } catch (e) {}
  };

  const updateRoundStatus = async ({ tableId, roundNumber, status }) => {
    setTables(prev => prev.map(tbl => {
      if (tbl.id === tableId && tbl.activeSession) {
        const updatedRounds = tbl.activeSession.rounds.map(r => {
          if (r.roundNumber === roundNumber) {
            return {
              ...r,
              items: r.items.map(i => ({ ...i, status }))
            };
          }
          return r;
        });
        return {
          ...tbl,
          activeSession: { ...tbl.activeSession, rounds: updatedRounds }
        };
      }
      return tbl;
    }));

    try {
      await fetch('/api/orders/round-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, roundNumber, status })
      });
    } catch (e) {}
  };

  const requestBill = async (tableId) => {
    setTables(prev => prev.map(tbl => {
      if (tbl.id === tableId) {
        return { ...tbl, status: 'bill_requested' };
      }
      return tbl;
    }));

    if (soundEnabled) playAudioChime('ready');
    showNotification('बिलाची मागणी नोंदवली गेली आहे!', 'bill');

    try {
      await fetch(`/api/tables/${tableId}/request-bill`, { method: 'POST' });
    } catch (e) {}
  };

  const settleBill = async ({ tableId, paymentMethod, discountPercent, discountAmount, notes }) => {
    const targetTable = tables.find(t => t.id === tableId);
    if (!targetTable) return;

    const consolidatedItems = [];
    if (targetTable.activeSession?.rounds) {
      targetTable.activeSession.rounds.forEach(round => {
        round.items.forEach(item => {
          consolidatedItems.push({
            ...item,
            lineTotal: item.price * item.quantity
          });
        });
      });
    }

    const subtotal = consolidatedItems.reduce((sum, i) => sum + i.lineTotal, 0);
    const discount = discountPercent > 0 
      ? Math.round((subtotal * discountPercent) / 100) 
      : (Number(discountAmount) || 0);
    const discountedSubtotal = Math.max(0, subtotal - discount);
    const cgst = Math.round((discountedSubtotal * 0.025) * 100) / 100;
    const sgst = Math.round((discountedSubtotal * 0.025) * 100) / 100;
    const grandTotal = Math.round(discountedSubtotal + cgst + sgst);

    const newBill = {
      billNumber: `VFC-${Date.now().toString().slice(-6)}`,
      tableNumber: targetTable.tableNumber,
      guestName: targetTable.currentGuestName || 'Customer',
      settledAt: new Date().toISOString(),
      items: consolidatedItems,
      subtotal,
      discount,
      cgst,
      sgst,
      grandTotal,
      paymentMethod,
      notes
    };

    setBills(prev => [newBill, ...prev]);

    // Free the table
    setTables(prev => prev.map(tbl => {
      if (tbl.id === tableId) {
        return {
          ...tbl,
          status: 'available',
          currentGuestName: '',
          seatedAt: null,
          activeSessionId: null,
          activeSession: null,
          currentBillTotal: 0,
          itemCount: 0,
          pendingPrepCount: 0,
          readyToServeCount: 0
        };
      }
      return tbl;
    }));

    if (soundEnabled) playAudioChime('settle');
    showNotification(`✅ टेबल ${targetTable.tableNumber} चे बिल (₹${grandTotal}) जमा झाले आणि टेबल मोकळे झाले!`, 'success');

    try {
      await fetch('/api/billing/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, paymentMethod, discountPercent, discountAmount, notes })
      });
    } catch (e) {}

    return newBill;
  };

  const toggleMenuItem = async (id) => {
    setMenu(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, isAvailable: !item.isAvailable };
      }
      return item;
    }));

    try {
      await fetch(`/api/menu/${id}/toggle`, { method: 'PATCH' });
    } catch (e) {}
  };

  const addMenuItem = async (dishData) => {
    const newItem = {
      id: `vfc-m-${Date.now()}`,
      rating: 4.8,
      isAvailable: true,
      prepTime: '12 mins',
      ...dishData
    };

    setMenu(prev => [newItem, ...prev]);

    try {
      await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
    } catch (e) {}

    return newItem;
  };

  const resetDemo = async () => {
    setTables(DEFAULT_TABLES);
    setMenu(DEFAULT_MENU);
    setBills([]);
    localStorage.removeItem('vispute_tables');
    localStorage.removeItem('vispute_menu');
    localStorage.removeItem('vispute_bills');
    showNotification('सर्व डेटा पूर्ववत रिसेट झाला!', 'info');

    try {
      await fetch('/api/reset-demo', { method: 'POST' });
    } catch (e) {}
  };

  return (
    <RestaurantContext.Provider value={{
      socket,
      connected,
      tables,
      menu,
      lang,
      setLang,
      toggleLang,
      t,
      stats,
      bills,
      soundEnabled,
      setSoundEnabled,
      activeNotification,
      showNotification,
      placeOrder,
      updateItemStatus,
      updateRoundStatus,
      requestBill,
      settleBill,
      toggleMenuItem,
      addMenuItem,
      resetDemo
    }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error('useRestaurant must be used within RestaurantProvider');
  return context;
};
