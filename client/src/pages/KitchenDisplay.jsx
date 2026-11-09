import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  ChefHat, 
  Clock, 
  Flame, 
  CheckCircle2, 
  Utensils, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  RefreshCw,
  BellRing,
  ArrowRight
} from 'lucide-react';

export const KitchenDisplay = () => {
  const { tables, updateItemStatus, updateRoundStatus, soundEnabled, setSoundEnabled, t, lang } = useRestaurant();
  const [filter, setFilter] = useState('active'); // 'active', 'preparing', 'ready', 'all'

  // Extract all active rounds from all tables
  const activeTickets = [];

  tables.forEach(table => {
    if (table.activeSession && table.activeSession.rounds) {
      table.activeSession.rounds.forEach(round => {
        const hasUnserved = round.items.some(i => i.status !== 'served');
        const hasPreparing = round.items.some(i => i.status === 'preparing' || i.status === 'received');
        const hasPrepared = round.items.some(i => i.status === 'prepared');

        let statusCategory = 'served';
        if (hasPrepared) statusCategory = 'ready';
        if (hasPreparing) statusCategory = 'preparing';

        activeTickets.push({
          tableId: table.id,
          tableNumber: table.tableNumber,
          tableName: table.name,
          section: table.section,
          guestName: table.currentGuestName,
          roundNumber: round.roundNumber,
          orderedAt: round.orderedAt,
          orderType: round.orderType,
          notes: round.notes,
          items: round.items,
          statusCategory,
          hasUnserved
        });
      });
    }
  });

  // Sort: newest or unserved first
  activeTickets.sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt));

  const filteredTickets = activeTickets.filter(ticket => {
    if (filter === 'active') return ticket.hasUnserved;
    if (filter === 'preparing') return ticket.items.some(i => i.status === 'received' || i.status === 'preparing');
    if (filter === 'ready') return ticket.items.some(i => i.status === 'prepared');
    return true;
  });

  const getElapsedTime = (isoString) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins === 1) return '1 min ago';
    return `${mins} mins ago`;
  };

  return (
    <div className="flex flex-col h-full bg-[#f1f5f9]">
      {/* KDS Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
              Kitchen Display System (KDS)
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Live Kitchen Tab
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Orders update live in real-time. Direct chef controls: Preparing ➔ Prepared ➔ Take Away.
            </p>
          </div>
        </div>

        {/* Filter Controls & Audio Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'active' ? 'bg-white shadow-xs text-slate-800 font-black' : 'hover:text-slate-800'
              }`}
            >
              Active Queue ({activeTickets.filter(t => t.hasUnserved).length})
            </button>
            <button
              onClick={() => setFilter('preparing')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'preparing' ? 'bg-purple-600 text-white shadow-xs font-black' : 'hover:text-slate-800'
              }`}
            >
              Cooking ({activeTickets.filter(t => t.items.some(i => i.status === 'preparing' || i.status === 'received')).length})
            </button>
            <button
              onClick={() => setFilter('ready')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'ready' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'hover:text-slate-800'
              }`}
            >
              Ready for Pickup ({activeTickets.filter(t => t.items.some(i => i.status === 'prepared')).length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'all' ? 'bg-white shadow-xs text-slate-800 font-black' : 'hover:text-slate-800'
              }`}
            >
              All Tickets
            </button>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-all ${
              soundEnabled 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                : 'bg-slate-100 border-slate-300 text-slate-400'
            }`}
            title={soundEnabled ? 'Order Sound Alert: ON' : 'Order Sound Alert: MUTED'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredTickets.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Kitchen Queue is Clear!</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">
              All dishes have been prepared and delivered to tables. New incoming orders will appear here automatically with a sound chime.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTickets.map((ticket, idx) => {
              const allPrepared = ticket.items.every(i => i.status === 'prepared' || i.status === 'served');
              const allServed = ticket.items.every(i => i.status === 'served');
              const hasPreparing = ticket.items.some(i => i.status === 'preparing');
              const isNew = ticket.items.some(i => i.status === 'received');

              return (
                <div
                  key={`${ticket.tableId}-${ticket.roundNumber}-${idx}`}
                  className={`bg-white rounded-2xl border-2 flex flex-col justify-between shadow-xs transition-all overflow-hidden ${
                    allServed ? 'border-slate-200 opacity-60' :
                    allPrepared ? 'border-emerald-500 shadow-emerald-500/10' :
                    hasPreparing ? 'border-purple-400 shadow-purple-500/10' :
                    'border-amber-400 shadow-amber-500/10'
                  }`}
                >
                  {/* Ticket Header */}
                  <div className={`p-4 border-b flex items-center justify-between ${
                    allServed ? 'bg-slate-100 border-slate-200' :
                    allPrepared ? 'bg-emerald-50 border-emerald-200' :
                    hasPreparing ? 'bg-purple-50 border-purple-200' :
                    'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-black text-lg flex items-center justify-center shadow-xs">
                        T{ticket.tableNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 text-sm">
                            {ticket.tableName}
                          </span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                            Round {ticket.roundNumber}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          {ticket.guestName || 'Guest'} • {ticket.orderType}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-slate-700 flex items-center justify-end gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {getElapsedTime(ticket.orderedAt)}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        allServed ? 'bg-slate-200 text-slate-700' :
                        allPrepared ? 'bg-emerald-600 text-white' :
                        hasPreparing ? 'bg-purple-600 text-white' :
                        'bg-amber-500 text-white'
                      }`}>
                        {allServed ? 'Delivered' : allPrepared ? 'Ready Pickup' : hasPreparing ? 'Cooking' : 'New Order'}
                      </span>
                    </div>
                  </div>

                  {/* Ticket Items List */}
                  <div className="p-4 flex-1 space-y-3 divide-y divide-slate-100">
                    {ticket.items.map((item) => (
                      <div key={item.id} className="pt-2 first:pt-0 flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-slate-100 font-black text-xs text-slate-800 flex items-center justify-center border border-slate-200">
                              {item.quantity}×
                            </span>
                            <span className={`font-bold text-sm ${item.isVeg ? 'text-emerald-800' : 'text-rose-800'}`}>
                              {item.name}
                            </span>
                            <span className={`w-2.5 h-2.5 rounded-full border ${item.isVeg ? 'bg-emerald-500 border-emerald-700' : 'bg-rose-500 border-rose-700'}`} />
                          </div>

                          {item.notes && (
                            <div className="mt-1 text-[11px] font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md inline-block">
                              Chef Note: "{item.notes}"
                            </div>
                          )}
                        </div>

                        {/* Individual Item Status Toggle */}
                        <div className="flex flex-col items-end gap-1">
                          <select
                            value={item.status}
                            onChange={(e) => {
                              updateItemStatus({
                                tableId: ticket.tableId,
                                roundNumber: ticket.roundNumber,
                                itemId: item.id,
                                status: e.target.value
                              });
                            }}
                            className={`text-xs font-bold px-2 py-1 rounded-lg border outline-hidden transition-all cursor-pointer ${
                              item.status === 'served' ? 'bg-slate-100 border-slate-300 text-slate-600' :
                              item.status === 'prepared' ? 'bg-emerald-100 border-emerald-300 text-emerald-800' :
                              item.status === 'preparing' ? 'bg-purple-100 border-purple-300 text-purple-800' :
                              'bg-amber-100 border-amber-300 text-amber-800'
                            }`}
                          >
                            <option value="received">Received</option>
                            <option value="preparing">🍳 Preparing</option>
                            <option value="prepared">🍲 Prepared</option>
                            <option value="served">✅ Served</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Ticket Fast-Action Footer */}
                  <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
                    {/* If new or preparing: One click "Start Preparing" */}
                    {isNew && (
                      <button
                        onClick={() => {
                          updateRoundStatus({
                            tableId: ticket.tableId,
                            roundNumber: ticket.roundNumber,
                            status: 'preparing'
                          });
                        }}
                        className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Flame className="w-4 h-4" /> {t('startPreparing')}
                      </button>
                    )}

                    {/* If cooking: One click "Mark Prepared (Food Ready)" */}
                    {(hasPreparing || isNew) && (
                      <button
                        onClick={() => {
                          updateRoundStatus({
                            tableId: ticket.tableId,
                            roundNumber: ticket.roundNumber,
                            status: 'prepared'
                          });
                        }}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <ChefHat className="w-4 h-4" /> {t('markPrepared')}
                      </button>
                    )}

                    {/* If prepared: Waiter takeaway / Served */}
                    {allPrepared && !allServed && (
                      <button
                        onClick={() => {
                          updateRoundStatus({
                            tableId: ticket.tableId,
                            roundNumber: ticket.roundNumber,
                            status: 'served'
                          });
                        }}
                        className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Utensils className="w-4 h-4 text-emerald-400" /> {t('waiterTakeaway')}
                      </button>
                    )}

                    {allServed && (
                      <div className="w-full text-center py-1 text-xs font-bold text-slate-500">
                        ✓ {t('servedToTable')} #{ticket.tableNumber}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
