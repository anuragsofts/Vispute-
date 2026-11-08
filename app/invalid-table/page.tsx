export default function InvalidTablePage() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">❓</div>
        <h1 className="font-devanagari text-2xl font-bold text-brown-900 mb-2">
          QR कोड अवैध आहे
        </h1>
        <p className="text-brown-500 mb-2">
          हा QR कोड ओळखता आला नाही.
        </p>
        <p className="text-brown-200 text-sm">
          Please scan the QR code on your table, or ask a waiter for help.
        </p>
      </div>
    </main>
  )
}
