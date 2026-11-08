import Link from 'next/link'

/**
 * Root redirect page – points visitors to the correct role URL.
 * In production the QR code takes customers directly to /t/[token].
 * This root page is only seen by staff navigating manually.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
      {/* Logo / wordmark */}
      <div className="text-center mb-10">
        <h1 className="font-devanagari text-4xl font-bold text-saffron leading-tight">
          विस्पुते हॉटेल
        </h1>
        <p className="text-brown-500 text-sm mt-1 tracking-wide uppercase">
          Vispute Restaurant · Staff Portal
        </p>
      </div>

      {/* Staff role tiles */}
      <div className="w-full max-w-sm space-y-3">
        <StaffLink href="/kitchen" label="🍳 किचन स्क्रीन" sub="Kitchen display" />
        <StaffLink href="/waiter"  label="🛎 वेटर पॅनेल"   sub="Waiter panel"   />
        <StaffLink href="/billing" label="💰 बिलिंग"        sub="Cashier / billing" />
        <StaffLink href="/admin"   label="⚙️ अ‍ॅडमिन"       sub="Owner / admin" />
      </div>

      <p className="mt-10 text-brown-200 text-xs text-center">
        ग्राहकांना टेबलवरील QR कोड स्कॅन करा
        <br />
        <span className="font-mono">/t/[token]</span>
      </p>
    </main>
  )
}

function StaffLink({
  href,
  label,
  sub,
}: {
  href: string
  label: string
  sub: string
}) {
  return (
    <Link
      href={href}
      className="
        flex items-center justify-between
        card-paper px-5 py-4
        btn-press
        hover:border-saffron transition-colors
        no-underline
      "
    >
      <span>
        <span className="font-devanagari text-lg font-semibold text-brown-900 block">
          {label}
        </span>
        <span className="text-brown-500 text-sm">{sub}</span>
      </span>
      <span className="text-brown-200 text-xl">›</span>
    </Link>
  )
}
