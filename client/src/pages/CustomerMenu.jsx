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
  BellRing,
  X,
  PhoneCall
} from 'lucide-react';

const CATEGORY_MAP = {
  'All': { mr: 'सर्व', icon: '🍽️' },
  'Papad': { mr: 'पापड', icon: '🫓' },
  'Momos': { mr: 'मोमोज', icon: '🥟' },
  'Soup': { mr: 'सूप', icon: '🍲' },
  'Beverages': { mr: 'ताक / चास', icon: '🥛' },
  'Indian Starter': { mr: 'स्टार्टर्स', icon: '🍟' },
  'Tandoor Starter': { mr: 'तंदूर स्टार्टर्स', icon: '🍢' },
  'Chinese Starter': { mr: 'चायनीज स्टार्टर्स', icon: '🥢' },
  'Noodles': { mr: 'नूडल्स', icon: '🍜' },
  'Chinese Rice': { mr: 'चायनीज राईस', icon: '🍚' },
  'Veg Bahar': { mr: 'व्हेज बहार', icon: '🥘' },
  'Special Veg': { mr: 'स्पेशल व्हेज', icon: '🍲' },
  'Paneer Special': { mr: 'पनीर स्पेशल', icon: '🧀' },
  'Roti': { mr: 'रोटी / नान', icon: '🫓' },
  'Biryani and Rice': { mr: 'बिर्याणी व राईस', icon: '🍛' }
};

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
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesMr = item.marathiName && item.marathiName.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        return matchesName || matchesMr || matchesCat;
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
        image: dish.image,
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
      showNotification(`ऑर्डर नोंदवली गेली! किचनमध्ये तयार करण्याचे काम सुरू झाले आहे.`, 'order');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestBill = async () => {
    try {
      await requestBill(currentTable.id);
      showNotification('बिल मागवले गेले आहे! कॅशियर व वेटरला सूचना गेली आहे.', 'bill');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-100 flex justify-center">
      {/* Mobile-First Container (Max 600px width on tablets/desktops) */}
      <div className="w-full max-w-lg bg-white min-h-full flex flex-col shadow-xl relative border-x border-slate-200">
        
        {/* TOP BRANDING BAR (Mobile Friendly Sticky Header) */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white px-4 py-3 shrink-0 shadow-md sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white text-emerald-800 font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                VF
              </div>
              <div>
                <h1 className="font-extrabold text-sm sm:text-base leading-tight tracking-wide">
                  {t('brandName')}
                </h1>
                <div className="text-[11px] text-emerald-200 font-medium">
                  {t('hotelTagline')}
                </div>
              </div>
            </div>

            {/* Table Badge Selector */}
            <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-xl backdrop-blur-xs border border-white/25">
              <span className="text-[10px] text-emerald-100 font-bold uppercase">टेबल</span>
              <select
                value={selectedTableNumber}
                onChange={(e) => setSelectedTableNumber(Number(e.target.value))}
                className="bg-transparent text-white font-black text-sm outline-hidden cursor-pointer"
              >
                {tables.map(t => (
                  <option key={t.id} value={t.tableNumber} className="text-slate-900 font-bold">
                    #{t.tableNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Active Status Notification Banner (if table has ongoing session) */}
          {activeSession && (
            <div className="mt-2.5 bg-white/10 rounded-xl px-3 py-2 flex items-center justify-between text-xs border border-white/20">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-100 font-medium">{t('runningBill')}:</span>
                <span className="font-mono font-black text-sm text-white">
                  ₹{currentTable.currentBillTotal}
                </span>
                <span className="text-[10px] text-emerald-200">
                  ({activeSession.rounds?.length || 0} {lang === 'mr' ? 'फेऱ्या' : 'rounds'})
                </span>
              </div>
              <button
                onClick={() => setActiveTab(activeTab === 'menu' ? 'status' : 'menu')}
                className="px-2.5 py-1 bg-white text-emerald-900 rounded-lg text-[11px] font-black shadow-xs active:scale-95 transition-all"
              >
                {activeTab === 'menu' ? (lang === 'mr' ? 'लाईव्ह स्थिती' : 'Track Live') : t('orderMore')}
              </button>
            </div>
          )}

          {/* Segmented Control Tabs */}
          <div className="flex mt-2.5 bg-emerald-950/40 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'menu' ? 'bg-white text-emerald-900 shadow-xs font-black' : 'text-emerald-200'
              }`}
            >
              <span>🍽️</span>
              <span>{t('foodMenu')}</span>
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 relative ${
                activeTab === 'status' ? 'bg-white text-emerald-900 shadow-xs font-black' : 'text-emerald-200'
              }`}
            >
              <span>🧾</span>
              <span>{t('tableBillStatus')}</span>
              {activeSession && (
                <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1.5 right-2 animate-ping" />
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: MENU ORDERING */}
        {activeTab === 'menu' && (
          <div className="flex-1 flex flex-col">
            {/* Search Bar & Veg Filter (Sticky under top header) */}
            <div className="p-2.5 sm:p-3 bg-slate-50 border-b border-slate-200 flex gap-2 shrink-0 sticky top-[138px] z-10 shadow-2xs">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={lang === 'mr' ? 'पदार्थ किंवा कॅटेगरी शोधा...' : t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-500 shadow-2xs"
                />
              </div>

              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0 ${
                  vegOnly ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{lang === 'mr' ? 'शाकाहारी 🟢' : 'Pure Veg'}</span>
              </button>
            </div>

            {/* Horizontal Scrollable Categories */}
            <div className="px-2.5 py-2 bg-white border-b border-slate-100 overflow-x-auto flex gap-1.5 shrink-0 no-scrollbar">
              {categories.map(cat => {
                const info = CATEGORY_MAP[cat] || { mr: cat, icon: '🍴' };
                const label = lang === 'mr' ? info.mr : cat;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300'
                    }`}
                  >
                    <span>{info.icon}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dishes Count Info */}
            <div className="px-3 py-1.5 bg-slate-50 text-[11px] text-slate-500 font-medium flex justify-between items-center border-b border-slate-100">
              <span>{filteredMenu.length} {lang === 'mr' ? 'पदार्थ उपलब्ध' : 'dishes available'}</span>
              {selectedCategory !== 'All' && (
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  {lang === 'mr' ? 'सर्व दाखवा' : 'Show All'}
                </button>
              )}
            </div>

            {/* Dish List (Mobile Optimized Swiggy/Zomato Style) */}
            <div className="p-3 space-y-3 pb-28">
              {filteredMenu.map(dish => {
                const inCart = cart.find(i => i.id === dish.id);
                return (
                  <div
                    key={dish.id}
                    className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs flex gap-3 items-center hover:border-emerald-300 transition-all relative overflow-hidden"
                  >
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0 pr-1">
                      {/* Veg Badge */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-3.5 h-3.5 rounded-xs border-2 border-emerald-600 flex items-center justify-center p-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 block" />
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                          {dish.category}
                        </span>
                      </div>

                      {/* Marathi & English Name */}
                      <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                        {dish.marathiName || dish.name}
                      </h3>
                      {dish.marathiName && (
                        <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                          {dish.name}
                        </p>
                      )}

                      {/* Price */}
                      <div className="font-black text-slate-900 font-mono text-base mt-1.5">
                        ₹{dish.price}
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {dish.description}
                      </p>
                    </div>

                    {/* Right: Image & Action Button */}
                    <div className="flex flex-col items-center shrink-0 w-24 sm:w-28">
                      <div className="w-24 h-24 sm:w-28 sm:h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs relative bg-slate-100">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Mobile Touch Stepper / ADD Button (36px high touch targets) */}
                      <div className="-mt-3.5 z-10 w-full flex justify-center">
                        {inCart ? (
                          <div className="flex items-center justify-between w-[92%] bg-emerald-700 text-white rounded-xl shadow-md px-1 py-0.5 border border-emerald-800">
                            <button
                              onClick={() => updateQuantity(dish.id, -1)}
                              className="w-7 h-7 rounded-lg bg-emerald-800 hover:bg-emerald-900 active:scale-90 font-black text-base flex items-center justify-center transition-transform"
                            >
                              -
                            </button>
                            <span className="font-black text-xs font-mono px-1">
                              {inCart.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(dish.id, 1)}
                              className="w-7 h-7 rounded-lg bg-emerald-800 hover:bg-emerald-900 active:scale-90 font-black text-base flex items-center justify-center transition-transform"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(dish)}
                            className="w-[92%] py-1.5 bg-white hover:bg-emerald-50 active:scale-95 text-emerald-800 border-2 border-emerald-600 rounded-xl font-black text-xs shadow-md flex items-center justify-center gap-1 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{lang === 'mr' ? 'जोडा' : 'ADD'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* STICKY FLOATING BOTTOM CART BAR (Swiggy / Zomato Mobile Style) */}
            {cart.length > 0 && (
              <div className="fixed bottom-16 md:bottom-3 left-3 right-3 max-w-lg mx-auto z-40 animate-in slide-in-from-bottom duration-200">
                <button
                  onClick={() => setShowCartDrawer(true)}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-2xl font-bold text-xs flex items-center justify-between shadow-2xl shadow-emerald-950/40 active:scale-[0.99] transition-all border border-emerald-500/40"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-white text-emerald-900 font-black text-xs flex items-center justify-center shadow-xs">
                      {cartItemCount}
                    </span>
                    <div className="text-left">
                      <div className="font-extrabold text-xs">
                        {lang === 'mr' ? 'ऑर्डर तपासा' : 'View Cart & Order'}
                      </div>
                      <div className="text-[10px] text-emerald-200 font-medium">
                        {cartItemCount} {lang === 'mr' ? 'पदार्थ निवडले' : 'items selected'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-sm font-black bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                    <span>₹{cartTotal}</span>
                    <span>➔</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TABLE BILL & LIVE STATUS */}
        {activeTab === 'status' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
            {activeSession ? (
              <div className="space-y-4">
                {/* Active Session Overview Card */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                        {lang === 'mr' ? `टेबल #${currentTable.tableNumber} चालू बिल` : `Table #${currentTable.tableNumber} Running Bill`}
                      </span>
                      <div className="text-3xl font-black text-emerald-950 font-mono mt-0.5">
                        ₹{currentTable.currentBillTotal}
                      </div>
                      <div className="text-xs text-emerald-800 mt-1 font-medium">
                        {lang === 'mr' ? 'ग्राहक' : 'Guest'}: <span className="font-bold">{activeSession.guestName}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                        currentTable.status === 'ready' ? 'bg-amber-500 text-white pulse-badge' :
                        currentTable.status === 'preparing' ? 'bg-purple-600 text-white' :
                        currentTable.status === 'bill_requested' ? 'bg-rose-600 text-white' :
                        'bg-emerald-600 text-white'
                      }`}>
                        {currentTable.status === 'preparing' ? (lang === 'mr' ? 'किचनमध्ये तयार होत आहे' : 'Preparing') :
                         currentTable.status === 'ready' ? (lang === 'mr' ? 'तयार आहे (Ready)' : 'Ready') :
                         currentTable.status === 'bill_requested' ? (lang === 'mr' ? 'बिल मागवले' : 'Bill Requested') :
                         (lang === 'mr' ? 'टेबल सुरू' : 'Occupied')}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1 font-mono font-bold">
                        {activeSession.rounds?.length || 0} {lang === 'mr' ? 'ऑर्डर फेऱ्या' : 'rounds'}
                      </div>
                    </div>
                  </div>

                  {/* Multi-Round note */}
                  <div className="mt-3 pt-3 border-t border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {lang === 'mr'
                        ? 'जेवताना तुम्ही पुन्हा पुन्हा ऑर्डर करू शकता; सर्व ऑर्डर्स याच बिलात जोडल्या जातील.'
                        : 'You can order repeatedly anytime during your meal; all items stay on this same bill.'}
                    </span>
                  </div>
                </div>

                {/* Multi-Round Breakdown */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                    {lang === 'mr' ? 'किचनमधून पदार्थांची थेट स्थिती' : 'Live Kitchen Status of Your Dishes'}
                  </h3>

                  {activeSession.rounds?.map((round) => (
                    <div key={round.roundNumber} className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-mono">
                            {round.roundNumber}
                          </span>
                          <span>फेरी {round.roundNumber} ({round.orderType})</span>
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {new Date(round.orderedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="mt-2.5 space-y-2">
                        {round.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${
                                item.status === 'served' ? 'bg-slate-400' :
                                item.status === 'prepared' ? 'bg-emerald-500 animate-pulse' :
                                'bg-amber-500 animate-pulse'
                              }`} />
                              <span className="font-bold text-slate-800">
                                {item.quantity}× {item.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                item.status === 'served' ? 'bg-slate-100 text-slate-600' :
                                item.status === 'prepared' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {item.status === 'served' ? (lang === 'mr' ? 'सर्व्ह केले' : 'Served') :
                                 item.status === 'prepared' ? (lang === 'mr' ? 'तयार आहे' : 'Ready') :
                                 (lang === 'mr' ? 'तयार होत आहे' : 'Preparing')}
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

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={() => setActiveTab('menu')}
                    className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('orderMore')} (फेरी {(activeSession.rounds?.length || 0) + 1})</span>
                  </button>

                  <button
                    onClick={handleRequestBill}
                    className="w-full py-3 bg-rose-50 border-2 border-rose-300 text-rose-800 hover:bg-rose-100 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-2xs active:scale-95 transition-all"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>{lang === 'mr' ? 'बिल मागवा (वेटर / काउंटरला सूचना पाठवा)' : t('callWaiterToPay')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center">
                <Utensils className="w-14 h-14 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-black text-slate-800">
                  {lang === 'mr' ? `टेबल #${currentTable.tableNumber} वर सध्या कोणतीही चालू ऑर्डर नाही` : `No Active Order on Table #${currentTable.tableNumber}`}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  {lang === 'mr' ? 'मेनूमधून आवडते पदार्थ निवडा आणि पहिली ऑर्डर नोंदवा!' : 'Browse our menu and place your first round of starters to get started!'}
                </p>
                <button
                  onClick={() => setActiveTab('menu')}
                  className="mt-4 px-6 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {lang === 'mr' ? 'मेनू उघडा' : 'Browse Menu'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* MOBILE SLIDE-UP CART BOTTOM SHEET */}
        {showCartDrawer && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-white rounded-t-3xl max-h-[85vh] flex flex-col justify-between shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden">
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                    T{currentTable.tableNumber}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                      {lang === 'mr' ? 'तुमची ऑर्डर (तपासा)' : 'Your Order Review'}
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      {lang === 'mr' ? `टेबल #${currentTable.tableNumber}` : `Table #${currentTable.tableNumber}`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCartDrawer(false)}
                  className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="font-bold text-xs text-slate-900 truncate">{item.name}</span>
                      </div>
                      <span className="font-black font-mono text-xs text-slate-900 shrink-0">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <input
                        type="text"
                        placeholder={lang === 'mr' ? 'विशेष सूचना (उदा. कमी तिखट)...' : 'Special request (e.g. less spicy)...'}
                        value={item.notes}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCart(prev => prev.map(i => i.id === item.id ? { ...i, notes: val } : i));
                        }}
                        className="flex-1 mr-2 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] focus:outline-hidden focus:border-emerald-500"
                      />

                      <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-1.5 py-0.5 shadow-2xs shrink-0">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-90 font-black text-xs flex items-center justify-center text-slate-700"
                        >
                          -
                        </button>
                        <span className="text-xs font-black font-mono px-1 min-w-[16px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-90 font-black text-xs flex items-center justify-center text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Customer Name */}
                <div className="pt-2">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {lang === 'mr' ? 'तुमचे नाव (पर्यायी):' : 'Your Name (Optional):'}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'mr' ? 'उदा. सचिन विस्पुते' : 'e.g. Rahul Patil'}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Bottom Send to Kitchen Button */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 shrink-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-bold">
                    {lang === 'mr' ? 'एकूण रक्कम:' : 'Round Total:'}
                  </span>
                  <span className="text-xl font-black font-mono text-slate-900">₹{cartTotal}</span>
                </div>

                <button
                  disabled={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/30 active:scale-95 transition-all"
                >
                  <Utensils className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? (lang === 'mr' ? 'किचनमध्ये पाठवत आहे...' : 'Sending to Kitchen...')
                      : (lang === 'mr' ? `किचनमध्ये ऑर्डर पाठवा (₹${cartTotal}) ➔` : `Confirm & Send to Kitchen (₹${cartTotal})`)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
