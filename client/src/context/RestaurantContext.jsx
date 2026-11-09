import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { playAudioChime } from '../utils/audio';
import { translations } from '../utils/translations';

const RestaurantContext = createContext(null);

export const RestaurantProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [lang, setLang] = useState('mr'); // 'mr' (Marathi) by default, or 'en'
  const [stats, setStats] = useState({
    totalTables: 12,
    occupied: 0,
    available: 12,
    kitchenQueue: 0,
    readyToServe: 0,
    billRequested: 0,
    todayRevenue: 0,
  });
  const [bills, setBills] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeNotification, setActiveNotification] = useState(null);

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

  useEffect(() => {
    // Determine backend URL
    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '/';
    const s = io(socketUrl, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    s.on('connect', () => {
      setConnected(true);
      console.log('✅ Connected to Vispute Food Court Live Engine');
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    s.on('init:data', (data) => {
      if (data.tables) setTables(data.tables);
      if (data.menu) setMenu(data.menu);
      if (data.stats) setStats(data.stats);
    });

    s.on('tables:updated', (updatedTables) => {
      setTables(updatedTables);
      // Refresh stats
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(() => {});
    });

    s.on('menu:updated', (updatedMenu) => {
      setMenu(updatedMenu);
    });

    s.on('order:new', (data) => {
      if (soundEnabled) playAudioChime('order');
      showNotification(`🔔 New Order received for Table ${data.tableNumber} (Round ${data.round.roundNumber})!`, 'order');
    });

    s.on('order:itemStatusUpdated', (data) => {
      if (data.status === 'prepared') {
        if (soundEnabled) playAudioChime('ready');
        showNotification(`🍲 Chef prepared item for Table ${data.tableNumber}! Ready for Waiter pickup.`, 'ready');
      }
    });

    s.on('bill:requested', (data) => {
      if (soundEnabled) playAudioChime('ready');
      showNotification(`💳 Table ${data.tableNumber} requested Bill!`, 'bill');
    });

    s.on('bill:settled', (data) => {
      if (soundEnabled) playAudioChime('settle');
      showNotification(`✅ Table ${data.tableNumber} Bill Settled (₹${data.bill.grandTotal}). Table is now FREE!`, 'success');
      // Refresh bills
      fetch('/api/billing/history')
        .then(res => res.json())
        .then(setBills)
        .catch(() => {});
    });

    setSocket(s);

    // Initial fetch fallback
    fetch('/api/tables').then(r => r.json()).then(setTables).catch(() => {});
    fetch('/api/menu').then(r => r.json()).then(setMenu).catch(() => {});
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
    fetch('/api/billing/history').then(r => r.json()).then(setBills).catch(() => {});

    return () => {
      s.disconnect();
    };
  }, [soundEnabled, showNotification]);

  // Actions
  const placeOrder = async ({ tableId, tableNumber, items, guestName, orderType, notes }) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId, tableNumber, items, guestName, orderType, notes })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to place order');
    }
    return res.json();
  };

  const updateItemStatus = async ({ tableId, roundNumber, itemId, status }) => {
    const res = await fetch('/api/orders/item-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId, roundNumber, itemId, status })
    });
    if (!res.ok) throw new Error('Failed to update item status');
    return res.json();
  };

  const updateRoundStatus = async ({ tableId, roundNumber, status }) => {
    const res = await fetch('/api/orders/round-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId, roundNumber, status })
    });
    if (!res.ok) throw new Error('Failed to update round');
    return res.json();
  };

  const requestBill = async (tableId) => {
    const res = await fetch(`/api/tables/${tableId}/request-bill`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to request bill');
    return res.json();
  };

  const settleBill = async ({ tableId, paymentMethod, discountPercent, discountAmount, notes }) => {
    const res = await fetch('/api/billing/settle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId, paymentMethod, discountPercent, discountAmount, notes })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to settle bill');
    }
    return res.json();
  };

  const toggleMenuItem = async (id) => {
    const res = await fetch(`/api/menu/${id}/toggle`, { method: 'PATCH' });
    return res.json();
  };

  const addMenuItem = async (item) => {
    const res = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return res.json();
  };

  const resetDemo = async () => {
    await fetch('/api/reset-demo', { method: 'POST' });
    showNotification('Demo state restored to original initial data', 'info');
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
