'use client'

// Re-encodes audio to a fixed-bitrate MP3 entirely in the browser (Web
// Audio API to decode, lamejs -- a pure-JS port of LAME -- to encode) so
// it never reaches storage at its original size. The encode runs in a
// Web Worker so the page stays responsive during a long track; if a
// worker can't be used for any reason it falls back to encoding on the
// main thread, and if everything fails the original file is uploaded
// untouched.
//
// What to expect: output size is set by the bitrate (128kbps ~= 16KB/s),
// so the saving depends on the source. WAV/FLAC shrink 5-10x; an MP3
// that's already ~190kbps only shrinks by about a third.

const TARGET_KBPS = 128
const FORCE_REENCODE_TYPES = ['audio/wav', 'audio/x-wav', 'audio/vnd.wave', 'audio/flac', 'audio/x-flac']
// Already-compressed formats (mp3/aac/m4a) are left alone unless they're
// unusually large for a single track, which usually means a very high
// source bitrate or an unusually long file.
const REENCODE_IF_OVER_MB = 15
const BLOCK = 1152 // MP3 frame size in samples
const CHUNK_SAMPLES = BLOCK * 64 // ~0.84s of audio per message to the worker

export type CompressStage = 'decoding' | 'encoding'
type ProgressFn = (percent: number, stage: CompressStage) => void

function shouldCompress(file: File): boolean {
  const isLossless = FORCE_REENCODE_TYPES.includes(file.type) || /\.(wav|flac)$/i.test(file.name)
  if (isLossless) return true
  return file.size > REENCODE_IF_OVER_MB * 1024 * 1024
}

// Streams the decoded audio to the worker in small pieces (never copying
// the whole track a second time) and waits for the worker to ask for
// each next piece, so memory use stays flat even for very long tracks.
function encodeInWorker(audioBuffer: AudioBuffer, channels: number, onProgress?: ProgressFn): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./compress-audio.worker.ts', import.meta.url), { type: 'module' })
    const total = audioBuffer.length
    let offset = 0

    const finish = (fn: () => void) => { worker.terminate(); fn() }

    const sendNext = () => {
      if (offset >= total) { worker.postMessage({ type: 'finish' }); return }
      const n = Math.min(CHUNK_SAMPLES, total - offset)
      const left = new Float32Array(n)
      audioBuffer.copyFromChannel(left, 0, offset)
      let right: Float32Array<ArrayBuffer> | null = null
      if (channels > 1) {
        right = new Float32Array(n)
        audioBuffer.copyFromChannel(right, 1, offset)
      }
      offset += n
      onProgress?.(Math.round((offset / total) * 100), 'encoding')
      worker.postMessage({ type: 'chunk', left, right }, right ? [left.buffer, right.buffer] : [left.buffer])
    }

    worker.onmessage = (e: MessageEvent) => {
      const m = e.data
      if (m.type === 'ready') sendNext()
      else if (m.type === 'done') finish(() => resolve(m.blob as Blob))
      else if (m.type === 'error') finish(() => reject(new Error(m.message)))
    }
    worker.onerror = (e: ErrorEvent) => finish(() => reject(new Error(e.message || 'Audio worker failed')))
    worker.postMessage({ type: 'init', channels, sampleRate: audioBuffer.sampleRate, kbps: TARGET_KBPS })
  })
}

// Fallback: same encode, on the main thread, yielding periodically so the
// tab doesn't fully lock up.
async function encodeOnMainThread(audioBuffer: AudioBuffer, channels: number, onProgress?: ProgressFn): Promise<Blob> {
  const { Mp3Encoder } = await import('@breezystack/lamejs')
  const encoder = new Mp3Encoder(channels, audioBuffer.sampleRate, TARGET_KBPS)
  const total = audioBuffer.length
  const parts: Uint8Array[] = []
  let blocks = 0

  for (let offset = 0; offset < total; offset += BLOCK) {
    const n = Math.min(BLOCK, total - offset)
    const l = new Float32Array(n)
    audioBuffer.copyFromChannel(l, 0, offset)
    const left = toInt16(l)
    let buf: Uint8Array
    if (channels > 1) {
      const r = new Float32Array(n)
      audioBuffer.copyFromChannel(r, 1, offset)
      buf = encoder.encodeBuffer(left, toInt16(r))
    } else {
      buf = encoder.encodeBuffer(left)
    }
    if (buf.length > 0) parts.push(buf.slice())

    if (++blocks % 200 === 0) {
      onProgress?.(Math.round((offset / total) * 100), 'encoding')
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }
  const tail = encoder.flush()
  if (tail.length > 0) parts.push(tail.slice())
  return new Blob(parts as BlobPart[], { type: 'audio/mpeg' })
}

function toInt16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length)
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]))
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return out
}

export async function compressAudio(file: File, onProgress?: ProgressFn): Promise<File> {
  if (!shouldCompress(file)) return file

  try {
    onProgress?.(0, 'decoding')
    const arrayBuffer = await file.arrayBuffer()
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
    await ctx.close()

    const channels = Math.min(audioBuffer.numberOfChannels, 2)

    let blob: Blob
    try {
      blob = await encodeInWorker(audioBuffer, channels, onProgress)
    } catch (err) {
      console.warn('Worker encode failed, falling back to main thread', err)
      blob = await encodeOnMainThread(audioBuffer, channels, onProgress)
    }
    onProgress?.(100, 'encoding')

    // Re-encoding should always shrink lossless sources; for the "just
    // large" branch it's possible (if rare) the source was already an
    // efficient low-bitrate file, in which case keep the original.
    if (blob.size >= file.size) return file

    const newName = file.name.replace(/\.[^.]+$/, '') + '.mp3'
    return new File([blob], newName, { type: 'audio/mpeg' })
  } catch (err) {
    console.error('Audio compression failed, uploading original file', err)
    return file
  }
}
