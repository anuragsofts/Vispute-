'use client'

import { useEffect, useState, useRef } from 'react'
import { playNewOrderChime, playAddonOrderChime, unlockAudio } from '@/lib/sound'
import { minutesSince } from '@/lib/utils'

interface OrderItem {
  name_snapshot: string
  name_en?: string
  price_snapshot: number
  qty: number
  note?: string
}

interface KitchenOrder {
  id: string
  session_id: string
  table_number: number
  placed_by: 'customer' | 'waiter'
  status: 'new' | 'preparing' | 'ready' | 'served'
  is_addon: boolean
  items: OrderItem[]
  total: number
  created_at: string
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [kitchenModeActive, setKitchenModeActive] = useState(false)
  const [wakeLockActive, setWakeLockActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Track seen order IDs to detect new orders & trigger sound rings
  const seenOrderIds = useRef<Set<string>>(new Set())
  const isFirstLoad = useRef(true)

  async function fetchKitchenOrders() {
    try {
      const res = await fetch('/api/orders?kitchen=true')
      if (res.ok) {
        const data = await res.json()
        const fetchedOrders: KitchenOrder[] = data.orders || []

        // Ring sound check
        if (!isFirstLoad.current && kitchenModeActive) {
          for (const ord of fetchedOrders) {
            if (!seenOrderIds.current.has(ord.id)) {
              if (ord.is_addon) {
                playAddonOrderChime()
              } else {
                playNewOrderChime()
              }
              break
            }
          }
        }

        // Update seen order IDs
        fetchedOrders.forEach(o => seenOrderIds.current.add(o.id))
        isFirstLoad.current = false
        setOrders(fetchedOrders)
      }
    } catch (e) {
      console.warn('Failed to poll kitchen orders:', e)
    } finally {
      setLoading(false)
    }
  }

  // Poll orders every 3 seconds
  useEffect(() => {
    fetchKitchenOrders()
    const interval = setInterval(fetchKitchenOrders, 3000)
    return () => clearInterval(interval)
  }, [kitchenModeActive])

  // Enable Kitchen Mode (Unlock Audio + Request Wake Lock)
  async function handleStartKitchenMode() {
    await unlockAudio()
    setKitchenModeActive(true)

    // Wake Lock API
    if ('wakeLock' in navigator) {
      try {
        await (navigator as any).wakeLock.request('screen')
        setWakeLockActive(true)
      } catch (err) {
        console.warn('Wake Lock error:', err)
      }
    }
  }

  // Update order status
  async function updateStatus(orderId: string, nextStatus: 'preparing' | 'ready' | 'served') {
    setUpdatingId(orderId)
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status: nextStatus }),
      })
      if (res.ok) {
        // Optimistic update
        setOrders(prev =>
          nextStatus === 'served'
            ? prev.filter(o => o.id !== orderId)
            : prev.map(o => (o.id === orderId ? { ...o, status: nextStatus } : o))
        )
      }
    } catch (e) {
      console.error('Status update failed:', e)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#111827] text-gray-100 p-4 font-mukta">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="font-devanagari text-2xl font-black text-amber-400 tracking-wide">
            हॉटेल विस्पुते · किचन डिस्प्ले (KDS)
          </h1>
          <span className="text-xs bg-gray-800 border border-gray-700 px-2 py-1 rounded text-gray-300">
            {orders.length} चालू ऑर्डर्स
          </span>
        </div>

        {/* Start Kitchen Mode Button */}
        {!kitchenModeActive ? (
          <button
            onClick={handleStartKitchenMode}
            className="btn-press bg-amber-500 hover:bg-amber-600 text-gray-950 font-devanagari font-black px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg"
          >
            <span>🔔</span>
            <span>किचन मोड सुरू करा (आवाज + स्क्रीन वेक)</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 px-3 py-1.5 rounded-lg">
            <span>🔊 ऑडिओ चालू</span>
            {wakeLockActive && <span>• 💡 स्क्रीन नेहमी चालू</span>}
          </div>
        )}
      </header>

      {/* Orders Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-devanagari text-gray-400">ऑर्डर्स तपासत आहे...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-24 text-center card-paper bg-gray-900 border-gray-800 p-8 max-w-md mx-auto my-12">
          <span className="text-5xl block mb-3">👨‍🍳</span>
          <h2 className="font-devanagari text-xl font-bold text-gray-200">सध्या कोणतीही प्रलंबित ऑर्डर नाही</h2>
          <p className="font-devanagari text-xs text-gray-400 mt-1">नवीन ऑर्डर येताच इथे दिसेल आणि रिंग वाजेल.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
          {orders.map(order => {
            const minutes = minutesSince(order.created_at)
            const isLate = minutes >= 15
            const isMedium = minutes >= 8 && minutes < 15

            return (
              <div
                key={order.id}
                className={`bg-[#1F2937] rounded-2xl border flex flex-col justify-between overflow-hidden shadow-xl transition-all ${
                  order.status === 'new'
                    ? 'border-amber-500/80 ring-1 ring-amber-500/40'
                    : order.status === 'preparing'
                    ? 'border-blue-500/60'
                    : 'border-emerald-500/60'
                }`}
              >
                {/* Card Header with Huge Table Number */}
                <div
                  className={`p-3.5 flex items-center justify-between ${
                    order.status === 'new'
                      ? 'bg-amber-500/15 text-amber-300 border-b border-amber-500/30'
                      : order.status === 'preparing'
                      ? 'bg-blue-500/15 text-blue-300 border-b border-blue-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-b border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-devanagari font-black text-2xl text-white">
                      टेबल {order.table_number}
                    </span>
                    {order.is_addon && (
                      <span className="bg-red-950 border border-red-500 text-red-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase font-devanagari">
                        + जास्तीचे पदार्थ
                      </span>
                    )}
                  </div>

                  {/* Timer */}
                  <div
                    className={`font-mukta font-bold text-xs px-2 py-1 rounded flex items-center gap-1 ${
                      isLate
                        ? 'bg-red-600 text-white animate-pulse'
                        : isMedium
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    <span>⏱️</span>
                    <span>{minutes} मि. आधी</span>
                  </div>
                </div>

                {/* Card Body: Items list */}
                <div className="p-4 space-y-2 flex-1">
                  <div className="text-[11px] text-gray-400 font-devanagari flex justify-between border-b border-gray-800 pb-1.5">
                    <span>
                      {order.placed_by === 'waiter' ? 'वेटरने नोंदवली' : 'ग्राहकाने मागवली'}
                    </span>
                    <span>
                      {new Date(order.created_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="divide-y divide-gray-800/80 pt-1">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-devanagari font-bold text-base text-gray-100 leading-snug">
                            {item.name_snapshot}
                          </p>
                          {item.name_en && (
                            <p className="text-xs text-gray-400 font-mukta">{item.name_en}</p>
                          )}
                          {item.note && (
                            <p className="text-xs text-amber-400 font-devanagari mt-0.5 bg-amber-950/40 border border-amber-900/60 rounded px-1.5 py-0.5">
                              ⚠️ टीप: {item.note}
                            </p>
                          )}
                        </div>
                        {/* Huge quantity badge */}
                        <span className="bg-gray-800 border border-gray-700 text-amber-400 font-black text-xl px-2.5 py-1 rounded-xl shrink-0 font-mukta">
                          × {item.qty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-3 bg-gray-900/90 border-t border-gray-800">
                  {order.status === 'new' && (
                    <button
                      onClick={() => updateStatus(order.id, 'preparing')}
                      disabled={updatingId === order.id}
                      className="btn-press w-full py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-devanagari font-black rounded-xl text-base shadow-md disabled:opacity-50"
                    >
                      {updatingId === order.id ? 'नोंद होत आहे...' : '🍳 तयार करणे सुरू करा'}
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateStatus(order.id, 'ready')}
                      disabled={updatingId === order.id}
                      className="btn-press w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-devanagari font-black rounded-xl text-base shadow-md disabled:opacity-50"
                    >
                      {updatingId === order.id ? 'नोंद होत आहे...' : '✅ तयार आहे (Ready)'}
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <div className="flex gap-2">
                      <div className="flex-1 py-2.5 bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 font-devanagari font-bold rounded-xl text-xs flex items-center justify-center gap-1">
                        <span>🔔 वेटरला कळवले आहे</span>
                      </div>
                      <button
                        onClick={() => updateStatus(order.id, 'served')}
                        disabled={updatingId === order.id}
                        className="btn-press px-3 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-devanagari font-bold rounded-xl text-xs"
                      >
                        सर्व्ह केले ✓
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
