'use client'

import { useEffect, useState } from 'react'
import { formatPrice, isValidMobile } from '@/lib/utils'

interface BillSession {
  session_id: string
  table_number: number
  opened_at: string
  orders_count: number
  items: Array<{ name: string; name_en: string; price: number; qty: number; total: number }>
  subtotal: number
  gst: number
  grandTotal: number
}

export default function BillingPage() {
  const [sessions, setSessions] = useState<BillSession[]>([])
  const [selectedSession, setSelectedSession] = useState<BillSession | null>(null)

  // Billing form inputs
  const [customerMobile, setCustomerMobile] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [offersConsent, setOffersConsent] = useState(true) // DPDP Act WhatsApp consent
  const [discount, setDiscount] = useState<number>(0)
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'card'>('cash')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [mobileError, setMobileError] = useState<string | null>(null)
  const [completedBill, setCompletedBill] = useState<any | null>(null)

  async function fetchBillingSessions() {
    try {
      const res = await fetch('/api/billing')
      if (res.ok) {
        const data = await res.json()
        setSessions(data.openSessions || [])
        // If a session was selected, refresh its data
        if (selectedSession) {
          const updated = (data.openSessions || []).find(
            (s: BillSession) => s.session_id === selectedSession.session_id
          )
          if (updated) setSelectedSession(updated)
        }
      }
    } catch (e) {
      console.warn('Billing poll error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBillingSessions()
    const interval = setInterval(fetchBillingSessions, 4000)
    return () => clearInterval(interval)
  }, [])

  // Calculations for selected table
  const subtotal = selectedSession ? selectedSession.subtotal : 0
  const discountVal = Math.min(subtotal, Math.max(0, Number(discount) || 0))
  const taxableAmount = Math.max(0, subtotal - discountVal)
  const calculatedGst = Math.round(taxableAmount * 0.05 * 100) / 100
  const grandTotal = Math.round(taxableAmount + calculatedGst)

  // Complete bill and close table
  async function handleCloseTable() {
    if (!selectedSession || submitting) return

    // Mandatory 10-digit mobile check
    const cleanMob = customerMobile.trim().replace(/\D/g, '')
    if (!isValidMobile(cleanMob)) {
      setMobileError('कृपया वैध १०-अंकी मोबाईल नंबर टाका (उदा. 9822012345)')
      return
    }
    setMobileError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: selectedSession.session_id,
          table_number: selectedSession.table_number,
          customer_mobile: cleanMob,
          customer_name: customerName,
          offers_consent: offersConsent,
          discount: discountVal,
          payment_mode: paymentMode,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setCompletedBill(data.bill)
        // Refresh open sessions
        await fetchBillingSessions()
        setSelectedSession(null)
        setCustomerMobile('')
        setCustomerName('')
        setDiscount(0)
      } else {
        alert(data.error || 'बिल पूर्ण करता आले नाही.')
      }
    } catch {
      alert('बिल पूर्ण करता आले नाही.')
    } finally {
      setSubmitting(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="min-h-screen bg-cream text-brown-900 pb-16 font-mukta">
      {/* Header (No print) */}
      <header className="no-print sticky top-0 z-30 bg-cream/95 backdrop-blur-md border-b border-divider px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">💰</span>
          <div>
            <h1 className="font-devanagari text-lg font-black text-saffron">
              हॉटेल विस्पुते · बिलिंग काऊंटर
            </h1>
            <p className="text-[11px] text-brown-500">Cashier POS & 80mm Thermal Billing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBillingSessions}
            className="text-xs font-devanagari font-bold bg-parchment border border-divider px-3 py-1.5 rounded-lg text-brown-700"
          >
            🔄 रीफ्रेश
          </button>
          <a
            href="/"
            className="text-xs bg-parchment border border-divider px-2.5 py-1.5 rounded-lg text-brown-700 font-bold"
          >
            ← मुख्य पृष्ठ
          </a>
        </div>
      </header>

      {/* Main Billing View (No print) */}
      <main className="no-print p-4 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 mt-2">
        {/* Left Column: Open Tables Grid */}
        <div className="md:col-span-5 space-y-3">
          <h2 className="font-devanagari font-bold text-sm text-brown-700 flex justify-between items-center">
            <span>चालू टेबल्स ({sessions.length}):</span>
            <span className="text-xs text-brown-500">टेबल निवडा</span>
          </h2>

          {loading ? (
            <p className="text-sm text-brown-500 font-devanagari">लोड होत आहे...</p>
          ) : sessions.length === 0 ? (
            <div className="card-paper p-8 text-center">
              <span className="text-4xl block mb-2">🍽️</span>
              <p className="font-devanagari font-bold text-base text-brown-800">
                कोणतेही चालू टेबल नाही
              </p>
              <p className="text-xs text-brown-500 mt-1">
                ग्राहकांनी किंवा वेटरने ऑर्डर दिल्यावर इथे दिसेल.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map(sess => {
                const isSelected = selectedSession?.session_id === sess.session_id
                return (
                  <button
                    key={sess.session_id}
                    onClick={() => {
                      setSelectedSession(sess)
                      setCompletedBill(null)
                    }}
                    className={`btn-press w-full text-left card-paper p-3.5 transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-saffron bg-saffron-pale/60 shadow-md ring-1 ring-saffron'
                        : 'hover:border-saffron'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-devanagari font-black text-lg text-brown-900">
                          टेबल {sess.table_number}
                        </span>
                        <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                          {sess.orders_count} ऑर्डर्स
                        </span>
                      </div>
                      <p className="text-xs text-brown-500 font-mukta">
                        {sess.items.length} वेगवेगळे पदार्थ · सुरू:{' '}
                        {new Date(sess.opened_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mukta font-black text-lg text-chilli block">
                        {formatPrice(sess.grandTotal)}
                      </span>
                      <span className="text-[10px] text-brown-500 font-devanagari">
                        जीएसटी सह
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Table Bill Details & Actions */}
        <div className="md:col-span-7">
          {selectedSession ? (
            <div className="card-paper p-4 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-divider pb-3">
                <div>
                  <h3 className="font-devanagari font-black text-xl text-brown-900">
                    बिल तपशील · टेबल {selectedSession.table_number}
                  </h3>
                  <p className="text-xs text-brown-500 font-mukta">
                    सुरू:{' '}
                    {new Date(selectedSession.opened_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-xs text-brown-500 hover:text-brown-800"
                >
                  ✕ बंद करा
                </button>
              </div>

              {/* Itemized list */}
              <div className="max-h-56 overflow-y-auto divide-y divide-divider/60 pr-1">
                <table className="w-full text-left text-xs font-devanagari">
                  <thead>
                    <tr className="text-brown-500 border-b border-divider pb-1">
                      <th className="py-1">पदार्थ</th>
                      <th className="text-center py-1">संख्या</th>
                      <th className="text-right py-1">दर</th>
                      <th className="text-right py-1">एकूण</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-divider/40">
                    {selectedSession.items.map((it, idx) => (
                      <tr key={idx} className="py-1.5">
                        <td className="py-1.5 font-bold text-brown-900">
                          {it.name}
                          {it.name_en && (
                            <span className="block text-[10px] text-brown-500 font-mukta font-normal">
                              {it.name_en}
                            </span>
                          )}
                        </td>
                        <td className="text-center font-mukta font-bold py-1.5">
                          {it.qty}
                        </td>
                        <td className="text-right font-mukta py-1.5">
                          {formatPrice(it.price)}
                        </td>
                        <td className="text-right font-mukta font-bold py-1.5 text-brown-900">
                          {formatPrice(it.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Billing Inputs: Mobile (MANDATORY), Name, Discount, Payment mode */}
              <div className="pt-3 border-t border-divider space-y-3">
                {/* Mobile Number (MANDATORY) */}
                <div>
                  <label className="block text-xs font-devanagari font-bold text-brown-900 mb-1">
                    ग्राहकाचा मोबाईल नंबर <span className="text-chilli">* (अनिवार्य)</span>:
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-brown-500 font-bold font-mukta">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={customerMobile}
                      onChange={e => {
                        setCustomerMobile(e.target.value)
                        setMobileError(null)
                      }}
                      placeholder="9822012345"
                      className="w-full pl-11 pr-3 py-2 bg-cream border border-divider rounded-xl text-sm font-mukta font-bold focus:outline-none focus:border-saffron text-brown-900"
                    />
                  </div>
                  {mobileError && (
                    <p className="text-[11px] text-chilli font-devanagari font-bold mt-1">
                      ⚠️ {mobileError}
                    </p>
                  )}
                </div>

                {/* Name (Optional) */}
                <div>
                  <label className="block text-xs font-devanagari font-bold text-brown-700 mb-1">
                    ग्राहकाचे नाव (पर्यायी):
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="उदा. राहुल शिंदे"
                    className="w-full px-3 py-2 bg-cream border border-divider rounded-xl text-xs font-devanagari focus:outline-none focus:border-saffron text-brown-900"
                  />
                </div>

                {/* WhatsApp Offers Consent Checkbox (DPDP Act) */}
                <label className="flex items-start gap-2 text-xs font-devanagari text-brown-700 cursor-pointer bg-cream p-2 rounded-lg border border-divider">
                  <input
                    type="checkbox"
                    checked={offersConsent}
                    onChange={e => setOffersConsent(e.target.checked)}
                    className="mt-0.5 accent-saffron"
                  />
                  <span>
                    मला WhatsApp वर हॉटेल विस्पुतेच्या स्पेशल ऑफर्स पाठवा (DPDP Act संमती)
                  </span>
                </label>

                {/* Discount & Payment Mode */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-devanagari font-bold text-brown-700 mb-1">
                      सूट (Discount ₹):
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={discount || ''}
                      onChange={e => setDiscount(Number(e.target.value) || 0)}
                      placeholder="₹ 0"
                      className="w-full px-3 py-2 bg-cream border border-divider rounded-xl text-xs font-mukta font-bold focus:outline-none focus:border-saffron text-brown-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-devanagari font-bold text-brown-700 mb-1">
                      देय पद्धत:
                    </label>
                    <select
                      value={paymentMode}
                      onChange={e => setPaymentMode(e.target.value as any)}
                      className="w-full px-3 py-2 bg-cream border border-divider rounded-xl text-xs font-devanagari font-bold focus:outline-none focus:border-saffron text-brown-900"
                    >
                      <option value="cash">रोख (Cash)</option>
                      <option value="upi">यूपीआय (UPI / GPay / PhonePe)</option>
                      <option value="card">कार्ड (Card)</option>
                    </select>
                  </div>
                </div>

                {/* Subtotal & GST breakdown */}
                <div className="p-3 bg-parchment rounded-xl space-y-1 text-xs font-devanagari border border-divider">
                  <div className="flex justify-between text-brown-600">
                    <span>एकूण (Subtotal):</span>
                    <span className="font-mukta font-bold text-brown-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  {discountVal > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>सूट (Discount):</span>
                      <span className="font-mukta font-bold">-{formatPrice(discountVal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-brown-600">
                    <span>जीएसटी (GST 5%):</span>
                    <span className="font-mukta font-bold text-brown-900">
                      {formatPrice(calculatedGst)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-chilli pt-1 border-t border-divider">
                    <span>निव्वळ देय एकूण (Grand Total):</span>
                    <span className="font-mukta text-xl">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleCloseTable}
                    disabled={submitting}
                    className="btn-press flex-1 py-3 bg-chilli hover:bg-chilli-dark text-white font-devanagari font-black rounded-xl text-base shadow-md disabled:opacity-50"
                  >
                    {submitting ? 'बिल होत आहे...' : '✅ पेमेंट पूर्ण & टेबल बंद करा'}
                  </button>
                </div>
              </div>
            </div>
          ) : completedBill ? (
            /* Completed Bill view with Print Button */
            <div className="card-paper p-6 text-center space-y-4">
              <span className="text-5xl block">🧾</span>
              <h3 className="font-devanagari font-black text-xl text-emerald-800">
                बिल यशस्वीरित्या पूर्ण झाले!
              </h3>
              <p className="text-sm font-devanagari text-brown-700">
                टेबल {completedBill.table_number} चे बिल नोंदवले आणि टेबल मोकळे झाले आहे.
              </p>
              <div className="p-3 bg-cream rounded-xl border border-divider font-mukta font-bold text-lg text-brown-900">
                एकूण रक्कम: {formatPrice(completedBill.total)} ({completedBill.payment_mode.toUpperCase()})
              </div>

              <div className="flex gap-2 justify-center">
                <button
                  onClick={handlePrint}
                  className="btn-press bg-saffron hover:bg-saffron-dark text-white font-devanagari font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-1.5 shadow-md"
                >
                  <span>🖨️</span>
                  <span>८० मिमी बिल प्रिंट करा (Print Receipt)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="card-paper p-12 text-center text-brown-500">
              <span className="text-4xl block mb-2">👈</span>
              <p className="font-devanagari font-bold text-sm">
                डाव्या बाजूला असलेले चालू टेबल निवडून बिल तयार करा.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* 80mm Thermal Receipt Layout (Appears ONLY in window.print()) */}
      {(selectedSession || completedBill) && (
        <div className="print-only bill-print font-mono text-[11px] leading-tight text-black">
          <div className="text-center pb-2">
            <h2 className="text-sm font-bold uppercase">हॉटेल विस्पुते</h2>
            <p className="text-[10px]">शुद्ध शाकाहारी व स्पेशल भोजनालय</p>
            <p className="text-[9px]">मो. 9822012345 / 9819076866</p>
            <div className="bill-divider" />
            <div className="flex justify-between text-[10px]">
              <span>टेबल: {completedBill?.table_number || selectedSession?.table_number}</span>
              <span>
                दि.: {new Date().toLocaleDateString('en-IN')} {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {(completedBill?.customer_mobile || customerMobile) && (
              <div className="text-left text-[10px]">
                ग्राहक: {completedBill?.customer_name || customerName || 'ग्राहक'} (+91-{completedBill?.customer_mobile || customerMobile})
              </div>
            )}
            <div className="bill-divider" />
          </div>

          {/* Items */}
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-black">
                <th className="text-left pb-1">पदार्थ</th>
                <th className="text-center pb-1">संख्या</th>
                <th className="text-right pb-1">दर</th>
                <th className="text-right pb-1">रक्कम</th>
              </tr>
            </thead>
            <tbody>
              {(completedBill?.items || selectedSession?.items || []).map((it: any, i: number) => (
                <tr key={i}>
                  <td className="py-0.5">{it.name}</td>
                  <td className="text-center">{it.qty}</td>
                  <td className="text-right">{it.price}</td>
                  <td className="text-right font-bold">{it.total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bill-divider" />

          {/* Totals */}
          <div className="space-y-0.5 text-[10px]">
            <div className="flex justify-between">
              <span>उप-एकूण (Subtotal):</span>
              <span>₹{completedBill?.subtotal || subtotal}</span>
            </div>
            {(completedBill?.discount || discountVal) > 0 && (
              <div className="flex justify-between">
                <span>सूट (Discount):</span>
                <span>-₹{completedBill?.discount || discountVal}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>जीएसटी (GST 5%):</span>
              <span>₹{completedBill?.gst || calculatedGst}</span>
            </div>
            <div className="bill-divider" />
            <div className="flex justify-between text-xs font-bold">
              <span>एकूण देय (TOTAL):</span>
              <span>₹{completedBill?.total || grandTotal}</span>
            </div>
            <div className="flex justify-between text-[9px]">
              <span>पद्धत:</span>
              <span className="uppercase">{completedBill?.payment_mode || paymentMode}</span>
            </div>
          </div>

          <div className="bill-divider" />
          <div className="text-center pt-2 text-[9px]">
            <p>🙏 धन्यवाद! पुन्हा भेट द्या! 🙏</p>
            <p>Visit Again · Hotel Vispute</p>
          </div>
        </div>
      )}
    </div>
  )
}
