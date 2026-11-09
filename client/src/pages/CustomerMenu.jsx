import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  Utensils, 
  Search, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Receipt, 
  AlertCircle, 
  ChevronRight, 
  Sparkles,
  ArrowLeft,
  BellRing
} from 'lucide-react';

export const CustomerMenu = ({ tableNumberOverride = null }) => {
  const { tables, menu, placeOrder, requestBill, showNotification, t, lang } = useRestaurant();

  // If tableNumber is specified via URL or override
  const [selectedTableNumber, setSelectedTableNumber] = useState(tableNumberOverride || 1);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'status'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  // Find table
  const currentTable = tables.find(t => t.tableNumber === Number(selectedTableNumber)) || tables[0];
  const activeSession = currentTable?.activeSession;

  // Categories
  const categories = useMemo(() => {
    const set = new Set(menu.map(m => m.category));
    return ['All', ...Array.from(set)];
  }, [menu]);

  // Filtered menu
  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      if (!item.isAvailable) return false;
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (vegOnly && !item.isVeg) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [menu, selectedCategory, vegOnly, searchQuery]);

  // Cart operations
  const addToCart = (dish) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === dish.id);
      if (exists) {
        return prev.map(i => i.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id: dish.id,
        name: dish.marathiName ? `${dish.marathiName} / ${dish.name}` : dish.name,
        price: dish.price,
        isVeg: dish.isVeg,
        quantity: 1,
        notes: ''
      }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const q = i.quantity + delta;
        return q > 0 ? { ...i, quantity: q } : null;
      }
      return i;
    }).filter(Boolean));
  };

  const cartTotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // Submit Order (creates new round on table session)
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      await placeOrder({
        tableNumber: currentTable.tableNumber,
        items: cart,
        guestName: customerName || currentTable.currentGuestName || `Customer (T${currentTable.tableNumber})`,
        orderType: 'QR Customer',
        notes
      });

      setCart([]);
      setNotes('');
      setShowCartDrawer(false);
      setActiveTab('status'); // Switch to live tracking
      showNotification(`Order placed for Table ${currentTable.tableNumber}! Kitchen has started cooking.`, 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestBill = async () => {
    try {
      await requestBill(currentTable.id);
      showNotification('Bill requested! Waiter & cashier have been notified.', 'bill');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  return (
    <div className="flex justify-center bg-slate-100 min-h-full py-0 sm:py-6">
      {/* Mobile-device frame container */}
      <div className="w-full max-w-md bg-white min-h-[92vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Customer Top Branding Bar */}
        <div className="bg-emerald-800 text-white p-4 shrink-0 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white text-emerald-800 font-black flex items-center justify-center text-sm shadow-sm">
                VF
              </div>
              <div>
                <h1 className="font-extrabold text-base leading-tight tracking-wide">
                  {t('brandName')}
                </h1>
                <div className="flex items-center gap-1.5 text-emerald-200 text-xs">
                  <span>{t('hotelTagline')}</span>
                </div>
              </div>
            </div>

            {/* Table Badge Selector (allows quick testing of any table) */}
            <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-xl backdrop-blur-xs border border-white/20">
              <span className="text-[11px] text-emerald-100 font-medium">टेबल / Table</span>
              <select
                value={selectedTableNumber}
                onChange={(e) => setSelectedTableNumber(Number(e.target.value))}
                className="bg-transparent text-white font-black text-sm outline-hidden cursor-pointer"
              >
                {tables.map(t => (
                  <option key={t.id} value={t.tableNumber} className="text-slate-900">
                    #{t.tableNumber} ({t.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Active Status Notification Banner */}
          {activeSession && (
            <div className="mt-3 bg-white/10 rounded-xl p-2.5 flex items-center justify-between text-xs border border-white/15">
              <div>
                <span className="text-emerald-200">{t('runningBill')}:</span>
                <span className="font-mono font-bold text-sm ml-1 text-white">
                  ₹{currentTable.currentBillTotal}
                </span>
                <span className="text-[10px] text-emerald-300 ml-1.5">
                  ({activeSession.rounds?.length || 0} {lang === 'mr' ? 'फेऱ्या' : 'rounds'})
                </span>
              </div>
              <button
                onClick={() => setActiveTab(activeTab === 'menu' ? 'status' : 'menu')}
                className="px-2.5 py-1 bg-white text-emerald-900 rounded-lg text-xs font-bold shadow-xs hover:bg-emerald-50 transition-all"
              >
                {activeTab === 'menu' ? (lang === 'mr' ? 'लाईव्ह स्थिती' : 'Track Live') : t('orderMore')}
              </button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex mt-3 bg-emerald-950/40 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                activeTab === 'menu' ? 'bg-white text-emerald-900 shadow-xs' : 'text-emerald-200'
              }`}
            >
              🍽️ {t('foodMenu')}
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all relative ${
                activeTab === 'status' ? 'bg-white text-emerald-900 shadow-xs' : 'text-emerald-200'
              }`}
            >
              🧾 {t('tableBillStatus')}
              {activeSession && (
                <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1.5 right-2" />
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: MENU ORDERING */}
        {activeTab === 'menu' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search & Veg Filter */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex gap-2 shrink-0">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  vegOnly ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {lang === 'mr' ? 'शाकाहारी 🟢' : 'Pure Veg'}
              </button>
            </div>

            {/* Categories scrollable pill list */}
            <div className="px-3 py-2 bg-white border-b border-slate-100 overflow-x-auto flex gap-1.5 shrink-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Items List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24">
              {filteredMenu.map(dish => {
                const inCart = cart.find(i => i.id === dish.id);
                return (
                  <div
                    key={dish.id}
                    className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs flex gap-3 items-center hover:border-emerald-300 transition-all"
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-20 h-20 rounded-xl object-cover border border-slate-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full border ${dish.isVeg ? 'bg-emerald-500 border-emerald-700' : 'bg-rose-500 border-rose-700'}`} />
                        <h3 className="font-bold text-xs text-slate-900 truncate">
                          {dish.marathiName ? `${dish.marathiName} / ${dish.name}` : dish.name}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                        {dish.description}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="font-black text-slate-900 font-mono text-sm">
                          ₹{dish.price}
                        </div>

                        {inCart ? (
                          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 rounded-lg px-2 py-0.5">
                            <button
                              onClick={() => updateQuantity(dish.id, -1)}
                              className="w-5 h-5 rounded bg-emerald-600 text-white font-black text-xs flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-emerald-950 font-mono">
                              {inCart.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(dish.id, 1)}
                              className="w-5 h-5 rounded bg-emerald-600 text-white font-black text-xs flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(dish)}
                            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Floating Cart Bar (Bottom) */}
            {cart.length > 0 && (
              <div className="p-3 bg-white border-t border-slate-200 shadow-xl shrink-0">
                <button
                  onClick={() => setShowCartDrawer(true)}
                  className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-xs flex items-center justify-between shadow-lg shadow-emerald-700/20"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-white text-emerald-800 font-black text-xs flex items-center justify-center">
                      {cartItemCount}
                    </span>
                    <span>View Order Summary</span>
                  </div>
                  <span className="font-mono text-sm font-black">
                    ₹{cartTotal} ➔
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TABLE BILL & LIVE STATUS */}
        {activeTab === 'status' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeSession ? (
              <div>
                {/* Active Session Overview Card */}
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                        Table #{currentTable.tableNumber} Active Bill
                      </span>
                      <div className="text-2xl font-black text-emerald-950 font-mono mt-0.5">
                        ₹{currentTable.currentBillTotal}
                      </div>
                      <div className="text-xs text-emerald-800 mt-1">
                        Guest: <span className="font-bold">{activeSession.guestName}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                        currentTable.status === 'ready' ? 'bg-amber-500 text-white pulse-badge' :
                        currentTable.status === 'preparing' ? 'bg-purple-600 text-white' :
                        currentTable.status === 'bill_requested' ? 'bg-rose-600 text-white' :
                        'bg-emerald-600 text-white'
                      }`}>
                        {currentTable.status.replace('_', ' ')}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1 font-mono">
                        {activeSession.rounds?.length || 0} order rounds
                      </div>
                    </div>
                  </div>

                  {/* Customer Repeated Ordering Note */}
                  <div className="mt-3 pt-3 border-t border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Table is active! You can order repeatedly anytime during your meal; all items stay on this same bill.
                    </span>
                  </div>
                </div>

                {/* Multi-Round Breakdown */}
                <div className="mt-4 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Live Kitchen Status of Your Dishes
                  </h3>

                  {activeSession.rounds?.map((round) => (
                    <div key={round.roundNumber} className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-700">
                        <span>Round {round.roundNumber} ({round.orderType})</span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {new Date(round.orderedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="mt-2.5 space-y-2">
                        {round.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                item.status === 'served' ? 'bg-slate-400' :
                                item.status === 'prepared' ? 'bg-amber-500' :
                                'bg-purple-500 animate-pulse'
                              }`} />
                              <span className="font-bold text-slate-800">
                                {item.quantity}× {item.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                item.status === 'served' ? 'bg-slate-100 text-slate-600' :
                                item.status === 'prepared' ? 'bg-amber-100 text-amber-800' :
                                item.status === 'preparing' ? 'bg-purple-100 text-purple-800' :
                                'bg-amber-50 text-amber-700'
                              }`}>
                                {item.status === 'prepared' ? 'Ready to Serve' : item.status}
                              </span>
                              <span className="font-mono font-bold text-slate-900">
                                ₹{item.price * item.quantity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bill Request or Order More Action Buttons */}
                <div className="mt-6 space-y-2 pt-2">
                  <button
                    onClick={() => setActiveTab('menu')}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> {t('orderMore')} (Round {(activeSession.rounds?.length || 0) + 1})
                  </button>

                  <button
                    onClick={handleRequestBill}
                    className="w-full py-2.5 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <Receipt className="w-4 h-4" /> {t('callWaiterToPay')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No Active Order on Table {currentTable.tableNumber}</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Browse our menu and place your first round of starters or beverages to get started!
                </p>
                <button
                  onClick={() => setActiveTab('menu')}
                  className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Browse Menu
                </button>
              </div>
            )}
          </div>
        )}

        {/* CART CHECKOUT DRAWER */}
        {showCartDrawer && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
            <div className="w-full max-w-md bg-white h-full flex flex-col justify-between animate-in slide-in-from-right">
              {/* Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCartDrawer(false)}
                    className="p-1 rounded-lg hover:bg-slate-200"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <h3 className="font-bold text-sm text-slate-800">
                    Your Order (Table #{currentTable.tableNumber})
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {cartItemCount} items
                </span>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="font-bold text-xs text-slate-900">{item.name}</span>
                      </div>
                      <span className="font-bold font-mono text-xs text-slate-900">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        placeholder="Special request (e.g. less oil)..."
                        value={item.notes}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCart(prev => prev.map(i => i.id === item.id ? { ...i, notes: val } : i));
                        }}
                        className="flex-1 mr-2 px-2 py-1 bg-white border border-slate-200 rounded text-[11px]"
                      />

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-5 h-5 rounded bg-slate-200 font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold font-mono">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-5 h-5 rounded bg-slate-200 font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Optional Customer Name */}
                <div className="pt-2">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Your Name (Optional for Order Calling):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Patil"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Bottom Send Button */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Round Total:</span>
                  <span className="text-base font-black font-mono text-slate-900">₹{cartTotal}</span>
                </div>

                <button
                  disabled={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <Utensils className="w-4 h-4" />
                  {isSubmitting ? 'Sending to Kitchen...' : `Confirm & Send to Kitchen (₹${cartTotal})`}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
