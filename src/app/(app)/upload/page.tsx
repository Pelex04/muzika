'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Upload, Music, Image, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import MobileTopBar from '@/components/layout/MobileTopBar'

const GENRES = ['Afropop', 'Gospel', 'Hip-Hop', 'Reggae', 'RnB', 'Traditional', 'Jazz']

const schema = z.object({
  title: z.string().min(1, 'Track title is required').max(100),
  genre: z.string().min(1, 'Select a genre'),
})
type FormData = z.infer<typeof schema>

export default function UploadPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkArtist() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/signin'); return }
      const { data: artist } = await supabase
        .from('artists')
        .select('id')
        .eq('profile_id', user.id)
        .single()
      if (!artist) router.push('/become-artist')
    }
    checkArtist()
  }, [])
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { genre: '' },
  })


  const onAudioDrop = useCallback((files: File[]) => {
    const file = files[0]
    if (!file) return
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload an MP3, WAV, FLAC, or AAC file')
      return
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error('File must be under 100MB')
      return
    }
    setAudioFile(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onAudioDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.flac', '.aac'] },
    maxFiles: 1,
  })

  const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    const reader = new FileReader()
    reader.onload = ev => setCoverPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: FormData) => {
    if (!audioFile) { toast.error('Please upload an audio file'); return }

    setUploading(true)
    setUploadProgress(10)

    const formData = new FormData()
    formData.append('audio', audioFile)
    formData.append('title', data.title)
    formData.append('genre', data.genre)
    if (coverFile) formData.append('cover', coverFile)

    setUploadProgress(30)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      setUploadProgress(90)
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error ?? 'Upload failed')
        return
      }

      setUploadProgress(100)
      toast.success('Track published successfully!')
      setTimeout(() => router.push('/songs'), 1500)
    } catch (err) {
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <MobileTopBar eyebrow="Share your music" title="Upload Track" />

      <div className="max-w-[640px] mx-auto px-5 md:px-9 py-5 md:py-8">
        <div className="hidden md:block mb-7">
          <p className="text-[11px] font-bold text-blue-600 uppercase tracking-[.7px] mb-1">Share your music</p>
          <h1 className="text-3xl font-black text-white tracking-tight">Upload Track</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Audio Drop Zone */}
          <div
            {...getRootProps()}
            className={cn(
              'border-[2.5px] border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all bg-[#181818]',
              isDragActive ? 'border-blue-500 bg-blue-950/30' : 'border-[#3a3a3a] hover:border-blue-400 hover:bg-blue-950/20',
              audioFile && 'border-emerald-500 bg-emerald-50'
            )}
          >
            <input {...getInputProps()} />
            <div className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3',
              audioFile ? 'bg-emerald-100' : 'bg-blue-100'
            )}>
              {audioFile
                ? <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                : <Upload className="w-7 h-7 text-blue-600" />
              }
            </div>
            <p className="text-[15px] font-bold text-white mb-1">
              {audioFile ? audioFile.name : 'Drop your track here'}
            </p>
            <p className="text-sm text-[#b3b3b3]">
              {audioFile
                ? `${(audioFile.size / 1024 / 1024).toFixed(1)} MB`
                : <>MP3, WAV, FLAC · or <span className="text-blue-600 font-semibold">browse files</span></>
              }
            </p>
          </div>

          {/* Cover Art */}
          <div>
            <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2">
              Cover Art (Optional)
            </label>
            <label className="flex items-center gap-3 bg-[#181818] border-[1.5px] border-[#2a2a2a] rounded-xl p-3 cursor-pointer hover:border-blue-400 transition-all">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#282828] flex-shrink-0 grid place-items-center">
                {coverPreview
                  ? <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  : <Image className="w-5 h-5 text-[#717171]" />
                }
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {coverFile ? coverFile.name : 'Upload cover image'}
                </p>
                <p className="text-xs text-[#717171]">JPG, PNG, WebP · Max 5MB</p>
              </div>
              <input type="file" accept="image/*" onChange={onCoverChange} className="hidden" />
            </label>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2">
              Track Title
            </label>
            <input
              {...register('title')}
              className="w-full px-4 py-3 border-[1.5px] border-[#2a2a2a] rounded-xl text-sm text-white bg-[#181818] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
              placeholder="Track name…"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Genre */}
          <div>
            <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2">
              Genre
            </label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => {
                const active = watch('genre') === g
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setValue('genre', g)}
                    className={cn(
                      'px-4 py-1.5 rounded-full border-[1.5px] text-sm font-semibold transition-all',
                      active
                        ? 'bg-white border-white text-black'
                        : 'bg-transparent border-[#3a3a3a] text-[#b3b3b3] hover:border-blue-400'
                    )}
                  >
                    {g}
                  </button>
                )
              })}
            </div>
            {errors.genre && <p className="text-red-500 text-xs mt-1">{errors.genre.message}</p>}
          </div>
          {/* Upload progress */}
          {uploading && (
            <div>
              <div className="flex justify-between text-xs text-[#b3b3b3] mb-1">
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-60"
          >
            {uploading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
              : <><Upload className="w-4 h-4" /> Publish Track</>
            }
          </button>
        </form>
      </div>
    </div>
  )
}
