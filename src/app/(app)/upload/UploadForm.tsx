'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { notify } from '@/components/ui/notify'
import { Upload, Music, Image, CheckCircle2, Loader2, Disc3, X, Plus, GripVertical, Users, Mic2, FileText, Calendar, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import MobileTopBar from '@/components/layout/MobileTopBar'

const GENRES = ['Afropop', 'Gospel', 'Hip-Hop', 'Reggae', 'RnB', 'Traditional', 'Jazz', 'Amapiano']
const MAX_AUDIO_MB = 50
const MAX_COVER_MB = 5

interface PendingTrack {
  id: string
  file: File
  title: string
  trackNumber: number
  producers: string
  featuredArtists: string
  lyrics: string
  scheduled: boolean
  releaseDate: string
}

type UploadMode = 'single' | 'album' | 'podcast'

// ── Tag input helper ──────────────────────────────────────────────
function TagInput({
  label, placeholder, value, onChange, icon: Icon,
}: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; icon?: React.ElementType
}) {
  const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : []
  const [input, setInput] = useState('')

  const addTag = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    const next = [...tags, trimmed].join(', ')
    onChange(next)
    setInput('')
  }

  const removeTag = (i: number) => {
    const next = tags.filter((_, idx) => idx !== i).join(', ')
    onChange(next)
  }

  return (
    <div>
      <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2 flex items-center gap-1.5">
        {Icon && <Icon size={11} />}{label}
      </label>
      <div className="bg-[#181818] border-[1.5px] border-[#2a2a2a] rounded-xl p-2.5 focus-within:border-blue-500 transition-all">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag, i) => (
              <span key={i} className="flex items-center gap-1 bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                {tag}
                <button type="button" onClick={() => removeTag(i)} className="text-blue-300/60 hover:text-blue-200">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#555]"
          />
          {input.trim() && (
            <button type="button" onClick={addTag} className="text-blue-400 text-xs font-bold px-2">Add</button>
          )}
        </div>
      </div>
      <p className="text-[11px] text-[#555] mt-1">Press Enter or comma to add</p>
    </div>
  )
}

interface ExistingPodcast {
  id: string
  title: string
  cover_url: string | null
  category: string | null
}

