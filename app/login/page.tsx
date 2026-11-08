'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/admin'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('चुकीचा ईमेल किंवा पासवर्ड. पुन्हा प्रयत्न करा.')
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-devanagari text-3xl font-bold text-saffron">
            विस्पुते हॉटेल
          </h1>
          <p className="text-brown-500 text-sm mt-1">Staff Login</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="card-paper p-6 space-y-4"
        >
          <div>
            <label className="block text-brown-700 text-sm font-semibold mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="
                w-full px-4 py-3 rounded-[12px]
                border border-divider
                bg-cream
                text-brown-900 placeholder-brown-200
                focus:outline-none focus:border-saffron
                text-base
              "
              placeholder="staff@vispute.com"
            />
          </div>

          <div>
            <label className="block text-brown-700 text-sm font-semibold mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="
                w-full px-4 py-3 rounded-[12px]
                border border-divider
                bg-cream
                text-brown-900 placeholder-brown-200
                focus:outline-none focus:border-saffron
                text-base
              "
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="font-devanagari text-chilli text-sm bg-red-50 border border-red-200 rounded-[8px] px-4 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 rounded-[12px]
              bg-chilli text-white
              font-semibold text-base
              btn-press
              disabled:opacity-50
              hover:bg-chilli-dark
              transition-colors
            "
          >
            {loading ? 'लॉगिन होत आहे...' : 'लॉगिन करा'}
          </button>
        </form>

        <p className="text-center text-brown-200 text-xs mt-6">
          Vispute Restaurant · Staff Only
        </p>
      </div>
    </main>
  )
}
