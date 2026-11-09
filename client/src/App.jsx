import React, { useState, useEffect } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { FloorPlanView } from './components/FloorPlanView';
import { KitchenDisplay } from './pages/KitchenDisplay';
import { WaiterOrder } from './pages/WaiterOrder';
import { BillingCounter } from './pages/BillingCounter';
import { CustomerMenu } from './pages/CustomerMenu';
import { MenuManager } from './pages/MenuManager';
import { QRModal } from './components/QRModal';
import { 
  ChefHat, 
  UtensilsCrossed, 
  Receipt, 
  Smartphone, 
  LayoutGrid, 
  BookOpen, 
  BellRing, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Database,
  Wifi,
  Sparkles,
  QrCode
} from 'lucide-react';

const AppContent = () => {
  const { 
    connected, 
    stats, 
    soundEnabled, 
    setSoundEnabled, 
    activeNotification, 
    resetDemo, 
    tables,
    lang,
    toggleLang,
    t
  } = useRestaurant();

  // URL query param support (e.g. ?tab=customer&table=4)
  const queryParams = new URLSearchParams(window.location.search);
  const initialTab = queryParams.get('tab') || 'floor';
  const initialTableNum = queryParams.get('table') ? Number(queryParams.get('table')) : 1;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedTableForOrder, setSelectedTableForOrder] = useState(null);
  const [selectedTableForBill, setSelectedTableForBill] = useState(null);
  const [qrModalTable, setQrModalTable] = useState(null);

  // Sync tab with URL if needed
  useEffect(() => {
    const handlePopState = () => {
      const q = new URLSearchParams(window.location.search);
      if (q.get('tab')) setActiveTab(q.get('tab'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const switchTab = (tabName) => {
    setActiveTab(tabName);
    const newUrl = tabName === 'floor' ? '/' : `/?tab=${tabName}`;
    window.history.pushState({}, '', newUrl);
  };

  const handleOpenCustomerView = (tableNumber) => {
    window.history.pushState({}, '', `/?tab=customer&table=${tableNumber}`);
    setActiveTab('customer');
  };

  return (
    <div className="flex flex-col h-[100dvh] w-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
      {/* Toast Notification */}
      {activeNotification && (
        <div className="fixed top-3 right-3 left-3 sm:left-auto sm:right-4 z-50 animate-in slide-in-from-top duration-300 pointer-events-none">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold pointer-events-auto ${
            activeNotification.type === 'order' ? 'bg-amber-50 border-amber-300 text-amber-950' :
            activeNotification.type === 'ready' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' :
            activeNotification.type === 'bill' ? 'bg-rose-50 border-rose-300 text-rose-950' :
            'bg-slate-900 border-slate-700 text-white'
          }`}>
            <BellRing className="w-4 h-4 text-emerald-600 animate-bounce shrink-0" />
            <span className="truncate">{activeNotification.message}</span>
          </div>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="bg-white border-b border-slate-200 px-3 md:px-6 py-2 md:py-2.5 flex items-center justify-between shrink-0 shadow-2xs z-30">
        {/* Left: Vispute Logo & Subtitle */}
        <div className="flex items-center gap-2.5">
          {/* Quick Desktop Buttons */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => switchTab('floor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'floor'
                  ? 'bg-[#5c3d4e] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {t('tabFloor')}
            </button>
            <button
              onClick={() => switchTab('waiter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'waiter'
                  ? 'bg-[#5c3d4e] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {lang === 'mr' ? 'टेबल' : 'Tables'}
            </button>
            <button
              onClick={() => setQrModalTable(tables[0])}
              className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center text-sm font-bold"
              title="Print Table QR Codes"
            >
              +
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden lg:block" />

          {/* Hotel Name */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
              VF
            </div>
            <div>
              <span className="font-extrabold text-xs md:text-sm tracking-tight text-slate-900 block leading-tight">
                {t('brandName')}
              </span>
              <span className="text-[9px] md:text-[10px] text-emerald-700 font-semibold uppercase tracking-wider block">
                {t('brandSubtitle')}
              </span>
            </div>
          </div>
        </div>

        {/* Center: System Modules Switcher Tabs (Desktop Only) */}
        <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
          <button
            onClick={() => switchTab('floor')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'floor' ? 'bg-[#5c3d4e] text-white shadow-xs font-extrabold' : 'hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{t('tabFloor')}</span>
          </button>

          <button
            onClick={() => switchTab('kitchen')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 relative ${
              activeTab === 'kitchen' ? 'bg-amber-600 text-white shadow-xs font-extrabold' : 'hover:text-slate-900'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>{t('tabKitchen')}</span>
            {stats.kitchenQueue > 0 && (
              <span className="w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center pulse-badge">
                {stats.kitchenQueue}
              </span>
            )}
          </button>

          <button
            onClick={() => switchTab('waiter')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'waiter' ? 'bg-emerald-700 text-white shadow-xs font-extrabold' : 'hover:text-slate-900'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>{t('tabWaiter')}</span>
          </button>

          <button
            onClick={() => switchTab('billing')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 relative ${
              activeTab === 'billing' ? 'bg-slate-900 text-emerald-400 shadow-xs font-extrabold' : 'hover:text-slate-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>{t('tabBilling')}</span>
            {stats.billRequested > 0 && (
              <span className="w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center pulse-badge">
                {stats.billRequested}
              </span>
            )}
          </button>

          <button
            onClick={() => switchTab('customer')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'customer' ? 'bg-purple-700 text-white shadow-xs font-extrabold' : 'hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{t('tabCustomer')}</span>
          </button>

          <button
            onClick={() => switchTab('menu')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'menu' ? 'bg-teal-700 text-white shadow-xs font-extrabold' : 'hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t('tabMenu')}</span>
          </button>
        </nav>

        {/* Right: Language toggle, Audio & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Marathi / English Language Toggle */}
          <button
            onClick={toggleLang}
            className="px-2 py-1 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] sm:text-xs font-black shadow-2xs transition-all flex items-center gap-1"
            title="Toggle Language / भाषा बदला"
          >
            <span className="text-[10px]">🌐</span>
            <span>{lang === 'mr' ? 'English' : 'मराठी'}</span>
          </button>

          {/* Quick QR button for mobile */}
          <button
            onClick={() => setQrModalTable(tables[0])}
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 md:hidden text-xs"
            title="QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Socket live indicator */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="hidden sm:inline">{connected ? 'Live' : 'Offline'}</span>
          </div>

          {/* Sound alert toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border text-xs transition-all ${
              soundEnabled ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
            title={soundEnabled ? 'Audio Alert Active' : 'Audio Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset Demo button */}
          <button
            onClick={resetDemo}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all hidden sm:block"
            title="Reset to fresh demo orders"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN VIEW CONTENT (With padding for mobile bottom bar) */}
      <main className="flex-1 overflow-hidden relative pb-16 md:pb-0">
        {activeTab === 'floor' && (
          <FloorPlanView
            onSelectTableForOrder={(table) => {
              setSelectedTableForOrder(table);
              switchTab('waiter');
            }}
            onSelectTableForBill={(table) => {
              setSelectedTableForBill(table);
              switchTab('billing');
            }}
            onOpenQR={(table) => {
              setQrModalTable(table);
            }}
          />
        )}

        {activeTab === 'kitchen' && <KitchenDisplay />}

        {activeTab === 'waiter' && (
          <WaiterOrder initialSelectedTable={selectedTableForOrder} />
        )}

        {activeTab === 'billing' && (
          <BillingCounter initialSelectedTable={selectedTableForBill} />
        )}

        {activeTab === 'customer' && (
          <CustomerMenu tableNumberOverride={initialTableNum} />
        )}

        {activeTab === 'menu' && <MenuManager />}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR (Modern App Style) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1 flex items-center justify-around shadow-xl">
        <button
          onClick={() => switchTab('floor')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all relative ${
            activeTab === 'floor'
              ? 'text-purple-950 font-black scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'floor' ? 'bg-[#5c3d4e] text-white shadow-xs' : ''}`}>
            <LayoutGrid className="w-4 h-4" />
          </div>
          <span className="mt-0.5">{lang === 'mr' ? 'मजला' : 'Floor'}</span>
        </button>

        <button
          onClick={() => switchTab('kitchen')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all relative ${
            activeTab === 'kitchen'
              ? 'text-amber-900 font-black scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg relative ${activeTab === 'kitchen' ? 'bg-amber-600 text-white shadow-xs' : ''}`}>
            <ChefHat className="w-4 h-4" />
            {stats.kitchenQueue > 0 && (
              <span className="w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center absolute -top-1 -right-1 pulse-badge">
                {stats.kitchenQueue}
              </span>
            )}
          </div>
          <span className="mt-0.5">{lang === 'mr' ? 'किचन' : 'Kitchen'}</span>
        </button>

        <button
          onClick={() => switchTab('waiter')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all relative ${
            activeTab === 'waiter'
              ? 'text-emerald-900 font-black scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'waiter' ? 'bg-emerald-700 text-white shadow-xs' : ''}`}>
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <span className="mt-0.5">{lang === 'mr' ? 'वेटर' : 'Waiter'}</span>
        </button>

        <button
          onClick={() => switchTab('billing')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all relative ${
            activeTab === 'billing'
              ? 'text-slate-900 font-black scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg relative ${activeTab === 'billing' ? 'bg-slate-900 text-emerald-400 shadow-xs' : ''}`}>
            <Receipt className="w-4 h-4" />
            {stats.billRequested > 0 && (
              <span className="w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center absolute -top-1 -right-1 pulse-badge">
                {stats.billRequested}
              </span>
            )}
          </div>
          <span className="mt-0.5">{lang === 'mr' ? 'बिलिंग' : 'Billing'}</span>
        </button>

        <button
          onClick={() => switchTab('customer')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all relative ${
            activeTab === 'customer'
              ? 'text-purple-900 font-black scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'customer' ? 'bg-purple-700 text-white shadow-xs' : ''}`}>
            <Smartphone className="w-4 h-4" />
          </div>
          <span className="mt-0.5">{lang === 'mr' ? 'QR मेनू' : 'QR Menu'}</span>
        </button>

        <button
          onClick={() => switchTab('menu')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all relative ${
            activeTab === 'menu'
              ? 'text-teal-900 font-black scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'menu' ? 'bg-teal-700 text-white shadow-xs' : ''}`}>
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="mt-0.5">{lang === 'mr' ? 'मेनू' : 'Menu'}</span>
        </button>
      </nav>

      {/* QR Code Modal for Tables */}
      {qrModalTable && (
        <QRModal
          table={qrModalTable}
          onClose={() => setQrModalTable(null)}
          onOpenCustomerView={handleOpenCustomerView}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <RestaurantProvider>
      <AppContent />
    </RestaurantProvider>
  );
}
