'use client'

// Resizes + recompresses images in the browser before they ever reach
// Supabase Storage. Artists uploading phone-camera photos or unoptimized
// PNGs as cover art can easily be several MB each -- this gets them down
// to a few hundred KB without a visible quality loss at the sizes these
// actually render at in the app.

const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.82
// Small/already-compressed files aren't worth the CPU cycles to reprocess.
const SKIP_IF_UNDER_BYTES = 300 * 1024

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  if (file.size < SKIP_IF_UNDER_BYTES) return file

  try {
    const bitmap = await createImageBitmap(file)
    let { width, height } = bitmap

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / Math.max(width, height)
      width = Math.round(width * scale)
      height = Math.round(height * scale)
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close?.()

    const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY))
    // If compression somehow didn't help (e.g. a tiny icon-like PNG with
    // few colors compresses better than JPEG), just keep the original.
    if (!blob || blob.size >= file.size) return file

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], newName, { type: 'image/jpeg' })
  } catch (err) {
    console.error('Image compression failed, uploading original file', err)
    return file
  }
}
