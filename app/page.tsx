import Link from 'next/link'
import { getDb } from '@/lib/mongodb/client'

export default async function HomePage() {
  let tables: any[] = []
  try {
    const db = await getDb()
    tables = await db.collection('tables').find({ is_active: true }).sort({ number: 1 }).toArray()
  } catch (e) {
    console.warn('DB fetch error on home page:', e)
  }

  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center p-4 selection:bg-saffron selection:text-white">
      {/* Restaurant Wordmark & Logo */}
      <div className="text-center mb-8 max-w-sm">
        <div className="w-16 h-16 bg-saffron text-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-md border-2 border-amber-300">
          🍲
        </div>
        <h1 className="font-devanagari text-4xl font-black text-saffron leading-tight">
          हॉटेल विस्पुते
        </h1>
        <p className="text-brown-700 text-xs mt-1 font-devanagari font-bold">
          शुद्ध शाकाहारी व स्पेशल भोजनालय · QR टेबल ऑर्डरिंग
        </p>
        <p className="text-[11px] text-brown-500 tracking-wider uppercase mt-0.5">
          Hotel Vispute · Full Restaurant System
        </p>
      </div>

      {/* Staff & Operational Role Links */}
      <div className="w-full max-w-md space-y-2.5">
        <RoleLink
          href="/kitchen"
          icon="🍳"
          label="किचन स्क्रीन (KDS)"
          sub="Live order tickets, sound rings & timers"
          badge="Live KDS"
        />
        <RoleLink
          href="/waiter"
          icon="🛎️"
          label="वेटर पॅनेल (Waiter)"
          sub="Table order taking, service alerts & call bells"
          badge="Waiter"
        />
        <RoleLink
          href="/billing"
          icon="💰"
          label="बिलिंग काऊंटर (Cashier)"
          sub="Consolidated bill, 5% GST & 80mm thermal receipt"
          badge="POS"
        />
        <RoleLink
          href="/admin"
          icon="⚙️"
          label="अ‍ॅडमिन पॅनेल (Owner)"
          sub="Menu CRUD, live prices, AI menu import & CRM"
          badge="Admin"
        />
      </div>

      {/* Direct Customer Table Links for Quick Testing */}
      <div className="w-full max-w-md mt-6 card-paper p-4">
        <h3 className="font-devanagari font-bold text-xs text-brown-700 mb-2.5 flex items-center justify-between">
          <span>📱 ग्राहक QR स्कॅन टेस्ट (Customer Demo Links):</span>
          <span className="text-[10px] text-brown-500 font-normal">१० टेबल्स</span>
        </h3>
        <div className="grid grid-cols-5 gap-1.5">
          {tables.length > 0 ? (
            tables.map(t => (
              <Link
                key={t.number}
                href={`/t/${t.secret_token}`}
                className="btn-press py-2 bg-cream hover:bg-saffron hover:text-white border border-divider rounded-xl text-center transition-all font-devanagari"
              >
                <span className="text-[10px] block text-brown-500">टेबल</span>
                <span className="font-bold text-base font-mukta">{t.number}</span>
              </Link>
            ))
          ) : (
            <Link
              href="/t/tok_tbl01_vispute_a1b2c3d4"
              className="col-span-5 btn-press py-2 bg-saffron text-white rounded-xl text-center text-xs font-devanagari font-bold"
            >
              टेबल १ चा QR मेनू उघडा
            </Link>
          )}
        </div>
      </div>

      <footer className="mt-8 text-center text-brown-400 text-xs font-devanagari">
        हॉटेल विस्पुते · सर्व हक्क राखीव · Made with craft in Maharashtra
      </footer>
    </main>
  )
}

function RoleLink({
  href,
  icon,
  label,
  sub,
  badge,
}: {
  href: string
  icon: string
  label: string
  sub: string
  badge: string
}) {
  return (
    <Link
      href={href}
      className="btn-press flex items-center justify-between card-paper px-4 py-3.5 hover:border-saffron transition-all no-underline shadow-xs hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-devanagari text-base font-bold text-brown-900 leading-snug">
              {label}
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.2 rounded font-mono">
              {badge}
            </span>
          </div>
          <span className="text-brown-500 text-xs block font-mukta">{sub}</span>
        </div>
      </div>
      <span className="text-brown-300 text-xl font-bold">›</span>
    </Link>
  )
}
