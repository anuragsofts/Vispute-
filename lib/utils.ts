/**
 * Shared utility functions used across the app
 */

/** Format price in Indian Rupee style: ₹120 or ₹1,200 */
export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

/** Validate 10-digit Indian mobile number */
export function isValidMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile.replace(/\s/g, ''))
}

/** Minutes since a given ISO timestamp */
export function minutesSince(isoString: string): number {
  const diff = Date.now() - new Date(isoString).getTime()
  return Math.floor(diff / 60_000)
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Generate a table QR URL */
export function tableUrl(baseUrl: string, token: string): string {
  return `${baseUrl}/t/${token}`
}

/** Debounce function */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/** Sum order items total */
export function calcSubtotal(
  items: Array<{ price_snapshot: number; qty: number }>
): number {
  return items.reduce((sum, item) => sum + item.price_snapshot * item.qty, 0)
}

/** Calculate GST (5% default for restaurants) */
export function calcGST(subtotal: number, rate = 0.05): number {
  return Math.round(subtotal * rate * 100) / 100
}
