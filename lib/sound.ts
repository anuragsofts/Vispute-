/**
 * Web Audio API synthesizer for Kitchen chimes.
 * Works offline, no external audio file downloads required!
 */

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    audioCtx = new AudioContextClass()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

/** Play a single chime tone */
function playTone(freq: number, duration: number, delay: number = 0) {
  try {
    const ctx = getAudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)

    gain.gain.setValueAtTime(0.3, ctx.currentTime + delay)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + duration)
  } catch (e) {
    console.warn('Audio play error:', e)
  }
}

/**
 * 1 Ring for new order
 */
export function playNewOrderChime() {
  playTone(587.33, 0.4, 0)     // D5
  playTone(880.00, 0.7, 0.25)  // A5
}

/**
 * 3 Rings for added items on existing table
 */
export function playAddonOrderChime() {
  playTone(659.25, 0.25, 0)    // E5
  playTone(783.99, 0.25, 0.2)  // G5
  playTone(1046.5, 0.6, 0.4)   // C6
}

/** Unlock audio context on first user tap */
export async function unlockAudio(): Promise<boolean> {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
    // Play a gentle silent blip
    playTone(440, 0.05, 0)
    return true
  } catch {
    return false
  }
}
