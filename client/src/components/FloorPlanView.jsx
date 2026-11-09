import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  Users, 
  Clock, 
  UtensilsCrossed, 
  Receipt, 
  QrCode, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Flame,
  ChefHat,
  BellRing,
  CreditCard,
  X
} from 'lucide-react';

export const FloorPlanView = ({ onSelectTableForOrder, onSelectTableForBill, onOpenQR }) => {
  const { tables, stats, t, lang } = useRestaurant();
  const [activeFloor, setActiveFloor] = useState('Main Floor');
  const [selectedTable, setSelectedTable] = useState(null);
  const [viewMode, setViewMode] = useState('floor'); // 'floor' or 'cards'

  const currentTables = tables.filter(t => t.section === activeFloor);

  const getTableStyle = (table) => {
    switch (table.status) {
      case 'occupied':
        return {
          bg: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20',
          border: 'border-2 border-emerald-600',
          label: t('occupied')
        };
      case 'ready':
        return {
          bg: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30',
          border: 'border-2 border-emerald-600',
          badge: table.readyToServeCount || 1,
          label: t('ready')
        };
      case 'preparing':
        return {
          bg: 'bg-[#d6cbbe] text-slate-800',
          border: 'border-3 border-purple-500 shadow-sm',
          label: t('preparing')
        };
      case 'bill_requested':
        return {
          bg: 'bg-[#d6cbbe] text-slate-800',
          border: 'border-3 border-rose-400 shadow-sm',
          label: t('billRequested')
        };
      case 'available':
      default:
        return {
          bg: 'bg-[#d8cbbd] text-slate-700 hover:bg-[#cfc0b0]',
          border: 'border border-[#b8a694]',
          label: t('available')
        };
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Odoo Style Sub-header */}
      <div className="flex flex-wrap items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          {/* Main Food Court Floor */}
          <div className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 border-2 border-emerald-500 text-emerald-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>{lang === 'mr' ? 'विस्पुते फूड कोर्ट (हॉल)' : 'Vispute Food Court Hall'}</span>
          </div>

          <div className="h-5 w-px bg-slate-300 mx-1" />

          {/* View toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewMode('floor')}
              className={`px-3 py-1 rounded-md transition-all ${
                viewMode === 'floor' ? 'bg-white shadow-xs text-slate-800 font-semibold' : 'text-slate-600'
              }`}
            >
              🗺️ {t('layoutView')}
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-md transition-all ${
                viewMode === 'cards' ? 'bg-white shadow-xs text-slate-800 font-semibold' : 'text-slate-600'
              }`}
            >
              📑 {t('quickCards')}
            </button>
          </div>
        </div>

        {/* Live Legend matching reference image */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 border border-emerald-600 inline-block" />
            <span>{t('occupied')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#d6cbbe] border-2 border-purple-500 inline-block" />
            <span>{t('preparing')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 relative inline-block">
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />
            </span>
            <span>{t('ready')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#d6cbbe] border-2 border-rose-400 inline-block" />
            <span>{t('billRequested')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#d8cbbd] border border-[#b8a694] inline-block" />
            <span>{t('available')}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-4 md:p-6 flex justify-center items-start">
        {viewMode === 'floor' ? (
          /* Odoo Real Floor Blueprint View */
          <div className="relative w-[1000px] h-[720px] bg-[#baa690] rounded-xl border-8 border-[#1e293b] shadow-2xl overflow-hidden select-none">
            {/* Wooden Floor Planks Texture effect */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, #000, #000 1px, transparent 1px, transparent 60px)'
              }}
            />

            {/* KITCHEN ZONE (Top-Left matching reference photo) */}
            <div className="absolute top-0 left-0 w-[310px] h-[370px] bg-[#94a3b8] border-r-8 border-b-8 border-[#1e293b] p-4 flex flex-col justify-between">
              {/* Kitchen label */}
              <div className="flex items-center justify-between text-[#0f172a] font-bold text-xs tracking-wider uppercase bg-white/70 px-2 py-1 rounded backdrop-blur-xs">
                <div className="flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-amber-700" />
                  <span>{t('kitchenArea')}</span>
                </div>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono">
                  {stats.kitchenQueue} {t('itemsQueue')}
                </span>
              </div>

              {/* Kitchen Appliances graphic (matching reference photo) */}
              <div className="flex gap-4 items-center">
                {/* Stove with burners and freezer */}
                <div className="w-20 bg-slate-300 border-2 border-slate-500 rounded p-1 flex flex-col gap-1 shadow-inner">
                  <div className="flex items-center justify-center text-[10px] text-sky-700 font-bold bg-sky-100 py-0.5 rounded">
                    ❄️ Freeze
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-400 rounded">
                    <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-slate-900 border border-amber-500/50" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-slate-900" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-slate-900" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-slate-900" />
                    </div>
                  </div>
                </div>

                {/* Main Island Prep Counter with plates */}
                <div className="flex-1 h-36 bg-slate-600 border-2 border-slate-700 rounded-lg shadow-md p-3 flex flex-col justify-around items-center">
                  <div className="w-8 h-8 rounded-full bg-white shadow-md border-2 border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-700">
                    🍽️
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white shadow-md border-2 border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-700">
                    🍽️
                  </div>
                </div>
              </div>

              {/* Sinks at bottom of kitchen */}
              <div className="flex gap-2">
                <div className="flex-1 h-16 bg-slate-400 border border-slate-500 rounded flex items-center justify-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-slate-400 flex items-center justify-center text-[10px]">
                    🚰
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-slate-400 flex items-center justify-center text-[10px]">
                    🚰
                  </div>
                </div>
              </div>
            </div>

            {/* Kitchen Pass-through / Waiter pickup door */}
            <div className="absolute top-[370px] left-[260px] w-12 h-4 bg-amber-200 border-x-2 border-slate-700 flex items-center justify-center text-[8px] font-bold text-amber-900">
              PASS
            </div>

            {/* CASHIER / BILLING COUNTER DESK (Middle-Left matching photo) */}
            <div className="absolute top-[440px] left-[130px] flex items-center gap-3">
              <div className="w-16 h-24 bg-amber-100 border-2 border-amber-300 rounded-lg shadow-md p-1.5 flex flex-col items-center justify-between">
                <div className="w-10 h-7 bg-slate-700 rounded text-center text-white text-[8px] flex items-center justify-center font-mono">
                  💻 POS
                </div>
                <div className="text-[9px] font-bold text-amber-900 text-center leading-tight">
                  Billing Counter
                </div>
              </div>
              {/* Cashier Stool */}
              <div className="w-10 h-10 bg-amber-300 border-2 border-amber-500 rounded-md shadow-sm" />
            </div>

            {/* Entrance Doorway Graphic */}
            <div className="absolute top-[470px] left-0 w-3 h-16 bg-sky-200 border-y-2 border-r-2 border-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-700 [writing-mode:vertical-rl]">
              ENTRY
            </div>

            {/* TABLES (Rendered according to reference photo coordinates) */}
            {currentTables.map((table) => {
              const style = getTableStyle(table);
              const isRect = table.shape === 'rectangle';
              const width = isRect ? 150 : 90;
              const height = isRect ? 95 : 90;

              return (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className="absolute cursor-pointer transition-transform hover:scale-105 group"
                  style={{
                    left: `${table.x}px`,
                    top: `${table.y}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                  }}
                >
                  {/* Chairs around Table */}
                  {/* Top chairs */}
                  <div className="absolute -top-3.5 left-0 right-0 flex justify-around px-2 pointer-events-none">
                    <span className="w-5 h-3 bg-indigo-500/80 rounded-t-sm shadow-xs border border-indigo-700" />
                    {isRect && <span className="w-5 h-3 bg-indigo-500/80 rounded-t-sm shadow-xs border border-indigo-700" />}
                    <span className="w-5 h-3 bg-indigo-500/80 rounded-t-sm shadow-xs border border-indigo-700" />
                  </div>

                  {/* Bottom chairs */}
                  <div className="absolute -bottom-3.5 left-0 right-0 flex justify-around px-2 pointer-events-none">
                    <span className="w-5 h-3 bg-indigo-500/80 rounded-b-sm shadow-xs border border-indigo-700" />
                    {isRect && <span className="w-5 h-3 bg-indigo-500/80 rounded-b-sm shadow-xs border border-indigo-700" />}
                    <span className="w-5 h-3 bg-indigo-500/80 rounded-b-sm shadow-xs border border-indigo-700" />
                  </div>

                  {/* Left chair */}
                  <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-3 h-5 bg-indigo-500/80 rounded-l-sm shadow-xs border border-indigo-700 pointer-events-none" />

                  {/* Right chair */}
                  <div className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-3 h-5 bg-indigo-500/80 rounded-r-sm shadow-xs border border-indigo-700 pointer-events-none" />

                  {/* The Table Surface */}
                  <div className={`w-full h-full rounded-md ${style.bg} ${style.border} flex flex-col items-center justify-center p-1.5 relative transition-all duration-200`}>
                    {/* Notification Badge (like red 1 badge on Table 6 in photo) */}
                    {style.badge && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white pulse-badge">
                        {style.badge}
                      </span>
                    )}

                    {/* Table Number */}
                    <span className="text-base font-extrabold leading-none">
                      {table.tableNumber}
                    </span>

                    {/* Guest Name & Notes if occupied */}
                    {table.currentGuestName ? (
                      <div className="text-[10px] font-medium leading-tight text-center mt-1 truncate max-w-[90%] opacity-90">
                        {table.currentGuestName}
                      </div>
                    ) : (
                      <span className="text-[9px] opacity-60 font-medium">Free</span>
                    )}

                    {/* Current Running Bill Pill */}
                    {table.currentBillTotal > 0 && (
                      <div className="mt-1 px-1.5 py-0.5 bg-black/25 text-white rounded text-[10px] font-mono font-bold tracking-tight">
                        ₹{table.currentBillTotal}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Cards Grid View (Alternative quick POS view or Patio) */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-6xl">
            {currentTables.map((table) => {
              const style = getTableStyle(table);
              return (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer p-5 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-800">
                          {table.name}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          table.status === 'occupied' ? 'bg-emerald-100 text-emerald-800' :
                          table.status === 'ready' ? 'bg-amber-100 text-amber-800' :
                          table.status === 'preparing' ? 'bg-purple-100 text-purple-800' :
                          table.status === 'bill_requested' ? 'bg-rose-100 text-rose-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {style.label}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <Users className="w-3.5 h-3.5" /> {table.seats} Seats • {table.shape}
                      </span>
                    </div>

                    {table.currentBillTotal > 0 && (
                      <div className="text-right">
                        <span className="text-xs text-slate-400">Running Bill</span>
                        <div className="text-base font-black text-emerald-600 font-mono">
                          ₹{table.currentBillTotal}
                        </div>
                      </div>
                    )}
                  </div>

                  {table.currentGuestName && (
                    <div className="mt-3 py-1.5 px-2.5 bg-slate-50 rounded-lg text-xs flex items-center justify-between">
                      <span className="text-slate-600 font-medium truncate">
                        👤 {table.currentGuestName}
                      </span>
                      {table.activeSession?.rounds?.length > 0 && (
                        <span className="text-slate-400 font-mono text-[11px]">
                          Round {table.activeSession.rounds.length}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenQR(table);
                      }}
                      className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Table QR
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTableForOrder(table);
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold flex items-center gap-1"
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" /> Take Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Table Quick Inspector Drawer / Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                  {selectedTable.tableNumber}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {selectedTable.name} ({selectedTable.section})
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {selectedTable.seats} Seats
                    </span>
                    <span>•</span>
                    <span className="font-semibold capitalize text-slate-700">
                      Status: {selectedTable.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTable(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Active Session Info */}
              {selectedTable.activeSession ? (
                <div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                        Active Running Bill
                      </div>
                      <div className="text-2xl font-black text-emerald-950 font-mono mt-0.5">
                        ₹{selectedTable.currentBillTotal}
                      </div>
                      <div className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Seated at {new Date(selectedTable.activeSession.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectTableForBill(selectedTable);
                        setSelectedTable(null);
                      }}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                    >
                      <Receipt className="w-4 h-4" /> Go to Billing
                    </button>
                  </div>

                  {/* Multi-Round Orders Timeline */}
                  <div className="mt-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Orders Placed on this Table ({selectedTable.activeSession.rounds.length} Rounds)
                    </h4>

                    <div className="space-y-3">
                      {selectedTable.activeSession.rounds.map((round) => (
                        <div key={round.roundNumber} className="border border-slate-200 rounded-lg p-3 bg-white shadow-2xs">
                          <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-slate-100">
                            <span className="text-slate-700">
                              Round {round.roundNumber} • <span className="text-slate-400">{round.orderType}</span>
                            </span>
                            <span className="text-slate-500 font-mono">
                              {new Date(round.orderedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="mt-2 space-y-1.5">
                            {round.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${
                                    item.status === 'served' ? 'bg-slate-400' :
                                    item.status === 'prepared' ? 'bg-amber-500' :
                                    'bg-purple-500 animate-pulse'
                                  }`} />
                                  <span className="font-medium text-slate-800">
                                    {item.quantity}x {item.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                    item.status === 'served' ? 'bg-slate-100 text-slate-600' :
                                    item.status === 'prepared' ? 'bg-amber-100 text-amber-800 font-bold' :
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                    {item.status}
                                  </span>
                                  <span className="font-mono text-slate-600 font-semibold">
                                    ₹{item.price * item.quantity}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Table is currently Free</p>
                  <p className="text-xs text-slate-400 mt-1">Ready for guests or a new order</p>
                </div>
              )}
            </div>

            {/* Drawer Actions Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-2">
              <button
                onClick={() => {
                  onOpenQR(selectedTable);
                  setSelectedTable(null);
                }}
                className="flex-1 py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-4 h-4 text-slate-600" /> QR कोड (Tent Card)
              </button>

              <button
                onClick={() => {
                  onSelectTableForOrder(selectedTable);
                  setSelectedTable(null);
                }}
                className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-sm"
              >
                <UtensilsCrossed className="w-4 h-4" /> {t('takeOrder')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
