'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/admin'

  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleVerifyPin(pinToVerify: string) {
    if (!pinToVerify || loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/staff/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinToVerify }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        // Fast redirect based on role or original redirect
        const target =
          redirect !== '/admin'
            ? redirect
            : data.staff.role === 'kitchen'
            ? '/kitchen'
            : data.staff.role === 'cashier'
            ? '/billing'
            : data.staff.role === 'waiter'
            ? '/waiter'
            : '/admin'

        router.push(target)
        router.refresh()
      } else {
        setError(data.error || 'चुकीचा पिन. पुन्हा प्रयत्न करा.')
        setPin('')
      }
    } catch {
      setError('पिन पडताळणी करताना अडचण आली.')
    } finally {
      setLoading(false)
    }
  }

  function handleKeypadPress(num: string) {
    if (pin.length < 4) {
      const nextPin = pin + num
      setPin(nextPin)
      if (nextPin.length === 4) {
        handleVerifyPin(nextPin)
      }
    }
  }

  function handleBackspace() {
    setPin(prev => prev.slice(0, -1))
  }

  return (
    <div className="card-paper p-6 space-y-5 shadow-md">
      {/* 4 Pin Dots Indicator */}
      <div className="flex justify-center gap-3 py-2">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all ${
              i < pin.length
                ? 'bg-saffron border-saffron scale-110'
                : 'bg-parchment border-divider'
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="p-2.5 bg-red-100 border border-red-300 text-chilli text-xs font-devanagari font-bold rounded-xl text-center">
          ⚠️ {error}
        </div>
      )}

      {/* Numeric Keypad for Tablets & Phones */}
      <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
          <button
            key={num}
            type="button"
            onClick={() => handleKeypadPress(num)}
            disabled={loading}
            className="btn-press h-14 bg-cream hover:bg-parchment border border-divider rounded-2xl font-mukta font-bold text-2xl text-brown-900 shadow-xs flex items-center justify-center active:scale-95"
          >
            {num}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPin('')}
          className="btn-press h-14 bg-parchment border border-divider rounded-2xl font-devanagari font-bold text-xs text-brown-600 flex items-center justify-center"
        >
          साफ करा
        </button>
        <button
          type="button"
          onClick={() => handleKeypadPress('0')}
          disabled={loading}
          className="btn-press h-14 bg-cream hover:bg-parchment border border-divider rounded-2xl font-mukta font-bold text-2xl text-brown-900 shadow-xs flex items-center justify-center"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="btn-press h-14 bg-parchment border border-divider rounded-2xl font-mukta font-bold text-xl text-brown-700 flex items-center justify-center"
        >
          ⌫
        </button>
      </div>

      {/* 1-Tap Quick PIN Presets for easy staff access */}
      <div className="pt-3 border-t border-divider space-y-2">
        <p className="text-[11px] text-center text-brown-500 font-devanagari">
          किंवा थेट भूमिकेवर टॅप करा:
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs font-devanagari">
          <button
            type="button"
            onClick={() => handleVerifyPin('1234')}
            className="btn-press p-2 bg-cream hover:bg-amber-100 border border-divider rounded-xl text-center text-brown-900 font-bold"
          >
            👑 मालक (1234)
          </button>
          <button
            type="button"
            onClick={() => handleVerifyPin('2345')}
            className="btn-press p-2 bg-cream hover:bg-amber-100 border border-divider rounded-xl text-center text-brown-900 font-bold"
          >
            💰 कॅशियर (2345)
          </button>
          <button
            type="button"
            onClick={() => handleVerifyPin('3456')}
            className="btn-press p-2 bg-cream hover:bg-amber-100 border border-divider rounded-xl text-center text-brown-900 font-bold"
          >
            🛎️ वेटर (3456)
          </button>
          <button
            type="button"
            onClick={() => handleVerifyPin('4567')}
            className="btn-press p-2 bg-cream hover:bg-amber-100 border border-divider rounded-xl text-center text-brown-900 font-bold"
          >
            🍳 किचन (4567)
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-saffron text-white rounded-xl flex items-center justify-center text-2xl mx-auto mb-2 shadow-sm">
            🔒
          </div>
          <h1 className="font-devanagari text-2xl font-black text-saffron">
            हॉटेल विस्पुते
          </h1>
          <p className="text-brown-700 text-xs font-devanagari font-bold mt-0.5">
            कर्मचारी ४-अंकी PIN लॉगिन (Staff PIN Access)
          </p>
        </div>

        <Suspense fallback={<div className="card-paper p-6 text-center text-brown-500 font-devanagari">लोड होत आहे...</div>}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-brown-400 text-xs mt-6 font-mukta">
          Hotel Vispute · Secure POS
        </p>
      </div>
    </main>
  )
}
