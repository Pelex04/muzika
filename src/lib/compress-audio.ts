'use client'

// Re-encodes audio to a fixed-bitrate MP3 entirely in the browser (Web
// Audio API to decode, lamejs -- a pure-JS port of LAME -- to encode) so
// it never reaches Supabase Storage at its original size. This is the
// main lever on storage usage: an uncompressed WAV or a FLAC can be 5-10x
// the size of the same track at 128kbps MP3, and on a 1GB free-tier
// bucket a handful of those is enough to fill it.

const TARGET_KBPS = 128
const FORCE_REENCODE_TYPES = ['audio/wav', 'audio/x-wav', 'audio/vnd.wave', 'audio/flac', 'audio/x-flac']
// Already-compressed formats (mp3/aac/m4a) are left alone unless they're
// unusually large for a single track, which usually means a very high
// source bitrate or an unusually long file.
const REENCODE_IF_OVER_MB = 15

function shouldCompress(file: File): boolean {
  const isLossless = FORCE_REENCODE_TYPES.includes(file.type) || /\.(wav|flac)$/i.test(file.name)
  if (isLossless) return true
  return file.size > REENCODE_IF_OVER_MB * 1024 * 1024
}

function floatTo16BitPCM(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length)
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]))
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return output
}

export async function compressAudio(
  file: File,
  onProgress?: (percent: number) => void
): Promise<File> {
  if (!shouldCompress(file)) return file

  try {
    const arrayBuffer = await file.arrayBuffer()
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer)

    const { Mp3Encoder } = await import('@breezystack/lamejs')
    const channels = Math.min(audioBuffer.numberOfChannels, 2)
    const sampleRate = audioBuffer.sampleRate
    const encoder = new Mp3Encoder(channels, sampleRate, TARGET_KBPS)

    const left = floatTo16BitPCM(audioBuffer.getChannelData(0))
    const right = channels > 1 ? floatTo16BitPCM(audioBuffer.getChannelData(1)) : left

    const blockSize = 1152
    const chunks: Uint8Array[] = []
    const totalBlocks = Math.ceil(left.length / blockSize)

    for (let i = 0; i < totalBlocks; i++) {
      const start = i * blockSize
      const leftChunk = left.subarray(start, start + blockSize)
      const rightChunk = right.subarray(start, start + blockSize)
      const mp3buf: Uint8Array = encoder.encodeBuffer(leftChunk, rightChunk)
      if (mp3buf.length > 0) chunks.push(mp3buf)

      // Yield to the main thread periodically so the tab/browser stays
      // responsive during what can be a multi-second CPU-bound encode,
      // and surface progress so the UI doesn't look frozen.
      if (i % 200 === 0) {
        onProgress?.(Math.round((i / totalBlocks) * 100))
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }
    const final: Uint8Array = encoder.flush()
    if (final.length > 0) chunks.push(final)

    await ctx.close()
    onProgress?.(100)

    const blob = new Blob(chunks as BlobPart[], { type: 'audio/mpeg' })
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