export default function UploadForm({ existingPodcasts = [], creatorType = 'artist' }: { existingPodcasts?: ExistingPodcast[]; creatorType?: 'artist' | 'podcast_creator' }) {
  const router = useRouter()
  const [mode, setMode] = useState<UploadMode>(creatorType === 'podcast_creator' ? 'podcast' : 'single')

  // ── SINGLE TRACK STATE ──
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [producers, setProducers] = useState('')
  const [featuredArtists, setFeaturedArtists] = useState('')
  const [lyrics, setLyrics] = useState('')
  const [releaseDate, setReleaseDate] = useState('')
  const [isScheduled, setIsScheduled] = useState(false)

  // ── ALBUM STATE ──
  const [albumTitle, setAlbumTitle] = useState('')
  const [albumGenre, setAlbumGenre] = useState('')
  const [albumReleaseType, setAlbumReleaseType] = useState<'album' | 'ep'>('album')
  const [albumReleaseDate, setAlbumReleaseDate] = useState('')
  const [albumScheduled, setAlbumScheduled] = useState(false)
  const [pendingTracks, setPendingTracks] = useState<PendingTrack[]>([])
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null)

  // ── PODCAST STATE ──
  const [podcasts, setPodcasts] = useState<ExistingPodcast[]>(existingPodcasts)
  const [selectedPodcastId, setSelectedPodcastId] = useState<string>(existingPodcasts[0]?.id ?? 'new')
  const [newPodcastTitle, setNewPodcastTitle] = useState('')
  const [newPodcastDescription, setNewPodcastDescription] = useState('')
  const [newPodcastCategory, setNewPodcastCategory] = useState('')
  const [episodeAudioFile, setEpisodeAudioFile] = useState<File | null>(null)
  const [episodeTitle, setEpisodeTitle] = useState('')
  const [episodeDescription, setEpisodeDescription] = useState('')
  const [episodeNumber, setEpisodeNumber] = useState('')
  const [episodeReleaseDate, setEpisodeReleaseDate] = useState('')
  const [episodeScheduled, setEpisodeScheduled] = useState(false)

  // ── SHARED STATE ──
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')

  const validateAudio = (file: File): boolean => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/x-m4a', 'audio/mp4']
    if (!validTypes.includes(file.type) && !/\.(mp3|wav|flac|aac|m4a)$/i.test(file.name)) {
      notify.error('Please upload an MP3, WAV, FLAC, AAC, or M4A file')
      return false
    }
    if (file.size > MAX_AUDIO_MB * 1024 * 1024) {
      notify.error(`File must be under ${MAX_AUDIO_MB}MB`)
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
        producers: '',
        featuredArtists: '',
        lyrics: '',
        scheduled: false,
        releaseDate: '',
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

  const onEpisodeAudioDrop = useCallback((files: File[]) => {
    const file = files[0]
    if (!file) return
    if (!validateAudio(file)) return
    setEpisodeAudioFile(file)
  }, [])

  const episodeDropzone = useDropzone({
    onDrop: onEpisodeAudioDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.flac', '.aac', '.m4a'] },
    maxFiles: 1,
  })

  const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_COVER_MB * 1024 * 1024) { notify.error(`Cover must be under ${MAX_COVER_MB}MB`); return }
    setCoverFile(file)
    const reader = new FileReader()
    reader.onload = ev => setCoverPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const removePendingTrack = (id: string) =>
    setPendingTracks(prev => prev.filter(t => t.id !== id).map((t, i) => ({ ...t, trackNumber: i + 1 })))

  const updatePendingTrack = (id: string, key: keyof PendingTrack, val: string | boolean) =>
    setPendingTracks(prev => prev.map(t => t.id === id ? { ...t, [key]: val } : t))

  const uploadFileDirect = async (file: File, kind: 'audio' | 'cover'): Promise<string> => {
    const res = await fetch('/api/upload/signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, kind }),
    })
    const { signedUrl, path, error } = await res.json()
    if (error || !signedUrl) throw new Error(error ?? 'Could not get upload URL')
    const uploadRes = await fetch(signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    })
    if (!uploadRes.ok) throw new Error('File upload failed')
    return path
  }

  const parseTags = (s: string) => s.split(',').map(t => t.trim()).filter(Boolean)

  const onSubmitSingle = async () => {
    if (!audioFile) { notify.error('Please add an audio file'); return }
    if (!title.trim()) { notify.error('Track title is required'); return }
    if (!genre) { notify.error('Select a genre'); return }
    if (isScheduled && !releaseDate) { notify.error('Set a release date or uncheck "Schedule release"'); return }

    setUploading(true)
    try {
      setProgressLabel('Uploading audio…'); setProgress(20)
      const audioPath = await uploadFileDirect(audioFile, 'audio')

      let coverPath: string | null = null
      if (coverFile) {
        setProgressLabel('Uploading cover art…'); setProgress(60)
        coverPath = await uploadFileDirect(coverFile, 'cover')
      }

      setProgressLabel('Publishing…'); setProgress(85)
      const res = await fetch('/api/upload/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(), genre, audioPath, coverPath,
          producers: parseTags(producers),
          featuredArtists: parseTags(featuredArtists),
          lyrics: lyrics.trim() || null,
          releaseDate: isScheduled && releaseDate ? new Date(releaseDate).toISOString() : null,
        }),
      })
      const result = await res.json()
      if (!res.ok) { notify.error(result.error ?? 'Upload failed'); setUploading(false); return }

      setProgress(100)
      notify.success(isScheduled ? 'Track scheduled!' : 'Track published!', isScheduled ? `Will go live on ${new Date(releaseDate).toLocaleDateString()}` : undefined)
      setTimeout(() => router.push('/profile'), 1200)
    } catch (err: any) {
      notify.error(err?.message ?? 'Upload failed')
      setUploading(false)
    }
  }

  const onSubmitAlbum = async () => {
    if (pendingTracks.length === 0) { notify.error('Add at least one track'); return }
    if (!albumTitle.trim()) { notify.error('Album title is required'); return }
    if (!albumGenre) { notify.error('Select a genre'); return }
    if (albumScheduled && !albumReleaseDate) { notify.error('Set a release date or uncheck "Schedule release"'); return }

    setUploading(true)
    try {
      let coverPath: string | null = null
      if (coverFile) {
        setProgressLabel('Uploading album cover…'); setProgress(10)
        coverPath = await uploadFileDirect(coverFile, 'cover')
      }

      setProgressLabel('Creating album…'); setProgress(20)
      const albumRes = await fetch('/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: albumTitle.trim(), genre: albumGenre, coverPath,
          releaseType: albumReleaseType,
          releaseDate: albumScheduled && albumReleaseDate ? new Date(albumReleaseDate).toISOString() : null,
        }),
      })
      const albumResult = await albumRes.json()
      if (!albumRes.ok) { notify.error(albumResult.error ?? 'Could not create album'); setUploading(false); return }
      const albumId = albumResult.album.id

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
            genre: albumGenre, audioPath, coverPath, albumId,
            producers: parseTags(t.producers),
            featuredArtists: parseTags(t.featuredArtists),
            lyrics: t.lyrics.trim() || null,
            releaseDate: t.scheduled && t.releaseDate
              ? new Date(t.releaseDate).toISOString()
              : (albumScheduled && albumReleaseDate ? new Date(albumReleaseDate).toISOString() : null),
          }),
        })
      }

      setProgress(100)
      notify.success(albumScheduled ? 'Album scheduled!' : `Album published with ${pendingTracks.length} tracks!`)
      setTimeout(() => router.push('/profile'), 1200)
    } catch (err: any) {
      notify.error(err?.message ?? 'Upload failed')
      setUploading(false)
    }
  }

  const onSubmitPodcast = async () => {
    if (!episodeAudioFile) { notify.error('Please add an audio file for the episode'); return }
    if (!episodeTitle.trim()) { notify.error('Episode title is required'); return }
    if (selectedPodcastId === 'new' && !newPodcastTitle.trim()) { notify.error('Podcast show title is required'); return }
    if (episodeScheduled && !episodeReleaseDate) { notify.error('Set a release date or uncheck "Schedule release"'); return }

    setUploading(true)
    try {
      let podcastId = selectedPodcastId

      if (selectedPodcastId === 'new') {
        let coverPath: string | null = null
        if (coverFile) {
          setProgressLabel('Uploading show cover…'); setProgress(10)
          coverPath = await uploadFileDirect(coverFile, 'cover')
        }
        setProgressLabel('Creating podcast show…'); setProgress(20)
        const showRes = await fetch('/api/podcasts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newPodcastTitle.trim(),
            description: newPodcastDescription.trim() || null,
            category: newPodcastCategory.trim() || null,
            coverPath,
          }),
        })
        const showResult = await showRes.json()
        if (!showRes.ok) { notify.error(showResult.error ?? 'Could not create podcast'); setUploading(false); return }
        podcastId = showResult.podcast.id
        setPodcasts(prev => [showResult.podcast, ...prev])
        setSelectedPodcastId(podcastId)
      }

      setProgressLabel('Uploading episode audio…'); setProgress(50)
      const audioPath = await uploadFileDirect(episodeAudioFile, 'audio')

      setProgressLabel('Publishing episode…'); setProgress(85)
      const epRes = await fetch(`/api/podcasts/${podcastId}/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: episodeTitle.trim(),
          description: episodeDescription.trim() || null,
          audioPath,
          episodeNumber: episodeNumber ? Number(episodeNumber) : null,
          releaseDate: episodeScheduled && episodeReleaseDate ? new Date(episodeReleaseDate).toISOString() : null,
        }),
      })
      const epResult = await epRes.json()
      if (!epRes.ok) { notify.error(epResult.error ?? 'Could not publish episode'); setUploading(false); return }

      setProgress(100)
      notify.success(episodeScheduled ? 'Episode scheduled!' : 'Episode published!')
      setTimeout(() => router.push('/studio/podcasts'), 1200)
    } catch (err: any) {
      notify.error(err?.message ?? 'Upload failed')
      setUploading(false)
    }
  }

  const modeTab = (m: UploadMode, label: string, icon: React.ReactNode) => (
    <button type="button" onClick={() => setMode(m)}
      className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all',
        mode === m ? 'bg-white text-black' : 'bg-transparent text-[#b3b3b3] hover:text-white'
      )}>
      {icon} {label}
    </button>
  )

  // ── Scheduler toggle UI ──
  const SchedulerField = ({ scheduled, onToggle, date, onDate, label }: {
    scheduled: boolean; onToggle: () => void; date: string; onDate: (v: string) => void; label: string
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between bg-[#181818] border border-[#2a2a2a] rounded-xl p-3">
        <div className="flex items-center gap-2.5">
          <Calendar size={15} className="text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white">Schedule release</p>
            <p className="text-[11px] text-[#555]">Set a future date — it goes live automatically</p>
          </div>
        </div>
        <button type="button" onClick={onToggle}
          className="w-10 h-5.5 rounded-full transition-colors relative flex-shrink-0"
          style={{ background: scheduled ? '#2563eb' : '#2a2a2a', padding: '3px' }}>
          <div className="w-4 h-4 rounded-full bg-white transition-all"
            style={{ marginLeft: scheduled ? '18px' : '0px' }} />
        </button>
      </div>
      {scheduled && (
        <div>
          <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2">
            {label}
          </label>
          <input type="datetime-local"
            value={date}
            min={new Date().toISOString().slice(0, 16)}
            onChange={e => onDate(e.target.value)}
            className="w-full px-4 py-3 border-[1.5px] border-[#2a2a2a] rounded-xl text-sm text-white bg-[#181818] focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
      )}
    </div>
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
          {creatorType === 'artist' && modeTab('single', 'Single Track', <Music size={15} />)}
          {creatorType === 'artist' && modeTab('album', 'Album', <Disc3 size={15} />)}
          {creatorType === 'podcast_creator' && modeTab('podcast', 'Podcast', <Mic2 size={15} />)}
        </div>

        {mode === 'single' ? (
          <div className="space-y-5">
            {/* Audio Drop Zone */}
            <div {...singleDropzone.getRootProps()}
              className={cn('border-[2.5px] border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all bg-[#181818]',
                singleDropzone.isDragActive ? 'border-blue-500 bg-blue-950/30' : 'border-[#3a3a3a] hover:border-blue-400 hover:bg-blue-950/20',
                audioFile && 'border-emerald-500'
              )}>
              <input {...singleDropzone.getInputProps()} />
              <div className={cn('w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3', audioFile ? 'bg-emerald-500/15' : 'bg-blue-500/15')}>
                {audioFile ? <CheckCircle2 className="w-7 h-7 text-emerald-400" /> : <Upload className="w-7 h-7 text-blue-400" />}
              </div>
              <p className="text-[15px] font-bold text-white mb-1">{audioFile ? audioFile.name : 'Drop your track here'}</p>
              <p className="text-sm text-[#b3b3b3]">{audioFile ? `${(audioFile.size / 1024 / 1024).toFixed(1)} MB` : <>MP3, WAV, FLAC, AAC, M4A · up to {MAX_AUDIO_MB}MB</>}</p>
            </div>

            <CoverArtPicker coverPreview={coverPreview} coverFile={coverFile} onCoverChange={onCoverChange} />

            <div>
              <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2">Track Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 border-[1.5px] border-[#2a2a2a] rounded-xl text-sm text-white bg-[#181818] focus:outline-none focus:border-blue-500 transition-all"
                placeholder="Track name…" />
            </div>

            <GenrePicker selected={genre} onSelect={setGenre} />

            <TagInput label="Producers" placeholder="e.g. Rasta Kadema" value={producers} onChange={setProducers} icon={Mic2} />
            <TagInput label="Featured Artists" placeholder="e.g. Jay Dee" value={featuredArtists} onChange={setFeaturedArtists} icon={Users} />

            {/* Lyrics */}
            <div>
              <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2 flex items-center gap-1.5">
                <FileText size={11} /> Lyrics (Optional)
              </label>
              <textarea value={lyrics} onChange={e => setLyrics(e.target.value)} rows={6}
                className="w-full px-4 py-3 border-[1.5px] border-[#2a2a2a] rounded-xl text-sm text-white bg-[#181818] focus:outline-none focus:border-blue-500 transition-all resize-none"
                placeholder="Paste your lyrics here…" />
            </div>

            <SchedulerField
              scheduled={isScheduled} onToggle={() => setIsScheduled(s => !s)}
              date={releaseDate} onDate={setReleaseDate}
              label="Release Date & Time" />

            {uploading && <ProgressBar progress={progress} label={progressLabel} />}

            <div className="sticky bottom-0 pt-3 pb-1 bg-[#121212]">
              <button type="button" onClick={onSubmitSingle} disabled={uploading}
                className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-60">
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Upload className="w-4 h-4" /> {isScheduled ? 'Schedule Track' : 'Publish Track'}</>}
              </button>
            </div>
          </div>
        ) : mode === 'album' ? (
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2">Release Type</label>
              <div className="flex gap-2">
                {(['album', 'ep'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAlbumReleaseType(t)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-[1.5px] transition-all ${
                      albumReleaseType === t
                        ? 'bg-white text-black border-white'
                        : 'bg-[#181818] text-[#b3b3b3] border-[#2a2a2a] hover:border-[#3a3a3a]'
                    }`}
                  >
                    {t === 'album' ? 'Album' : 'EP'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2">
                {albumReleaseType === 'ep' ? 'EP Title' : 'Album Title'}
              </label>
              <input value={albumTitle} onChange={e => setAlbumTitle(e.target.value)}
                className="w-full px-4 py-3 border-[1.5px] border-[#2a2a2a] rounded-xl text-sm text-white bg-[#181818] focus:outline-none focus:border-blue-500 transition-all"
                placeholder={albumReleaseType === 'ep' ? 'EP name…' : 'Album name…'} />
            </div>

            <CoverArtPicker coverPreview={coverPreview} coverFile={coverFile} onCoverChange={onCoverChange} label={albumReleaseType === 'ep' ? 'EP Cover' : 'Album Cover'} />
            <GenrePicker selected={albumGenre} onSelect={setAlbumGenre} />
            <SchedulerField
              scheduled={albumScheduled} onToggle={() => setAlbumScheduled(s => !s)}
              date={albumReleaseDate} onDate={setAlbumReleaseDate}
              label={albumReleaseType === 'ep' ? 'EP Release Date & Time' : 'Album Release Date & Time'} />

            {/* Tracks */}
            <div>
              <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2">
                Tracks ({pendingTracks.length})
              </label>
              <div {...albumDropzone.getRootProps()}
                className={cn('border-[2px] border-dashed rounded-xl p-6 text-center cursor-pointer transition-all bg-[#181818] mb-3',
                  albumDropzone.isDragActive ? 'border-blue-500 bg-blue-950/30' : 'border-[#3a3a3a] hover:border-blue-400'
                )}>
                <input {...albumDropzone.getInputProps()} />
                <Plus className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">Add tracks to this album</p>
                <p className="text-xs text-[#717171] mt-1">Drop multiple files, or click to browse · up to {MAX_AUDIO_MB}MB each</p>
              </div>

              {pendingTracks.length > 0 && (
                <div className="space-y-2">
                  {pendingTracks.map(t => (
                    <div key={t.id} className="bg-[#181818] border border-[#2a2a2a] rounded-xl overflow-hidden">
                      {/* Track header row */}
                      <div className="flex items-center gap-3 p-3">
                        <GripVertical size={14} className="text-[#717171] flex-shrink-0" />
                        <span className="text-xs text-[#717171] w-5 flex-shrink-0">{t.trackNumber}</span>
                        <input value={t.title} onChange={e => updatePendingTrack(t.id, 'title', e.target.value)}
                          className="flex-1 bg-transparent text-sm text-white outline-none min-w-0" />
                        <span className="text-xs text-[#717171] flex-shrink-0">{(t.file.size / 1024 / 1024).toFixed(1)} MB</span>
                        <button type="button" onClick={() => setExpandedTrack(expandedTrack === t.id ? null : t.id)}
                          className="text-[#717171] hover:text-blue-400 text-xs font-bold px-2 flex-shrink-0">
                          {expandedTrack === t.id ? '▲' : '▼'}
                        </button>
                        <button type="button" onClick={() => removePendingTrack(t.id)} className="text-[#717171] hover:text-red-400 flex-shrink-0">
                          <X size={14} />
                        </button>
                      </div>
                      {/* Expanded per-track details */}
                      {expandedTrack === t.id && (
                        <div className="border-t border-[#2a2a2a] p-3 space-y-3">
                          <TagInput label="Producers" placeholder="Producer name" value={t.producers}
                            onChange={v => updatePendingTrack(t.id, 'producers', v)} icon={Mic2} />
                          <TagInput label="Featured Artists" placeholder="Artist name" value={t.featuredArtists}
                            onChange={v => updatePendingTrack(t.id, 'featuredArtists', v)} icon={Users} />
                          <div>
                            <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-1.5 flex items-center gap-1.5">
                              <FileText size={10} /> Lyrics
                            </label>
                            <textarea value={t.lyrics} onChange={e => updatePendingTrack(t.id, 'lyrics', e.target.value)} rows={4}
                              className="w-full px-3 py-2.5 border border-[#2a2a2a] rounded-lg text-xs text-white bg-[#111] focus:outline-none focus:border-blue-500 transition-all resize-none"
                              placeholder="Paste lyrics…" />
                          </div>
                          <div className="border-t border-[#2a2a2a] pt-3">
                            <label className="flex items-center gap-2 cursor-pointer mb-2">
                              <input
                                type="checkbox"
                                checked={t.scheduled}
                                onChange={e => updatePendingTrack(t.id, 'scheduled', e.target.checked)}
                                className="w-4 h-4 accent-blue-500"
                              />
                              <span className="text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px]">
                                Give this song its own release date
                              </span>
                            </label>
                            {t.scheduled ? (
                              <input
                                type="datetime-local"
                                value={t.releaseDate}
                                onChange={e => updatePendingTrack(t.id, 'releaseDate', e.target.value)}
                                className="w-full px-3 py-2.5 border border-[#2a2a2a] rounded-lg text-xs text-white bg-[#111] focus:outline-none focus:border-blue-500 transition-all"
                              />
                            ) : (
                              <p className="text-[11px] text-[#555]">
                                {albumScheduled ? 'Releases with the album' : 'Releases immediately with the album'}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {uploading && <ProgressBar progress={progress} label={progressLabel} />}

            <div className="sticky bottom-0 pt-3 pb-1 bg-[#121212]">
              <button type="button" onClick={onSubmitAlbum} disabled={uploading}
                className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-60">
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Disc3 className="w-4 h-4" /> {albumScheduled ? 'Schedule Album' : `Publish Album (${pendingTracks.length} track${pendingTracks.length === 1 ? '' : 's'})`}</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2">Podcast Show</label>
              <select
                value={selectedPodcastId}
                onChange={e => setSelectedPodcastId(e.target.value)}
                className="w-full px-4 py-3 border-[1.5px] border-[#2a2a2a] rounded-xl text-sm text-white bg-[#181818] focus:outline-none focus:border-blue-500 transition-all"
              >
                {podcasts.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                <option value="new">+ Create a new show…</option>
              </select>
            </div>

            {selectedPodcastId === 'new' && (
              <div className="space-y-5 bg-[#181818] border border-[#2a2a2a] rounded-xl p-4">
                <p className="text-[11px] font-bold text-blue-400 uppercase tracking-[.7px]">New Show Details</p>
                <div>
                  <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2">Show Title</label>
                  <input value={newPodcastTitle} onChange={e => setNewPodcastTitle(e.target.value)}
                    className="w-full px-4 py-3 border-[1.5px] border-[#2a2a2a] rounded-xl text-sm text-white bg-[#121212] focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="Show name…" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2">Description</label>
                  <textarea value={newPodcastDescription} onChange={e => setNewPodcastDescription(e.target.value)} rows={3}
                    className="w-full px-4 py-3 border-[1.5px] border-[#2a2a2a] rounded-xl text-sm text-white bg-[#121212] focus:outline-none focus:border-blue-500 transition-all resize-none"
                    placeholder="What's this show about?" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2">Category</label>
                  <input value={newPodcastCategory} onChange={e => setNewPodcastCategory(e.target.value)}
                    className="w-full px-4 py-3 border-[1.5px] border-[#2a2a2a] rounded-xl text-sm text-white bg-[#121212] focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="e.g. Music, Comedy, News…" />
                </div>
                <CoverArtPicker coverPreview={coverPreview} coverFile={coverFile} onCoverChange={onCoverChange} label="Show Cover" />
              </div>
            )}

            {/* Episode audio */}
            <div {...episodeDropzone.getRootProps()}
              className={cn('border-[2.5px] border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all bg-[#181818]',
                episodeDropzone.isDragActive ? 'border-blue-500 bg-blue-950/30' : 'border-[#3a3a3a] hover:border-blue-400 hover:bg-blue-950/20',
              )}>
              <input {...episodeDropzone.getInputProps()} />
              {episodeAudioFile ? (
                <div className="flex items-center justify-center gap-2 text-white">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-semibold">{episodeAudioFile.name}</span>
                </div>
              ) : (
                <>
                  <Mic2 className="w-8 h-8 text-[#717171] mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white mb-1">Drop episode audio, or click to browse</p>
                  <p className="text-xs text-[#717171]">MP3, WAV, FLAC, AAC, M4A — up to {MAX_AUDIO_MB}MB</p>
                </>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2">Episode Title</label>
              <input value={episodeTitle} onChange={e => setEpisodeTitle(e.target.value)}
                className="w-full px-4 py-3 border-[1.5px] border-[#2a2a2a] rounded-xl text-sm text-white bg-[#181818] focus:outline-none focus:border-blue-500 transition-all"
                placeholder="Episode title…" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2">Show Notes</label>
              <textarea value={episodeDescription} onChange={e => setEpisodeDescription(e.target.value)} rows={4}
                className="w-full px-4 py-3 border-[1.5px] border-[#2a2a2a] rounded-xl text-sm text-white bg-[#181818] focus:outline-none focus:border-blue-500 transition-all resize-none"
                placeholder="What's this episode about?" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2">Episode Number <span className="text-[#555] normal-case font-normal">(optional)</span></label>
              <input type="number" min={1} value={episodeNumber} onChange={e => setEpisodeNumber(e.target.value)}
                className="w-full px-4 py-3 border-[1.5px] border-[#2a2a2a] rounded-xl text-sm text-white bg-[#181818] focus:outline-none focus:border-blue-500 transition-all"
                placeholder="e.g. 12" />
            </div>

            <SchedulerField
              scheduled={episodeScheduled} onToggle={() => setEpisodeScheduled(s => !s)}
              date={episodeReleaseDate} onDate={setEpisodeReleaseDate}
              label="Episode Release Date & Time" />

            {uploading && <ProgressBar progress={progress} label={progressLabel} />}

            <div className="sticky bottom-0 pt-3 pb-1 bg-[#121212]">
              <button type="button" onClick={onSubmitPodcast} disabled={uploading}
                className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-60">
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Mic2 className="w-4 h-4" /> {episodeScheduled ? 'Schedule Episode' : 'Publish Episode'}</>}
              </button>
            </div>
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
          <button key={g} type="button" onClick={() => onSelect(g)}
            className={cn('px-4 py-1.5 rounded-full border-[1.5px] text-sm font-semibold transition-all',
              selected === g ? 'bg-white border-white text-black' : 'bg-transparent border-[#3a3a3a] text-[#b3b3b3] hover:border-blue-400'
            )}>
            {g}
          </button>
        ))}
      </div>
    </div>
  )
}

function CoverArtPicker({ coverPreview, coverFile, onCoverChange, label = 'Cover Art (Optional)' }: {
  coverPreview: string | null; coverFile: File | null; onCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label?: string
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-[#b3b3b3] uppercase tracking-[.7px] mb-2">{label}</label>
      <label className="flex items-center gap-3 bg-[#181818] border-[1.5px] border-[#2a2a2a] rounded-xl p-3 cursor-pointer hover:border-blue-400 transition-all">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#282828] flex-shrink-0 grid place-items-center">
          {coverPreview ? <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" /> : <Image className="w-5 h-5 text-[#717171]" />}
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
      <div className="flex justify-between text-xs text-[#b3b3b3] mb-1"><span>{label}</span><span>{progress}%</span></div>
      <div className="w-full h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
