export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="font-devanagari text-2xl font-bold text-brown-900 mb-2">
          प्रवेश नाही
        </h1>
        <p className="text-brown-500 mb-6">
          You don&apos;t have permission to view this page.
          <br />
          Please contact the restaurant admin.
        </p>
        <a
          href="/login"
          className="
            inline-block px-6 py-3
            bg-saffron text-white
            rounded-[12px] font-semibold
            btn-press hover:bg-saffron-dark
            transition-colors
          "
        >
          Back to Login
        </a>
      </div>
    </main>
  )
}
