// Runs the MP3 encode off the main thread so the upload page stays
// responsive (scrolling, cancelling, the progress bar) while a long
// track is being compressed. The main thread decodes the audio (the Web
// Audio API isn't available in workers) and streams raw samples here in
// small chunks; this worker encodes them as they arrive.
//
// Protocol (main -> worker):  init | chunk | finish
// Protocol (worker -> main):  ready | done | error
import { Mp3Encoder } from '@breezystack/lamejs'

type InMsg =
  | { type: 'init'; channels: number; sampleRate: number; kbps: number }
  | { type: 'chunk'; left: Float32Array; right: Float32Array | null }
  | { type: 'finish' }

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent<InMsg>) => void) | null
  postMessage: (message: unknown) => void
}

const BLOCK = 1152 // MP3 frame size in samples
let encoder: Mp3Encoder | null = null
let stereo = false
let parts: Uint8Array[] = []

function toInt16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length)
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]))
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return out
}

ctx.onmessage = (e: MessageEvent<InMsg>) => {
  try {
    const msg = e.data
    if (msg.type === 'init') {
      encoder = new Mp3Encoder(msg.channels, msg.sampleRate, msg.kbps)
      stereo = msg.channels > 1
      parts = []
      ctx.postMessage({ type: 'ready' })
    } else if (msg.type === 'chunk') {
      if (!encoder) throw new Error('Encoder not initialised')
      const left = toInt16(msg.left)
      const right = stereo && msg.right ? toInt16(msg.right) : null
      for (let i = 0; i < left.length; i += BLOCK) {
        const l = left.subarray(i, i + BLOCK)
        const buf = right ? encoder.encodeBuffer(l, right.subarray(i, i + BLOCK)) : encoder.encodeBuffer(l)
        if (buf.length > 0) parts.push(buf.slice())
      }
      ctx.postMessage({ type: 'ready' }) // ask for the next chunk (backpressure)
    } else if (msg.type === 'finish') {
      if (!encoder) throw new Error('Encoder not initialised')
      const tail = encoder.flush()
      if (tail.length > 0) parts.push(tail.slice())
      ctx.postMessage({ type: 'done', blob: new Blob(parts as BlobPart[], { type: 'audio/mpeg' }) })
      encoder = null
      parts = []
    }
  } catch (err) {
    ctx.postMessage({ type: 'error', message: err instanceof Error ? err.message : String(err) })
  }
}
