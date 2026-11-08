'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'menu' | 'ai' | 'qr' | 'customers'>('analytics')

  // Analytics data
  const [analytics, setAnalytics] = useState<any>({
    todaySales: 0,
    activeTables: 0,
    ordersToday: 0,
    totalCustomers: 0,
    recentBills: [],
  })

  // Menu items data
  const [categories, setCategories] = useState<any[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [menuSearch, setMenuSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('all')

  // New item form
  const [newItemNameMr, setNewItemNameMr] = useState('')
  const [newItemNameEn, setNewItemNameEn] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [newItemCat, setNewItemCat] = useState('')

  // QR data
  const [qrTables, setQrTables] = useState<any[]>([])

  // Customers data
  const [customers, setCustomers] = useState<any[]>([])

  // AI Menu Import state
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiReviewItems, setAiReviewItems] = useState<any[]>([])

  const [loading, setLoading] = useState(true)

  // 1. Fetch data
  async function loadAdminData() {
    try {
      setLoading(true)
      // Analytics
      const aRes = await fetch('/api/admin/analytics')
      if (aRes.ok) setAnalytics(await aRes.json())

      // Menu
      const mRes = await fetch('/api/menu')
      if (mRes.ok) {
        const mData = await mRes.json()
        setCategories(mData.categories || [])
        setMenuItems(mData.items || [])
        if (mData.categories?.[0]?.slug) {
          setNewItemCat(mData.categories[0].slug)
        }
      }

      // QR tables
      const qRes = await fetch('/api/admin/qr')
      if (qRes.ok) {
        const qData = await qRes.json()
        setQrTables(qData.tables || [])
      }

      // Customers
      const cRes = await fetch('/api/admin/customers')
      if (cRes.ok) {
        const cData = await cRes.json()
        setCustomers(cData.customers || [])
      }
    } catch (e) {
      console.warn('Admin load error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  // Toggle availability (Sold out)
  async function toggleAvailability(itemId: string, current: boolean) {
    try {
      await fetch('/api/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, is_available: !current }),
      })
      setMenuItems(prev =>
        prev.map(i => (i.id === itemId ? { ...i, is_available: !current } : i))
      )
    } catch (e) {
      console.error(e)
    }
  }

  // Update item price
  async function updatePrice(itemId: string, newPriceStr: string) {
    const p = parseFloat(newPriceStr)
    if (isNaN(p) || p <= 0) return
    try {
      await fetch('/api/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, price: p }),
      })
      setMenuItems(prev =>
        prev.map(i => (i.id === itemId ? { ...i, price: p } : i))
      )
    } catch (e) {
      console.error(e)
    }
  }

  // Add new item
  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newItemNameMr || !newItemPrice || !newItemCat) return

    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name_mr: newItemNameMr,
          name_en: newItemNameEn || newItemNameMr,
          price: newItemPrice,
          category_slug: newItemCat,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setMenuItems(prev => [...prev, data.item])
        setNewItemNameMr('')
        setNewItemNameEn('')
        setNewItemPrice('')
        alert('आयटम जोडला गेला!')
      }
    } catch {
      alert('आयटम जोडता आला नाही.')
    }
  }

  // Delete item
  async function handleDeleteItem(itemId: string) {
    if (!confirm('हा पदार्थ मेनूमधून काढून टाकायचा आहे का?')) return
    try {
      const res = await fetch(`/api/admin/menu?id=${itemId}`, { method: 'DELETE' })
      if (res.ok) {
        setMenuItems(prev => prev.filter(i => i.id !== itemId))
      }
    } catch {
      alert('काढता आले नाही.')
    }
  }

  // AI Menu Parse
  async function handleAiParse() {
    if (!aiText.trim()) return
    setAiLoading(true)
    try {
      const fd = new FormData()
      fd.append('text', aiText)
      const res = await fetch('/api/admin/ai-menu', {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      setAiReviewItems(data.items || [])
    } catch {
      alert('AI मेनू वाचता आला नाही.')
    } finally {
      setAiLoading(false)
    }
  }

  // Save AI reviewed items
  async function handleSaveAiItems() {
    if (aiReviewItems.length === 0) return
    try {
      for (const item of aiReviewItems) {
        const catSlug = (item.category || 'special-veg')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')

        await fetch('/api/admin/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name_mr: item.name_mr || item.name_en,
            name_en: item.name_en || item.name_mr,
            price: item.price,
            category_slug: catSlug,
          }),
        })
      }
      alert('सर्व आयटम मेनूमध्ये सेव्ह झाले!')
      setAiReviewItems([])
      setAiText('')
      loadAdminData()
    } catch {
      alert('सेव्ह करताना अडचण आली.')
    }
  }

  const filteredMenuItems = menuItems.filter(i => {
    const matchesCat = selectedCat === 'all' || i.category_slug === selectedCat
    const matchesSearch =
      menuSearch.trim() === '' ||
      i.name_mr.toLowerCase().includes(menuSearch.toLowerCase()) ||
      i.name_en.toLowerCase().includes(menuSearch.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="min-h-screen bg-cream text-brown-900 pb-16 font-mukta">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur-md border-b border-divider px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚙️</span>
          <div>
            <h1 className="font-devanagari text-lg font-black text-saffron">
              हॉटेल विस्पुते · अ‍ॅडमिन पॅनेल
            </h1>
            <p className="text-[11px] text-brown-500">Restaurant Management & Analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="text-xs bg-parchment border border-divider px-2.5 py-1.5 rounded-lg text-brown-700 font-bold"
          >
            ← मुख्य पृष्ठ
          </a>
        </div>
      </header>

      {/* Tabs bar */}
      <div className="border-b border-divider bg-parchment px-4 py-1.5 flex gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { key: 'analytics', label: '📊 आढावा (Overview)' },
          { key: 'menu', label: '🍲 मेनू व्यवस्थापन' },
          { key: 'ai', label: '🤖 AI मेनू आयात' },
          { key: 'qr', label: '📱 QR कोड मॅनेजर' },
          { key: 'customers', label: '👥 ग्राहक CRM' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`btn-press whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-devanagari font-bold transition-all ${
              activeTab === t.key
                ? 'bg-saffron text-white shadow-xs'
                : 'text-brown-700 hover:text-brown-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="p-4 max-w-5xl mx-auto space-y-4">
        {/* TAB 1: Analytics / Overview */}
        {activeTab === 'analytics' && (
          <div className="space-y-4 animate-in fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="card-paper p-3.5">
                <span className="text-xs text-brown-500 font-devanagari block">आजची विक्री (Sales)</span>
                <span className="text-2xl font-black font-mukta text-chilli mt-1 block">
                  {formatPrice(analytics.todaySales)}
                </span>
              </div>
              <div className="card-paper p-3.5">
                <span className="text-xs text-brown-500 font-devanagari block">चालू टेबल्स</span>
                <span className="text-2xl font-black font-mukta text-amber-700 mt-1 block">
                  {analytics.activeTables}
                </span>
              </div>
              <div className="card-paper p-3.5">
                <span className="text-xs text-brown-500 font-devanagari block">आजच्या ऑर्डर्स</span>
                <span className="text-2xl font-black font-mukta text-brown-900 mt-1 block">
                  {analytics.ordersToday}
                </span>
              </div>
              <div className="card-paper p-3.5">
                <span className="text-xs text-brown-500 font-devanagari block">एकूण ग्राहक (CRM)</span>
                <span className="text-2xl font-black font-mukta text-emerald-700 mt-1 block">
                  {analytics.totalCustomers}
                </span>
              </div>
            </div>

            {/* Quick Staff PIN Reference */}
            <div className="card-paper p-4 bg-amber-50/60 border border-amber-300">
              <h3 className="font-devanagari font-bold text-sm text-brown-900 mb-2">
                🔑 कर्मचारी ४-अंकी PINs (Staff Fast Login):
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-devanagari">
                <div className="bg-white p-2 rounded-lg border border-divider">
                  <span className="text-brown-500 block">मालक (Admin):</span>
                  <span className="font-mono font-bold text-sm text-brown-900">1234</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-divider">
                  <span className="text-brown-500 block">कॅशियर (Cashier):</span>
                  <span className="font-mono font-bold text-sm text-brown-900">2345</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-divider">
                  <span className="text-brown-500 block">वेटर (Waiter):</span>
                  <span className="font-mono font-bold text-sm text-brown-900">3456</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-divider">
                  <span className="text-brown-500 block">किचन (Kitchen):</span>
                  <span className="font-mono font-bold text-sm text-brown-900">4567</span>
                </div>
              </div>
            </div>

            {/* Recent Completed Bills */}
            <div className="card-paper p-4">
              <h3 className="font-devanagari font-bold text-sm text-brown-900 mb-3">
                अलीकडील पूर्ण झालेली बिले (Recent Bills):
              </h3>
              {analytics.recentBills.length === 0 ? (
                <p className="text-xs text-brown-500 font-devanagari">अजून कोणतीही बिले नाहीत.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-devanagari text-left">
                    <thead>
                      <tr className="border-b border-divider text-brown-500 pb-1">
                        <th className="py-1">टेबल</th>
                        <th className="py-1">मोबाईल</th>
                        <th className="py-1">रक्कम</th>
                        <th className="py-1">पद्धत</th>
                        <th className="py-1">वेळ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-divider/40">
                      {analytics.recentBills.map((b: any) => (
                        <tr key={b.id} className="py-1.5">
                          <td className="py-1.5 font-bold font-mukta">टेबल {b.table_number}</td>
                          <td className="py-1.5 font-mono">{b.customer_mobile || '—'}</td>
                          <td className="py-1.5 font-bold font-mukta text-chilli">
                            {formatPrice(b.total)}
                          </td>
                          <td className="py-1.5 uppercase font-mono">{b.payment_mode}</td>
                          <td className="py-1.5 text-brown-500 font-mukta">
                            {new Date(b.paid_at).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Menu Management */}
        {activeTab === 'menu' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Add new item form */}
            <form onSubmit={handleAddItem} className="card-paper p-4 space-y-3">
              <h3 className="font-devanagari font-bold text-sm text-brown-900">
                + नवीन पदार्थ मेनूमध्ये जोडा:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  value={newItemNameMr}
                  onChange={e => setNewItemNameMr(e.target.value)}
                  placeholder="नाव (मराठीत) *"
                  required
                  className="px-3 py-2 bg-cream border border-divider rounded-xl text-xs font-devanagari focus:outline-none focus:border-saffron"
                />
                <input
                  type="text"
                  value={newItemNameEn}
                  onChange={e => setNewItemNameEn(e.target.value)}
                  placeholder="Name (English)"
                  className="px-3 py-2 bg-cream border border-divider rounded-xl text-xs font-mukta focus:outline-none focus:border-saffron"
                />
                <input
                  type="number"
                  value={newItemPrice}
                  onChange={e => setNewItemPrice(e.target.value)}
                  placeholder="किंमत (₹) *"
                  required
                  min={1}
                  className="px-3 py-2 bg-cream border border-divider rounded-xl text-xs font-mukta font-bold focus:outline-none focus:border-saffron"
                />
                <select
                  value={newItemCat}
                  onChange={e => setNewItemCat(e.target.value)}
                  className="px-3 py-2 bg-cream border border-divider rounded-xl text-xs font-devanagari focus:outline-none focus:border-saffron"
                >
                  {categories.map(c => (
                    <option key={c.slug} value={c.slug}>
                      {c.name_mr} ({c.name_en})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="btn-press bg-saffron hover:bg-saffron-dark text-white font-devanagari font-bold text-xs px-4 py-2 rounded-xl shadow-xs"
              >
                + मेनूमध्ये सेव्ह करा
              </button>
            </form>

            {/* Search & filter */}
            <div className="card-paper p-3.5 space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={menuSearch}
                  onChange={e => setMenuSearch(e.target.value)}
                  placeholder="मेनू पदार्थ शोधा..."
                  className="flex-1 px-3 py-2 bg-cream border border-divider rounded-xl text-xs font-devanagari focus:outline-none focus:border-saffron"
                />
                <select
                  value={selectedCat}
                  onChange={e => setSelectedCat(e.target.value)}
                  className="px-3 py-2 bg-cream border border-divider rounded-xl text-xs font-devanagari focus:outline-none focus:border-saffron"
                >
                  <option value="all">सर्व श्रेणी ({menuItems.length})</option>
                  {categories.map(c => (
                    <option key={c.slug} value={c.slug}>
                      {c.name_mr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items Table */}
              <div className="max-h-96 overflow-y-auto divide-y divide-divider/60 pt-2">
                {filteredMenuItems.map(item => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1 min-w-0">
                      <p className="font-devanagari font-bold text-sm text-brown-900 truncate">
                        {item.name_mr}
                      </p>
                      <p className="text-[11px] text-brown-500 font-mukta truncate">
                        {item.name_en} · {item.category_name || item.category_slug}
                      </p>
                    </div>

                    {/* Price edit */}
                    <div className="flex items-center gap-1">
                      <span className="font-mukta font-bold text-brown-500">₹</span>
                      <input
                        type="number"
                        defaultValue={item.price}
                        onBlur={e => updatePrice(item.id, e.target.value)}
                        className="w-16 px-1.5 py-1 bg-cream border border-divider rounded text-center font-mukta font-bold"
                      />
                    </div>

                    {/* Available / Sold out toggle */}
                    <button
                      onClick={() => toggleAvailability(item.id, item.is_available)}
                      className={`btn-press px-2.5 py-1 rounded-full font-devanagari font-bold text-[11px] border ${
                        item.is_available
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-red-100 text-red-800 border-red-300'
                      }`}
                    >
                      {item.is_available ? 'उपलब्ध ✓' : 'संपले (Sold Out)'}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-brown-400 hover:text-chilli p-1 font-bold"
                      title="हटवा"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AI Menu Import */}
        {activeTab === 'ai' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="card-paper p-4 space-y-3">
              <h3 className="font-devanagari font-bold text-base text-brown-900">
                🤖 Google Gemini AI मेनू आयात (AI Menu Importer)
              </h3>
              <p className="text-xs text-brown-600 font-devanagari">
                मेनूची यादी किंवा मजकूर खाली पेस्ट करा. AI आपोआप मराठी नाव, इंग्रजी नाव, किंमत व श्रेणी ओळखेल:
              </p>

              <textarea
                rows={5}
                value={aiText}
                onChange={e => setAiText(e.target.value)}
                placeholder={`उदा:
उडीद मसाला - 30
पनीर मोमोज - 130
टोमॅटो सूप - 120
किंवा संपूर्ण JSON पेस्ट करा`}
                className="w-full p-3 bg-cream border border-divider rounded-xl text-xs font-devanagari focus:outline-none focus:border-saffron"
              />

              <button
                onClick={handleAiParse}
                disabled={aiLoading || !aiText.trim()}
                className="btn-press bg-saffron hover:bg-saffron-dark text-white font-devanagari font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs disabled:opacity-50"
              >
                {aiLoading ? 'AI विश्लेषण चालू आहे...' : '✨ AI द्वारे तपासा (Parse Menu)'}
              </button>
            </div>

            {/* Editable Review Table */}
            {aiReviewItems.length > 0 && (
              <div className="card-paper p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-devanagari font-bold text-sm text-brown-900">
                    तपासणी तक्ता ({aiReviewItems.length} आयटम्स):
                  </h4>
                  <button
                    onClick={handleSaveAiItems}
                    className="btn-press bg-emerald-600 hover:bg-emerald-700 text-white font-devanagari font-bold text-xs px-4 py-2 rounded-xl shadow-xs"
                  >
                    💾 थेट मेनूमध्ये सेव्ह करा
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-divider/60">
                  {aiReviewItems.map((it, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between gap-2 text-xs">
                      <span className="font-devanagari font-bold text-brown-900">
                        {it.name_mr || it.name_en}
                      </span>
                      <span className="text-brown-500 font-mukta">{it.name_en}</span>
                      <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-devanagari text-[10px]">
                        {it.category || 'Special'}
                      </span>
                      <span className="font-bold font-mukta text-chilli">₹{it.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Tables & QR Manager */}
        {activeTab === 'qr' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="card-paper p-4 flex items-center justify-between">
              <div>
                <h3 className="font-devanagari font-bold text-base text-brown-900">
                  टेबल QR कोड्स (१० टेबल्स)
                </h3>
                <p className="text-xs text-brown-500 font-devanagari">
                  प्रत्येक टेबलवर ठेवण्यासाठी हाय-क्वालिटी QR कोड्स
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="btn-press bg-saffron hover:bg-saffron-dark text-white font-devanagari font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <span>🖨️</span>
                <span>सर्व QR कोड प्रिंट करा</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {qrTables.map(t => (
                <div
                  key={t.number}
                  className="card-paper p-3 text-center flex flex-col items-center justify-between bg-white border border-divider shadow-xs"
                >
                  <span className="font-devanagari font-black text-xl text-saffron mb-1">
                    टेबल {t.number}
                  </span>
                  {t.qrDataUrl && (
                    <div className="w-28 h-28 relative my-1">
                      <Image
                        src={t.qrDataUrl}
                        alt={`Table ${t.number} QR`}
                        width={112}
                        height={112}
                        className="rounded-lg border border-divider"
                      />
                    </div>
                  )}
                  <span className="text-[10px] text-brown-500 font-devanagari mt-1">
                    स्कॅन करून ऑर्डर द्या
                  </span>
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-saffron underline mt-1"
                  >
                    लिंक उघडा
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Customers & CRM */}
        {activeTab === 'customers' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="card-paper p-4 flex items-center justify-between">
              <div>
                <h3 className="font-devanagari font-bold text-base text-brown-900">
                  ग्राहक डेटाबेस व WhatsApp ऑफर यादी ({customers.length})
                </h3>
                <p className="text-xs text-brown-500 font-devanagari">
                  DPDP Act संमती असलेले मोबाईल नंबर्स
                </p>
              </div>
              <a
                href="/api/admin/customers?export=csv"
                className="btn-press bg-emerald-600 hover:bg-emerald-700 text-white font-devanagari font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <span>📥</span>
                <span>CSV डाउनलोड करा</span>
              </a>
            </div>

            <div className="card-paper overflow-hidden">
              <table className="w-full text-xs font-devanagari text-left">
                <thead className="bg-parchment border-b border-divider text-brown-600">
                  <tr>
                    <th className="p-3">मोबाईल नंबर</th>
                    <th className="p-3">नाव</th>
                    <th className="p-3">WhatsApp संमती</th>
                    <th className="p-3">एकूण भेटी</th>
                    <th className="p-3">एकूण खर्च</th>
                    <th className="p-3">शेवटची भेट</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider/40">
                  {customers.map((c: any) => (
                    <tr key={c.id} className="hover:bg-cream">
                      <td className="p-3 font-mono font-bold">{c.mobile}</td>
                      <td className="p-3">{c.name || '—'}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.offers_consent
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {c.offers_consent ? 'होय (Yes)' : 'नाही'}
                        </span>
                      </td>
                      <td className="p-3 font-mukta">{c.total_visits || 1}</td>
                      <td className="p-3 font-mukta font-bold text-chilli">
                        {formatPrice(c.total_spent || 0)}
                      </td>
                      <td className="p-3 font-mukta text-brown-500">
                        {new Date(c.last_visit).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
