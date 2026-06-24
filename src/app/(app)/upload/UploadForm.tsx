'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, Music, Image, CheckCircle2, Loader2, Disc3, X, Plus, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import MobileTopBar from '@/components/layout/MobileTopBar'

const GENRES = ['Afropop', 'Gospel', 'Hip-Hop', 'Reggae', 'RnB', 'Traditional', 'Jazz']

// Practical ceiling for a single audio file. There is NO hard Vercel
// limit anymore since files upload directly browser -> Supabase Storage,
// bypassing our serverless functions entirely. 50MB comfortably covers
// even long, high-bitrate WAV/FLAC tracks while keeping upload times
// reasonable on slower connections.
const MAX_AUDIO_MB = 50
const MAX_COVER_MB = 5

interface PendingTrack {
  id: string
  file: File
  title: string
  trackNumber: number
}

type UploadMode = 'single' | 'album'

export default function UploadForm() {
  const router = useRouter()
  const [mode, setMode] = useState<UploadMode>('single')

  // ── SINGLE TRACK STATE ──
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')

  // ── ALBUM STATE ──
  const [albumTitle, setAlbumTitle] = useState('')
  const [albumGenre, setAlbumGenre] = useState('')
  const [pendingTracks, setPendingTracks] = useState<PendingTrack[]>([])

  // ── SHARED STATE ──
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')

  const validateAudio = (file: File): boolean => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/x-m4a', 'audio/mp4']
    if (!validTypes.includes(file.type) && !/\.(mp3|wav|flac|aac|m4a)$/i.test(file.name)) {
      toast.error('Please upload an MP3, WAV, FLAC, AAC, or M4A file')
      return false
    }
    if (file.size > MAX_AUDIO_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_AUDIO_MB}MB`)
      return false
    }
    return true
  }

  const onSingleAudioDrop = useCallback((files: File[]) => {
    const file = files[0]
    if (!file || !validateAudio(file)) return
    setAudioFile(file)
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''))
  }, [title])

  const onAlbumTracksDrop = useCallback((files: File[]) => {
    const valid = files.filter(validateAudio)
    setPendingTracks(prev => [
      ...prev,
      ...valid.map((file, i) => ({
        id: `${Date.now()}-${i}`,
        file,
        title: file.name.replace(/\.[^.]+$/, ''),
        trackNumber: prev.length + i + 1,
      })),
    ])
  }, [])

  const singleDropzone = useDropzone({
    onDrop: onSingleAudioDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.flac', '.aac', '.m4a'] },
    maxFiles: 1,
  })

  const albumDropzone = useDropzone({
    onDrop: onAlbumTracksDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.flac', '.aac', '.m4a'] },
    multiple: true,
  })

  const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_COVER_MB * 1024 * 1024) {
      toast.error(`Cover image must be under ${MAX_COVER_MB}MB`)
      return
    }
    setCoverFile(file)
    const reader = new FileReader()
    reader.onload = ev => setCoverPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const removePendingTrack = (id: string) => {
    setPendingTracks(prev => prev.filter(t => t.id !== id).map((t, i) => ({ ...t, trackNumber: i + 1 })))
  }

  const updatePendingTrackTitle = (id: string, newTitle: string) => {
    setPendingTracks(prev => prev.map(t => t.id === id ? { ...t, title: newTitle } : t))
  }

  // Uploads one file directly to Supabase Storage via a signed URL,
  // never touching our own API route's request body — this is what
  // actually removes the size constraint that was breaking larger tracks.
  const uploadFileDirect = async (file: File, kind: 'audio' | 'cover'): Promise<string> => {
    const res = await fetch('/api/upload/signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, kind }),
    })
    const { signedUrl, token, path, error } = await res.json()
    if (error || !signedUrl) throw new Error(error ?? 'Could not get upload URL')

    const uploadRes = await fetch(signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    })
    if (!uploadRes.ok) throw new Error('File upload failed')

    return path
  }

  const onSubmitSingle = async () => {
    if (!audioFile) { toast.error('Please add an audio file'); return }
    if (!title.trim()) { toast.error('Track title is required'); return }
    if (!genre) { toast.error('Select a genre'); return }

    setUploading(true)
    try {
      setProgressLabel('Uploading audio…')
      setProgress(20)
      const audioPath = await uploadFileDirect(audioFile, 'audio')

      let coverPath: string | null = null
      if (coverFile) {
        setProgressLabel('Uploading cover art…')
        setProgress(60)
        coverPath = await uploadFileDirect(coverFile, 'cover')
      }

      setProgressLabel('Publishing track…')
      setProgress(85)
      const res = await fetch('/api/upload/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), genre, audioPath, coverPath }),
      })
      const result = await res.json()
      if (!res.ok) { toast.error(result.error ?? 'Upload failed'); setUploading(false); return }

      setProgress(100)
      toast.success('Track published successfully!')
      setTimeout(() => router.push('/songs'), 1200)
    } catch (err: any) {
      toast.error(err?.message ?? 'Upload failed. Please try again.')
      setUploading(false)
    }
  }

  const onSubmitAlbum = async () => {
    if (pendingTracks.length === 0) { toast.error('Add at least one track'); return }
    if (!albumTitle.trim()) { toast.error('Album title is required'); return }
    if (!albumGenre) { toast.error('Select a genre'); return }

    setUploading(true)
    try {
      let coverPath: string | null = null
      if (coverFile) {
        setProgressLabel('Uploading album cover…')
        setProgress(10)
        coverPath = await uploadFileDirect(coverFile, 'cover')
      }

      // Create the album record first
      setProgressLabel('Creating album…')
      setProgress(20)
      const albumRes = await fetch('/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: albumTitle.trim(),
          genre: albumGenre,
          coverPath,
        }),
      })
      const albumResult = await albumRes.json()
      if (!albumRes.ok) { toast.error(albumResult.error ?? 'Could not create album'); setUploading(false); return }
      const albumId = albumResult.album.id

      // Upload + finalize each track sequentially, updating progress as we go
      for (let i = 0; i < pendingTracks.length; i++) {
        const t = pendingTracks[i]
        setProgressLabel(`Uploading track ${i + 1} of ${pendingTracks.length}: ${t.title}`)
        setProgress(20 + Math.round(((i + 0.5) / pendingTracks.length) * 75))

        const audioPath = await uploadFileDirect(t.file, 'audio')

        await fetch('/api/upload/finalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: t.title.trim() || t.file.name,
            genre: albumGenre,
            audioPath,
            albumId,
          }),
        })
      }

      setProgress(100)
      toast.success(`Album "${albumTitle}" published with ${pendingTracks.length} track${pendingTracks.length === 1 ? '' : 's'}!`)
      setTimeout(() => router.push('/songs'), 1200)
    } catch (err: any) {
      toast.error(err?.message ?? 'Upload failed. Please try again.')
      setUploading(false)
    }
  }

  const modeTab = (m: UploadMode, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      className={cn(
        'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all',
        mode === m ? 'bg-white text-black' : 'bg-transparent text-[#b3b3b3] hover:text-white'
      )}
    >
      {icon} {label}
    </button>
  )

  return (
    <div>
      <MobileTopBar eyebrow="Share your music" title="Upload" />

      <div className="max-w-[640px] mx-auto px-5 md:px-9 py-5 md:py-8">
        <div className="hidden md:block mb-7">
          <p className="text-[11px] font-bold text-blue-400 uppercase tracking-[.7px] mb-1">Share your music</p>
          <h1 className="text-3xl font-black text-white tracking-tight">Upload</h1>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 bg-[#181818] rounded-xl p-1 mb-6">
          {modeTab('single', 'Single Track', <Music size={15} />)}
          {modeTab('album', 'Album', <Disc3 size={15} />)}
        </div>

        {mode === 'single' ? (
          <div className="space-y-5">
            {/* Audio Drop Zone */}
            <div
              {...singleDropzone.getRootProps()}
              className={cn(
                'border-[2.5px] border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all bg-[#181818]',
                singleDropzone.isDragActive ? 'border-blue-500 bg-blue-950/30' : 'border-[#3a3a3a] hover:border-blue-400 hover:bg-blue-950/20',
                audioFile && 'border-emerald-500'
              )}
            >
              <input {...singleDropzone.getInputProps()} />
              <div className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3',
                audioFile ? 'bg-emerald-500/15' : 'bg-blue-500/15'
              )}>
                {audioFile
                  ? <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  : <Upload className="w-7 h-7 text-blue-400" />
                }
              </div>
              <p className="text-[15px] font-bold text-white mb-1">
                {audioFile ? audioFile.name : 'Drop your track here'}
              </p>
              <p className="text-sm text-[#b3b3b3]">
                {audioFile
                  ? `${(audioFile.size / 1024 / 1024).toFixed(1)} MB`
                  : <>MP3, WAV, FLAC, AAC, M4A · up to {MAX_AUDIO_MB}MB · or <span className="text-blue-400 font-semibold">browse files</span></>
                }
              </p>
            </div>

            <CoverArtPicker coverPreview={coverPreview} coverFile={coverFile} onCoverChange={onCoverChange} />

            <div>
              <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2">Track Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 border-[1.5px] border-[#2a2a2a] rounded-xl text-sm text-white bg-[#181818] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                placeholder="Track name…"
              />
            </div>

            <GenrePicker selected={genre} onSelect={setGenre} />

            {uploading && <ProgressBar progress={progress} label={progressLabel} />}

            <button
              type="button"
              onClick={onSubmitSingle}
              disabled={uploading}
              className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-60"
            >
              {uploading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                : <><Upload className="w-4 h-4" /> Publish Track</>
              }
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2">Album Title</label>
              <input
                value={albumTitle}
                onChange={e => setAlbumTitle(e.target.value)}
                className="w-full px-4 py-3 border-[1.5px] border-[#2a2a2a] rounded-xl text-sm text-white bg-[#181818] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                placeholder="Album name…"
              />
            </div>

            <CoverArtPicker coverPreview={coverPreview} coverFile={coverFile} onCoverChange={onCoverChange} label="Album Cover" />

            <GenrePicker selected={albumGenre} onSelect={setAlbumGenre} />

            {/* Album tracks drop zone */}
            <div>
              <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2">
                Tracks ({pendingTracks.length})
              </label>
              <div
                {...albumDropzone.getRootProps()}
                className={cn(
                  'border-[2px] border-dashed rounded-xl p-6 text-center cursor-pointer transition-all bg-[#181818] mb-3',
                  albumDropzone.isDragActive ? 'border-blue-500 bg-blue-950/30' : 'border-[#3a3a3a] hover:border-blue-400'
                )}
              >
                <input {...albumDropzone.getInputProps()} />
                <Plus className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">Add tracks to this album</p>
                <p className="text-xs text-[#717171] mt-1">Drop multiple files, or click to browse · up to {MAX_AUDIO_MB}MB each</p>
              </div>

              {pendingTracks.length > 0 && (
                <div className="space-y-2">
                  {pendingTracks.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 bg-[#181818] border border-[#2a2a2a] rounded-lg p-3">
                      <GripVertical size={14} className="text-[#717171] flex-shrink-0" />
                      <span className="text-xs text-[#717171] w-5 flex-shrink-0">{t.trackNumber}</span>
                      <input
                        value={t.title}
                        onChange={e => updatePendingTrackTitle(t.id, e.target.value)}
                        className="flex-1 bg-transparent text-sm text-white outline-none min-w-0"
                      />
                      <span className="text-xs text-[#717171] flex-shrink-0">{(t.file.size / 1024 / 1024).toFixed(1)} MB</span>
                      <button type="button" onClick={() => removePendingTrack(t.id)} className="flex-shrink-0 text-[#717171] hover:text-red-400">
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {uploading && <ProgressBar progress={progress} label={progressLabel} />}

            <button
              type="button"
              onClick={onSubmitAlbum}
              disabled={uploading}
              className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-60"
            >
              {uploading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                : <><Disc3 className="w-4 h-4" /> Publish Album ({pendingTracks.length} track{pendingTracks.length === 1 ? '' : 's'})</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function GenrePicker({ selected, onSelect }: { selected: string; onSelect: (g: string) => void }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2">Genre</label>
      <div className="flex flex-wrap gap-2">
        {GENRES.map(g => (
          <button
            key={g}
            type="button"
            onClick={() => onSelect(g)}
            className={cn(
              'px-4 py-1.5 rounded-full border-[1.5px] text-sm font-semibold transition-all',
              selected === g
                ? 'bg-white border-white text-black'
                : 'bg-transparent border-[#3a3a3a] text-[#b3b3b3] hover:border-blue-400'
            )}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  )
}

function CoverArtPicker({ coverPreview, coverFile, onCoverChange, label = 'Cover Art (Optional)' }: {
  coverPreview: string | null
  coverFile: File | null
  onCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  label?: string
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2">{label}</label>
      <label className="flex items-center gap-3 bg-[#181818] border-[1.5px] border-[#2a2a2a] rounded-xl p-3 cursor-pointer hover:border-blue-400 transition-all">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#282828] flex-shrink-0 grid place-items-center">
          {coverPreview
            ? <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
            : <Image className="w-5 h-5 text-[#717171]" />
          }
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{coverFile ? coverFile.name : 'Upload cover image'}</p>
          <p className="text-xs text-[#717171]">JPG, PNG, WebP · Max {MAX_COVER_MB}MB</p>
        </div>
        <input type="file" accept="image/*" onChange={onCoverChange} className="hidden" />
      </label>
    </div>
  )
}

function ProgressBar({ progress, label }: { progress: number; label: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-[#b3b3b3] mb-1">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
