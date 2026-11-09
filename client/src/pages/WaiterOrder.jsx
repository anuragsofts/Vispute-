import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  UtensilsCrossed, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  CheckCircle, 
  Bell, 
  Users, 
  Receipt, 
  Clock, 
  ChefHat, 
  Filter,
  Check
} from 'lucide-react';

export const WaiterOrder = ({ initialSelectedTable = null }) => {
  const { tables, menu, placeOrder, updateItemStatus, requestBill, showNotification, t, lang } = useRestaurant();
  
  const [selectedTableId, setSelectedTableId] = useState(
    initialSelectedTable ? initialSelectedTable.id : (tables[0]?.id || 'T1')
  );
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' or 'pickup'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [cart, setCart] = useState([]); // [{ id, name, price, quantity, isVeg, notes }]
  const [guestName, setGuestName] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTable = tables.find(t => t.id === selectedTableId) || tables[0];

  // Categories
  const categories = useMemo(() => {
    const set = new Set(menu.map(m => m.category));
    return ['All', ...Array.from(set)];
  }, [menu]);

  // Filtered menu items
  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
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
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id: item.id,
        name: item.marathiName ? `${item.marathiName} / ${item.name}` : item.name,
        price: item.price,
        quantity: 1,
        isVeg: item.isVeg,
        notes: ''
      }];
    });
  };

  const updateCartQuantity = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : null;
      }
      return i;
    }).filter(Boolean));
  };

  const updateItemNotes = (id, notes) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, notes } : i));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Submit Waiter Order
  const handleSendToKitchen = async () => {
    if (cart.length === 0) {
      showNotification('Cart is empty. Please select dishes first.', 'error');
      return;
    }
    if (!selectedTable) return;

    setIsSubmitting(true);
    try {
      await placeOrder({
        tableId: selectedTable.id,
        tableNumber: selectedTable.tableNumber,
        items: cart,
        guestName: guestName || selectedTable.currentGuestName || `Guest (T${selectedTable.tableNumber})`,
        orderType: 'Waiter Manual POS',
        notes: orderNotes
      });

      setCart([]);
      setOrderNotes('');
      setGuestName('');
      showNotification(`🎉 Order sent to kitchen for ${selectedTable.name}!`, 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Waiter Pickup Items: collect all items across all tables that are marked 'prepared'
  const preparedItemsForPickup = [];
  tables.forEach(table => {
    if (table.activeSession?.rounds) {
      table.activeSession.rounds.forEach(round => {
        round.items.forEach(item => {
          if (item.status === 'prepared') {
            preparedItemsForPickup.push({
              tableId: table.id,
              tableNumber: table.tableNumber,
              tableName: table.name,
              roundNumber: round.roundNumber,
              item
            });
          }
        });
      });
    }
  });

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Waiter Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800">
              Waiter POS & Service Terminal
            </h1>
            <p className="text-xs text-slate-500">
              Manual order taking for guests & table takeaway delivery alerts
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'pos' ? 'bg-white shadow-xs text-slate-900 font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
            Take Manual Order
          </button>
          <button
            onClick={() => setActiveTab('pickup')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 relative ${
              activeTab === 'pickup' ? 'bg-white shadow-xs text-slate-900 font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ChefHat className="w-4 h-4 text-amber-600" />
            Kitchen Pickup & Deliver
            {preparedItemsForPickup.length > 0 && (
              <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                {preparedItemsForPickup.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'pos' ? (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Column: Table Selector + Menu Grid */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-200">
            {/* Table Carousel Selector */}
            <div className="bg-white px-6 py-3 border-b border-slate-200 overflow-x-auto flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                Table:
              </span>
              {tables.map(table => {
                const isSelected = table.id === selectedTableId;
                return (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTableId(table.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm'
                        : table.status === 'occupied' || table.status === 'preparing' || table.status === 'ready'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>T{table.tableNumber}</span>
                    {table.currentBillTotal > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        ₹{table.currentBillTotal}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Menu Search and Categories Bar */}
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search dishes or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-500 shadow-2xs"
                />
              </div>

              {/* Veg Only Toggle */}
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  vegOnly ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Pure Veg Only
              </button>
            </div>

            {/* Category Pills */}
            <div className="bg-white px-6 py-2 border-b border-slate-200 overflow-x-auto flex gap-2 shrink-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMenu.map(dish => {
                const inCart = cart.find(i => i.id === dish.id);
                return (
                  <div
                    key={dish.id}
                    onClick={() => addToCart(dish)}
                    className="bg-white rounded-xl border border-slate-200 p-3 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex gap-3">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-16 h-16 rounded-lg object-cover border border-slate-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full border ${dish.isVeg ? 'bg-emerald-500 border-emerald-700' : 'bg-rose-500 border-rose-700'}`} />
                          <h4 className="font-bold text-xs text-slate-800 truncate">
                            {dish.marathiName ? `${dish.marathiName} / ${dish.name}` : dish.name}
                          </h4>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {dish.category}
                        </span>
                        <div className="text-sm font-black text-slate-900 font-mono mt-1">
                          ₹{dish.price}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        ⏱️ {dish.prepTime}
                      </span>
                      {inCart ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 rounded-lg px-2 py-1"
                        >
                          <button
                            onClick={() => updateCartQuantity(dish.id, -1)}
                            className="w-5 h-5 rounded bg-emerald-600 text-white font-black text-xs flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-emerald-950 font-mono">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(dish.id, 1)}
                            className="w-5 h-5 rounded bg-emerald-600 text-white font-black text-xs flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(dish);
                          }}
                          className="px-3 py-1 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Waiter Order Ticket / Cart */}
          <div className="w-full lg:w-96 bg-white flex flex-col justify-between border-l border-slate-200">
            {/* Header info */}
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Target Table
                  </span>
                  <h3 className="text-base font-black text-slate-800">
                    {selectedTable?.name} ({selectedTable?.section})
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Rounds on Bill
                  </span>
                  <div className="text-xs font-bold text-slate-700">
                    {selectedTable?.activeSession ? `Round ${(selectedTable.activeSession.rounds?.length || 0) + 1}` : 'Round 1 (New)'}
                  </div>
                </div>
              </div>

              {/* Guest name input */}
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Guest Name (optional)"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400">
                  <UtensilsCrossed className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-xs font-medium">Select dishes from the menu to add to this order</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="font-bold text-xs text-slate-800">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold font-mono text-slate-900">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        placeholder="Add special notes (e.g. less spicy)..."
                        value={item.notes}
                        onChange={(e) => updateItemNotes(item.id, e.target.value)}
                        className="flex-1 mr-2 px-2 py-1 bg-white border border-slate-200 rounded text-[11px]"
                      />

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold font-mono">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Send Button */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Subtotal for this round:</span>
                <span className="text-base font-black font-mono text-slate-900">₹{cartTotal}</span>
              </div>

              {selectedTable?.currentBillTotal > 0 && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 text-emerald-800 font-medium">
                  <span>Current Running Bill:</span>
                  <span className="font-bold font-mono">₹{selectedTable.currentBillTotal}</span>
                </div>
              )}

              <button
                disabled={cart.length === 0 || isSubmitting}
                onClick={handleSendToKitchen}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? (lang === 'mr' ? 'किचनला पाठवत आहे...' : 'Sending to Kitchen...') : `${t('sendToKitchen')} (₹${cartTotal})`}
              </button>

              {selectedTable?.activeSession && (
                <button
                  onClick={() => requestBill(selectedTable.id)}
                  className="w-full py-2 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5" /> {t('requestBill')} ({lang === 'mr' ? 'ग्राहकासाठी' : 'for Customer'})
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Kitchen Pickup Tab: Waiter delivers prepared items to tables */
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-800">
                  Dishes Ready for Waiter Takeaway ({preparedItemsForPickup.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Chef marked these dishes ready. Deliver to tables and click "Delivered / Served".
                </p>
              </div>
            </div>

            {preparedItemsForPickup.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">No pending pickups!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  All prepared dishes have been served to the tables.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {preparedItemsForPickup.map(({ tableId, tableNumber, tableName, roundNumber, item }) => (
                  <div
                    key={`${tableId}-${roundNumber}-${item.id}`}
                    className="bg-white border-2 border-emerald-500 rounded-2xl p-4 shadow-sm flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-black text-lg flex items-center justify-center">
                          T{tableNumber}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900">
                            {tableName} (Round {roundNumber})
                          </div>
                          <div className="text-xs font-bold text-emerald-800 mt-0.5">
                            {item.quantity}× {item.name}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Ready
                      </span>
                    </div>

                    {item.notes && (
                      <div className="mt-2 text-[11px] font-semibold text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        Note: {item.notes}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-mono">
                        Ready at counter
                      </span>
                      <button
                        onClick={() => {
                          updateItemStatus({
                            tableId,
                            roundNumber,
                            itemId: item.id,
                            status: 'served'
                          });
                          showNotification(`Delivered ${item.name} to Table ${tableNumber}`, 'success');
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <Check className="w-4 h-4" /> Delivered / Served
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
