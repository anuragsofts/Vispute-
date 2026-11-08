'use client'

import { useEffect, useState, use } from 'react'
import Image from 'next/image'
import { translations, Lang } from '@/lib/i18n/translations'
import { formatPrice } from '@/lib/utils'

interface MenuItem {
  id: string
  name_en: string
  name_mr: string
  category_slug: string
  category_name: string
  price: number
  is_veg: boolean
  is_available: boolean
  image_url: string
}

interface Category {
  id: string
  slug: string
  name_en: string
  name_mr: string
  sort_order: number
  icon: string
}

interface CartItem {
  item: MenuItem
  qty: number
  note?: string
}

export default function CustomerTablePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const resolvedParams = use(params)
  const token = resolvedParams.token

  const [lang, setLang] = useState<Lang>('mr')
  const t = translations[lang]

  const [table, setTable] = useState<{ number: number; secret_token: string } | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [cart, setCart] = useState<Map<string, CartItem>>(new Map())
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  // Live order status state
  const [placedOrders, setPlacedOrders] = useState<any[]>([])
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [callWaiterMsg, setCallWaiterMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 1. Fetch table details & menu
  useEffect(() => {
    async function init() {
      try {
        setLoading(true)
        // Verify table
        const tableRes = await fetch(`/api/table/${token}`)
        if (!tableRes.ok) {
          setError('अवैध किंवा बंद केलेला QR कोड. कृपया वेटरशी संपर्क साधा.')
          setLoading(false)
          return
        }
        const tableData = await tableRes.json()
        setTable(tableData.table)
        if (tableData.activeSessionId) {
          setActiveSessionId(tableData.activeSessionId)
        }

        // Fetch menu
        const menuRes = await fetch('/api/menu')
        const menuData = await menuRes.json()
        setCategories(menuData.categories || [])
        setItems(menuData.items || [])
      } catch (err: any) {
        setError(err.message || 'लोड करण्यात अडचण आली.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [token])

  // 2. Poll for order status if customer has active orders
  useEffect(() => {
    if (!activeSessionId) return

    async function fetchOrders() {
      try {
        const res = await fetch(`/api/orders?sessionId=${activeSessionId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.orders && data.orders.length > 0) {
            setPlacedOrders(data.orders)
          }
        }
      } catch (e) {
        console.warn('Orders poll error:', e)
      }
    }

    fetchOrders()
    const interval = setInterval(fetchOrders, 3500)
    return () => clearInterval(interval)
  }, [activeSessionId])

  // Cart operations
  function addItem(item: MenuItem) {
    if (!item.is_available) return
    setCart(prev => {
      const next = new Map(prev)
      const current = next.get(item.id)
      if (current) {
        next.set(item.id, { ...current, qty: current.qty + 1 })
      } else {
        next.set(item.id, { item, qty: 1, note: '' })
      }
      return next
    })
  }

  function removeItem(itemId: string) {
    setCart(prev => {
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

  function updateItemNote(itemId: string, note: string) {
    setCart(prev => {
      const next = new Map(prev)
      const current = next.get(itemId)
      if (current) {
        next.set(itemId, { ...current, note })
      }
      return next
    })
  }

  // Cart calculations
  const totalItemCount = Array.from(cart.values()).reduce((sum, i) => sum + i.qty, 0)
  const cartSubtotal = Array.from(cart.values()).reduce(
    (sum, i) => sum + i.item.price * i.qty,
    0
  )

  // Place order
  async function handlePlaceOrder() {
    if (isSubmitting || cart.size === 0 || !table) return
    setIsSubmitting(true)

    try {
      const orderItems = Array.from(cart.values()).map(ci => ({
        item_id: ci.item.id,
        name_snapshot: ci.item.name_mr,
        name_en: ci.item.name_en,
        price_snapshot: ci.item.price,
        qty: ci.qty,
        note: ci.note || '',
      }))

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_number: table.number,
          placed_by: 'customer',
          items: orderItems,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setActiveSessionId(data.session_id)
        setCart(new Map())
        setIsCartOpen(false)
        setShowStatusModal(true)
      } else {
        alert(data.error || t.errorOrderFailed)
      }
    } catch {
      alert(t.errorOrderFailed)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Call waiter
  async function handleCallWaiter() {
    if (!table) return
    try {
      const res = await fetch('/api/call-waiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_number: table.number }),
      })
      const data = await res.json()
      setCallWaiterMsg(data.message || 'वेटरला बोलावले आहे.')
      setTimeout(() => setCallWaiterMsg(null), 4000)
    } catch {
      setCallWaiterMsg('कृपया पुन्हा प्रयत्न करा.')
      setTimeout(() => setCallWaiterMsg(null), 3000)
    }
  }

  // Filter items
  const filteredItems = items.filter(i => {
    const matchesCategory =
      selectedCategory === 'all' || i.category_slug === selectedCategory
    const matchesSearch =
      searchQuery.trim() === '' ||
      i.name_mr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.name_en.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <main className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-saffron border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-devanagari text-lg text-brown-700">हॉटेल विस्पुते मेनू लोड होत आहे...</p>
      </main>
    )
  }

  if (error || !table) {
    return (
      <main className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <div className="text-5xl mb-4">🍽️</div>
        <h2 className="font-devanagari text-2xl font-bold text-brown-900 mb-2">हॉटेल विस्पुते</h2>
        <p className="text-brown-700 font-devanagari mb-4">{error || 'टेबल ओळखता आले नाही'}</p>
        <p className="text-sm text-brown-500">Please ask our restaurant staff for assistance.</p>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-cream pb-24 text-brown-900 select-none">
      {/* 1. Header */}
      <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur-md border-b border-divider px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-veg" />
              <h1 className="font-devanagari text-xl font-black text-saffron tracking-tight">
                {t.appName}
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-block bg-saffron-pale text-brown-900 font-bold px-2 py-0.5 rounded-sm text-xs font-devanagari border border-divider">
                {t.tableLabel} {table.number}
              </span>
              <span className="text-[11px] text-brown-500">Pure Veg & Specials</span>
            </div>
          </div>

          {/* Action buttons in header */}
          <div className="flex items-center gap-2">
            {/* Call waiter button */}
            <button
              onClick={handleCallWaiter}
              className="btn-press flex items-center gap-1 text-xs font-devanagari font-bold bg-amber-100 border border-amber-300 text-amber-900 px-2.5 py-1.5 rounded-lg"
              title={t.callWaiter}
            >
              <span>🛎️</span>
              <span className="hidden sm:inline">{t.callWaiter}</span>
            </button>

            {/* Language toggle: MR / HI / EN */}
            <div className="flex bg-parchment border border-divider rounded-lg p-0.5 text-xs font-bold">
              {(['mr', 'hi', 'en'] as Lang[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-1 rounded-md transition-all ${
                    lang === l
                      ? 'bg-saffron text-white shadow-xs'
                      : 'text-brown-700 hover:text-brown-900'
                  }`}
                >
                  {l === 'mr' ? 'मराठी' : l === 'hi' ? 'हिंदी' : 'EN'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-2.5 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'mr'
                ? 'पदार्थ शोधा (उदा. पनीर, बिर्याणी, पापड)...'
                : lang === 'hi'
                ? 'खाना खोजें (जैसे पनीर, बिरयानी)...'
                : 'Search dishes (Paneer, Biryani)...'
            }
            className="w-full pl-9 pr-3 py-2 bg-parchment border border-divider rounded-xl text-sm font-devanagari focus:outline-none focus:border-saffron text-brown-900 placeholder:text-brown-500"
          />
          <span className="absolute left-3 top-2.5 text-brown-500 text-sm">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-brown-500 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* 2. Category horizontal scroll tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-2.5 pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`btn-press whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-devanagari font-bold border transition-colors ${
              selectedCategory === 'all'
                ? 'bg-saffron text-white border-saffron shadow-xs'
                : 'bg-parchment text-brown-700 border-divider hover:border-saffron'
            }`}
          >
            🍽️ {lang === 'mr' ? 'सर्व पदार्थ' : lang === 'hi' ? 'सभी' : 'All Items'} ({items.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`btn-press whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-devanagari font-bold border transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-saffron text-white border-saffron shadow-xs'
                  : 'bg-parchment text-brown-700 border-divider hover:border-saffron'
              }`}
            >
              <span>{cat.icon || '🍛'}</span>{' '}
              {lang === 'en' ? cat.name_en : cat.name_mr}
            </button>
          ))}
        </div>
      </header>

      {/* Toast message for waiter call */}
      {callWaiterMsg && (
        <div className="fixed top-20 left-4 right-4 z-50 bg-brown-900 text-cream px-4 py-3 rounded-xl shadow-lg border border-saffron flex items-center justify-between font-devanagari text-sm animate-bounce">
          <span>🛎️ {callWaiterMsg}</span>
          <button onClick={() => setCallWaiterMsg(null)} className="text-cream/80 text-xs font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* View live order status button if customer has placed orders */}
      {placedOrders.length > 0 && (
        <div className="mx-4 mt-3">
          <button
            onClick={() => setShowStatusModal(true)}
            className="btn-press w-full bg-saffron-pale border border-amber-300 text-brown-900 px-4 py-2.5 rounded-xl font-devanagari flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-saffron animate-ping" />
              <span className="font-bold text-sm">
                {lang === 'mr' ? 'चालू ऑर्डर स्थिती पहा' : 'View Live Order Status'} ({placedOrders.length})
              </span>
            </div>
            <span className="text-saffron font-bold text-sm">तपासा ›</span>
          </button>
        </div>
      )}

      {/* 3. Menu Item Cards List */}
      <main className="px-4 py-3 space-y-3 max-w-md mx-auto">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 card-paper p-6 my-6">
            <span className="text-4xl block mb-2">🍽️</span>
            <p className="font-devanagari text-base font-bold text-brown-700">कोणतेही पदार्थ सापडले नाहीत</p>
            <p className="text-xs text-brown-500 mt-1">कृपया दुसरा शब्द शोधून पहा.</p>
          </div>
        ) : (
          filteredItems.map(item => {
            const inCart = cart.get(item.id)
            const isSoldOut = !item.is_available

            return (
              <div
                key={item.id}
                className={`card-paper p-3 flex gap-3 items-center relative transition-all ${
                  isSoldOut ? 'opacity-50 grayscale' : 'hover:border-saffron'
                }`}
              >
                {/* Food Image with Veg Indicator badge */}
                <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-cream border border-divider">
                  <Image
                    src={item.image_url}
                    alt={item.name_mr}
                    fill
                    className="object-cover"
                    sizes="96px"
                    loading="lazy"
                  />
                  {/* Pure Veg square dot */}
                  <div className="absolute top-1.5 left-1.5 bg-white/95 rounded-sm p-0.5 shadow-xs border border-green-700">
                    <div className="w-2 h-2 rounded-full bg-veg" />
                  </div>
                  {isSoldOut && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white bg-red-600 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-devanagari">
                        {t.soldOut}
                      </span>
                    </div>
                  )}
                </div>

                {/* Dish details */}
                <div className="flex-1 min-w-0 pr-1">
                  <h3 className="font-devanagari text-base font-bold text-brown-900 leading-snug line-clamp-1">
                    {lang === 'en' ? item.name_en : item.name_mr}
                  </h3>
                  <p className="text-xs text-brown-500 line-clamp-1 font-mukta">
                    {lang === 'en' ? item.name_mr : item.name_en}
                  </p>
                  <p className="font-bold text-base text-brown-900 mt-1 font-mukta">
                    {formatPrice(item.price)}
                  </p>
                </div>

                {/* Big round "+" button or Stepper */}
                <div className="shrink-0 flex items-center">
                  {!inCart ? (
                    <button
                      onClick={() => addItem(item)}
                      disabled={isSoldOut}
                      className="btn-press w-11 h-11 rounded-full bg-saffron text-white flex items-center justify-center font-bold text-2xl shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label={t.addToCart}
                    >
                      +
                    </button>
                  ) : (
                    <div className="flex items-center bg-saffron rounded-full p-1 text-white shadow-xs">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="btn-press w-8 h-8 rounded-full bg-saffron-dark text-white font-bold flex items-center justify-center text-lg leading-none"
                      >
                        –
                      </button>
                      <span className="w-6 text-center font-bold text-sm font-mukta">
                        {inCart.qty}
                      </span>
                      <button
                        onClick={() => addItem(item)}
                        className="btn-press w-8 h-8 rounded-full bg-saffron-dark text-white font-bold flex items-center justify-center text-lg leading-none"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </main>

      {/* 4. Sticky Bottom Cart Bar */}
      {totalItemCount > 0 && !isCartOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-gradient-to-t from-cream via-cream/90 to-transparent">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => setIsCartOpen(true)}
              className="btn-press w-full bg-chilli hover:bg-chilli-dark text-white px-5 py-3.5 rounded-2xl flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-3 font-devanagari text-base font-bold">
                <span className="bg-white/20 px-2.5 py-1 rounded-lg text-sm">
                  {totalItemCount} {lang === 'mr' ? 'वस्तू' : lang === 'hi' ? 'चीजें' : 'items'}
                </span>
                <span className="text-lg font-mukta">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex items-center gap-1 font-devanagari font-bold text-base">
                <span>{t.placeOrder}</span>
                <span className="text-xl">›</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 5. Cart Drawer / Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-cream rounded-t-3xl max-w-md w-full mx-auto max-h-[85vh] flex flex-col border-t border-divider shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="p-4 border-b border-divider flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛒</span>
                <h3 className="font-devanagari text-lg font-bold text-brown-900">
                  {t.yourOrder} · {t.tableLabel} {table.number}
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-parchment border border-divider text-brown-700 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Cart item list */}
            <div className="p-4 overflow-y-auto divide-y divide-divider flex-1">
              {Array.from(cart.values()).map(ci => (
                <div key={ci.item.id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-devanagari text-sm font-bold text-brown-900">
                        {lang === 'en' ? ci.item.name_en : ci.item.name_mr}
                      </h4>
                      <p className="text-xs text-brown-500 font-mukta">
                        {formatPrice(ci.item.price)} × {ci.qty} ={' '}
                        <span className="font-bold text-brown-900">
                          {formatPrice(ci.item.price * ci.qty)}
                        </span>
                      </p>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center bg-parchment border border-divider rounded-full p-0.5">
                      <button
                        onClick={() => removeItem(ci.item.id)}
                        className="btn-press w-7 h-7 rounded-full bg-cream text-brown-900 font-bold flex items-center justify-center text-sm"
                      >
                        –
                      </button>
                      <span className="w-6 text-center font-bold text-xs font-mukta">
                        {ci.qty}
                      </span>
                      <button
                        onClick={() => addItem(ci.item)}
                        className="btn-press w-7 h-7 rounded-full bg-saffron text-white font-bold flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Optional cooking note */}
                  <input
                    type="text"
                    value={ci.note || ''}
                    onChange={e => updateItemNote(ci.item.id, e.target.value)}
                    placeholder={
                      lang === 'mr'
                        ? 'टीप: उदा. कमी तिखट, जास्त चटणी...'
                        : 'Note (optional): e.g. Less spicy...'
                    }
                    className="w-full text-xs font-devanagari px-3 py-1.5 bg-parchment border border-divider rounded-lg focus:outline-none focus:border-saffron text-brown-900 placeholder:text-brown-400"
                  />
                </div>
              ))}
            </div>

            {/* Total and Place Order action */}
            <div className="p-4 bg-parchment border-t border-divider space-y-3">
              <div className="flex items-center justify-between text-base font-bold font-devanagari">
                <span>{t.total}:</span>
                <span className="text-xl font-mukta text-chilli">{formatPrice(cartSubtotal)}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="btn-press flex-1 py-3 rounded-xl border border-divider bg-cream font-devanagari text-sm font-bold text-brown-700"
                >
                  {t.addMoreItems}
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="btn-press flex-2 py-3 rounded-xl bg-chilli hover:bg-chilli-dark text-white font-devanagari text-base font-bold shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>{t.loading}</span>
                  ) : (
                    <>
                      <span>{t.placeOrder}</span>
                      <span>✓</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Live Order Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-cream rounded-t-3xl max-w-md w-full mx-auto max-h-[85vh] flex flex-col border-t border-divider shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="p-4 border-b border-divider flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">⏱️</span>
                <h3 className="font-devanagari text-lg font-bold text-brown-900">
                  {t.orderStatus} · {t.tableLabel} {table.number}
                </h3>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="w-8 h-8 rounded-full bg-parchment border border-divider text-brown-700 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {placedOrders.length === 0 ? (
                <p className="text-center text-brown-500 font-devanagari py-8">अजून कोणतीही ऑर्डर दिली नाही.</p>
              ) : (
                placedOrders.map((ord, idx) => {
                  const statusColors: any = {
                    new: 'bg-amber-100 text-amber-900 border-amber-300',
                    preparing: 'bg-orange-100 text-orange-900 border-orange-300',
                    ready: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                    served: 'bg-gray-100 text-gray-700 border-gray-300',
                  }

                  const statusLabels: any = {
                    new: t.statusNew,
                    preparing: t.statusPreparing,
                    ready: t.statusReady,
                    served: t.statusServed,
                  }

                  return (
                    <div key={ord.id} className="card-paper p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-devanagari text-xs font-bold text-brown-500">
                          ऑर्डर #{idx + 1} · {new Date(ord.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span
                          className={`font-devanagari text-xs font-bold px-2.5 py-1 rounded-full border ${
                            statusColors[ord.status] || 'bg-gray-100'
                          }`}
                        >
                          {statusLabels[ord.status] || ord.status}
                        </span>
                      </div>

                      <div className="divide-y divide-divider/60 pt-1">
                        {ord.items?.map((it: any, i: number) => (
                          <div key={i} className="py-1 flex justify-between text-xs font-devanagari">
                            <span className="font-medium text-brown-900">
                              {it.qty} × {it.name_snapshot} {it.note && <span className="text-brown-500">({it.note})</span>}
                            </span>
                            <span className="font-mukta font-bold text-brown-700">
                              {formatPrice(it.price_snapshot * it.qty)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-divider flex justify-between font-bold text-sm">
                        <span className="font-devanagari text-xs text-brown-600">{t.total}:</span>
                        <span className="font-mukta text-chilli">{formatPrice(ord.total)}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="p-4 bg-parchment border-t border-divider space-y-2">
              <button
                onClick={() => {
                  setShowStatusModal(false)
                }}
                className="btn-press w-full py-3 rounded-xl bg-saffron text-white font-devanagari text-sm font-bold shadow-xs"
              >
                + {t.addMoreItems}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
