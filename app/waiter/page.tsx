'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils'

interface TableInfo {
  number: number
  hasActiveSession: boolean
}

export default function WaiterPage() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('all')

  const [waiterCart, setWaiterCart] = useState<Map<string, { item: any; qty: number }>>(new Map())
  const [readyOrders, setReadyOrders] = useState<any[]>([])
  const [pendingCalls, setPendingCalls] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      // 1. Fetch menu
      const mRes = await fetch('/api/menu')
      const mData = await mRes.json()
      setCategories(mData.categories || [])
      setMenuItems(mData.items || [])
    }
    loadData()
  }, [])

  // Poll for ready orders, active sessions, and waiter calls
  useEffect(() => {
    async function pollWaiterData() {
      try {
        // 1. Fetch ready-to-serve orders
        const ordRes = await fetch('/api/orders?waiter=true')
        if (ordRes.ok) {
          const ordData = await ordRes.json()
          setReadyOrders(ordData.orders || [])
        }

        // 2. Fetch pending customer calls
        const callRes = await fetch('/api/call-waiter')
        if (callRes.ok) {
          const callData = await callRes.json()
          setPendingCalls(callData.calls || [])
        }

        // 3. Fetch billing open sessions to know which tables are occupied
        const billRes = await fetch('/api/billing')
        if (billRes.ok) {
          const billData = await billRes.json()
          const occupiedTableNums = new Set(
            (billData.openSessions || []).map((s: any) => s.table_number)
          )

          const tbls: TableInfo[] = []
          for (let i = 1; i <= 10; i++) {
            tbls.push({
              number: i,
              hasActiveSession: occupiedTableNums.has(i),
            })
          }
          setTables(tbls)
        }
      } catch (e) {
        console.warn('Waiter poll error:', e)
      }
    }

    pollWaiterData()
    const interval = setInterval(pollWaiterData, 3000)
    return () => clearInterval(interval)
  }, [])

  // Acknowledge a call
  async function resolveCall(callId: string) {
    try {
      await fetch('/api/call-waiter', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ call_id: callId }),
      })
      setPendingCalls(prev => prev.filter(c => c.id !== callId))
    } catch (e) {
      console.error(e)
    }
  }

  // Mark order served
  async function markServed(orderId: string) {
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status: 'served' }),
      })
      setReadyOrders(prev => prev.filter(o => o.id !== orderId))
    } catch (e) {
      console.error(e)
    }
  }

  // Cart operations
  function addItem(item: any) {
    setWaiterCart(prev => {
      const next = new Map(prev)
      const current = next.get(item.id)
      if (current) {
        next.set(item.id, { ...current, qty: current.qty + 1 })
      } else {
        next.set(item.id, { item, qty: 1 })
      }
      return next
    })
  }

  function removeItem(itemId: string) {
    setWaiterCart(prev => {
      const next = new Map(prev)
      const current = next.get(itemId)
      if (!current) return prev
      if (current.qty > 1) {
        next.set(itemId, { ...current, qty: current.qty - 1 })
      } else {
        next.delete(itemId)
      }
      return next
    })
  }

  // Submit waiter order
  async function handleSendOrder() {
    if (!selectedTable || waiterCart.size === 0 || submitting) return
    setSubmitting(true)

    try {
      const orderItems = Array.from(waiterCart.values()).map(ci => ({
        item_id: ci.item.id,
        name_snapshot: ci.item.name_mr,
        name_en: ci.item.name_en,
        price_snapshot: ci.item.price,
        qty: ci.qty,
      }))

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_number: selectedTable,
          placed_by: 'waiter',
          items: orderItems,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setMessage(`टेबल ${selectedTable} ची ऑर्डर किचनला पाठवली!`)
        setWaiterCart(new Map())
        setTimeout(() => setMessage(null), 3000)
      } else {
        alert(data.error || 'ऑर्डर पाठवता आली नाही.')
      }
    } catch {
      alert('ऑर्डर पाठवता आली नाही.')
    } finally {
      setSubmitting(false)
    }
  }

  const cartTotal = Array.from(waiterCart.values()).reduce(
    (sum, ci) => sum + ci.item.price * ci.qty,
    0
  )

  const filteredItems = menuItems.filter(i => {
    const matchesCat = selectedCat === 'all' || i.category_slug === selectedCat
    const matchesSearch =
      search.trim() === '' ||
      i.name_mr.toLowerCase().includes(search.toLowerCase()) ||
      i.name_en.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="min-h-screen bg-cream text-brown-900 pb-20 select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur-md border-b border-divider px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛎️</span>
            <div>
              <h1 className="font-devanagari text-lg font-black text-saffron">
                हॉटेल विस्पुते · वेटर पॅनेल
              </h1>
              <p className="text-[11px] text-brown-500">Waiter Service & Table Manager</p>
            </div>
          </div>
          <a
            href="/"
            className="text-xs bg-parchment border border-divider px-2.5 py-1 rounded-lg text-brown-700 font-bold"
          >
            ← मुख्य पृष्ठ
          </a>
        </div>
      </header>

      {/* Message toast */}
      {message && (
        <div className="fixed top-16 left-4 right-4 z-50 bg-emerald-700 text-white p-3 rounded-xl shadow-lg font-devanagari text-center font-bold text-sm">
          ✓ {message}
        </div>
      )}

      {/* 1. Pending Waiter Calls Alert */}
      {pendingCalls.length > 0 && (
        <div className="mx-4 mt-3 space-y-2">
          {pendingCalls.map(c => (
            <div
              key={c.id}
              className="bg-amber-50 border-2 border-amber-400 p-3 rounded-xl flex items-center justify-between shadow-xs animate-pulse"
            >
              <div className="flex items-center gap-2 font-devanagari">
                <span className="text-2xl">🛎️</span>
                <div>
                  <p className="font-black text-amber-900 text-base">
                    टेबल {c.table_number} ने वेटरला बोलावले आहे!
                  </p>
                  <p className="text-xs text-amber-700 font-mukta">
                    {new Date(c.created_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => resolveCall(c.id)}
                className="btn-press bg-amber-600 hover:bg-amber-700 text-white font-devanagari font-bold text-xs px-3 py-2 rounded-lg"
              >
                समजले ✓
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 2. Ready to Serve Alert */}
      {readyOrders.length > 0 && (
        <div className="mx-4 mt-3 bg-emerald-50 border border-emerald-300 rounded-xl p-3">
          <div className="flex items-center gap-1.5 font-devanagari text-emerald-900 font-bold text-sm mb-2">
            <span>✅</span>
            <span>सर्व्ह करण्यासाठी तयार ऑर्डर्स ({readyOrders.length}):</span>
          </div>
          <div className="space-y-2">
            {readyOrders.map(ro => (
              <div
                key={ro.id}
                className="bg-white border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-devanagari font-black text-sm text-brown-900 mr-2">
                    टेबल {ro.table_number}:
                  </span>
                  <span className="font-devanagari text-brown-700">
                    {ro.items?.map((it: any) => `${it.qty} × ${it.name_snapshot}`).join(', ')}
                  </span>
                </div>
                <button
                  onClick={() => markServed(ro.id)}
                  className="btn-press bg-emerald-600 text-white font-devanagari font-bold px-2.5 py-1.5 rounded-lg shrink-0"
                >
                  सर्व्ह केले ✓
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        {/* 3. Table Selection Grid */}
        <section className="card-paper p-3.5">
          <h2 className="font-devanagari text-sm font-bold text-brown-700 mb-2.5 flex items-center justify-between">
            <span>टेबल निवडा:</span>
            <span className="text-xs font-normal text-brown-500">
              🟢 मोकळे · 🟠 चालू सेशन
            </span>
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {tables.map(tbl => {
              const isSelected = selectedTable === tbl.number
              return (
                <button
                  key={tbl.number}
                  onClick={() => setSelectedTable(tbl.number)}
                  className={`btn-press py-3 rounded-xl border flex flex-col items-center justify-center font-devanagari transition-all ${
                    isSelected
                      ? 'bg-saffron text-white border-saffron shadow-md scale-105'
                      : tbl.hasActiveSession
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-cream border-divider text-brown-900 hover:border-saffron'
                  }`}
                >
                  <span className="text-[10px] text-brown-500">{tbl.hasActiveSession ? 'चालू' : 'मोकळे'}</span>
                  <span className="font-black text-lg leading-tight font-mukta">T-{tbl.number}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* 4. Menu & Order Taking for Selected Table */}
        {selectedTable && (
          <section className="card-paper p-3.5 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-divider pb-2">
              <span className="font-devanagari font-bold text-base text-brown-900">
                टेबल {selectedTable} साठी ऑर्डर नोंदवा
              </span>
              <button
                onClick={() => {
                  setSelectedTable(null)
                  setWaiterCart(new Map())
                }}
                className="text-xs text-brown-500 hover:text-brown-800"
              >
                रद्द करा ✕
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="पदार्थ शोधा (उदा. पनीर, रोटी, सूप)..."
              className="w-full text-xs font-devanagari px-3 py-2 bg-cream border border-divider rounded-xl focus:outline-none focus:border-saffron"
            />

            {/* Category tabs */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedCat('all')}
                className={`whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-devanagari font-bold border ${
                  selectedCat === 'all'
                    ? 'bg-saffron text-white border-saffron'
                    : 'bg-cream text-brown-700 border-divider'
                }`}
              >
                सर्व
              </button>
              {categories.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCat(cat.slug)}
                  className={`whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-devanagari font-bold border ${
                    selectedCat === cat.slug
                      ? 'bg-saffron text-white border-saffron'
                      : 'bg-cream text-brown-700 border-divider'
                  }`}
                >
                  {cat.name_mr}
                </button>
              ))}
            </div>

            {/* Fast Item List */}
            <div className="max-h-60 overflow-y-auto divide-y divide-divider/60">
              {filteredItems.slice(0, 30).map(item => {
                const inCart = waiterCart.get(item.id)
                return (
                  <div key={item.id} className="py-2 flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-devanagari font-bold text-xs text-brown-900">
                        {item.name_mr}
                      </p>
                      <p className="text-[11px] text-brown-500 font-mukta">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {!inCart ? (
                      <button
                        onClick={() => addItem(item)}
                        className="btn-press bg-saffron text-white font-bold text-xs px-3 py-1.5 rounded-lg"
                      >
                        + जोडा
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-saffron text-white rounded-lg p-0.5">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-6 h-6 rounded bg-saffron-dark font-bold text-xs"
                        >
                          –
                        </button>
                        <span className="w-5 text-center font-bold text-xs font-mukta">
                          {inCart.qty}
                        </span>
                        <button
                          onClick={() => addItem(item)}
                          className="w-6 h-6 rounded bg-saffron-dark font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Waiter Cart summary & Send Button */}
            {waiterCart.size > 0 && (
              <div className="pt-3 border-t border-divider space-y-2">
                <div className="flex justify-between font-devanagari text-sm font-bold">
                  <span>निवडलेले पदार्थ ({waiterCart.size}):</span>
                  <span className="text-chilli font-mukta">{formatPrice(cartTotal)}</span>
                </div>

                <button
                  onClick={handleSendOrder}
                  disabled={submitting}
                  className="btn-press w-full py-3 bg-chilli hover:bg-chilli-dark text-white font-devanagari font-black rounded-xl text-base shadow-md disabled:opacity-50"
                >
                  {submitting ? 'पाठवत आहे...' : '🍳 किचनला ऑर्डर पाठवा'}
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
