import { create } from 'zustand'
import { Howl } from 'howler'
import type { Track } from '@/types'
import { fetchStreamUrl, setCachedUrl } from '@/lib/stream-cache'

// The OS media notification (and lock screen player) is controlled by the
// Web Media Session API, not by Howler/the <audio> element directly. Without
// this, the browser falls back to showing the page title ("Playback Music")
// and generic controls instead of the actual track.
function updateMediaSessionMetadata(track: Track) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist?.stage_name ?? 'Playback Music',
    album: track.album?.title ?? '',
    artwork: track.cover_url
      ? [
          { src: track.cover_url, sizes: '96x96', type: 'image/png' },
          { src: track.cover_url, sizes: '256x256', type: 'image/png' },
          { src: track.cover_url, sizes: '512x512', type: 'image/png' },
        ]
      : [],
  })
}

function setMediaSessionPlaybackState(state: 'playing' | 'paused') {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
  navigator.mediaSession.playbackState = state
}

interface PlayerStore {
  currentTrack: Track | null
  queue: Track[]
  queueIndex: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  shuffle: boolean
  repeat: 'none' | 'one' | 'all'
  isLoading: boolean
  _howl: Howl | null
  _playCountTimer: ReturnType<typeof setTimeout> | null

  play: (track: Track, queue?: Track[]) => void
  pause: () => void
  resume: () => void
  togglePlay: () => void
  next: () => Promise<void>
  prev: () => Promise<void>
  playQueueItem: (index: number) => Promise<void>
  seek: (time: number) => void
  setVolume: (vol: number) => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  setCurrentTime: (t: number) => void
  setDuration: (d: number) => void
  setIsLoading: (v: boolean) => void
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  shuffle: false,
  repeat: 'none',
  isLoading: false,
  _howl: null,
  _playCountTimer: null,

  play: (track, queue) => {
    const state = get()
    if (state._howl) state._howl.unload()

    const queueList = queue ?? [track]
    const idx = queueList.findIndex(t => t.id === track.id)

    set({
      isLoading: true,
      currentTrack: track,
      queue: queueList,
      queueIndex: idx < 0 ? 0 : idx,
      currentTime: 0,
      duration: 0,
    })

    // Cache the URL we already have so future plays are instant
    if (track.audio_url) {
      setCachedUrl(track.id, track.audio_url)
    }

    // Prefetch next track in queue silently
    const nextIdx = (idx < 0 ? 0 : idx) + 1
    if (queueList[nextIdx]) {
      import('@/lib/stream-cache').then(({ prefetchStreamUrl }) => {
        prefetchStreamUrl(queueList[nextIdx].id)
      })
    }

    const howl = new Howl({
      src: [track.audio_url!],
      html5: true,
      volume: state.volume,
      onload: () => {
        set({ duration: howl.duration(), isLoading: false })
        if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
          navigator.mediaSession.setPositionState({
            duration: howl.duration(),
            playbackRate: 1,
            position: 0,
          })
        }
      },
      onplay: () => { set({ isPlaying: true }); setMediaSessionPlaybackState('playing') },
      onpause: () => { set({ isPlaying: false }); setMediaSessionPlaybackState('paused') },
      onend: () => {
        const { repeat, next } = get()
        if (repeat === 'one') { howl.seek(0); howl.play() }
        else next()
      },
      onloaderror: () => set({ isLoading: false }),
    })

    updateMediaSessionMetadata(track)
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => get().resume())
      navigator.mediaSession.setActionHandler('pause', () => get().pause())
      navigator.mediaSession.setActionHandler('previoustrack', () => get().prev())
      navigator.mediaSession.setActionHandler('nexttrack', () => get().next())
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime != null) get().seek(details.seekTime)
      })
    }

    const tick = () => {
      if (howl.playing()) set({ currentTime: howl.seek() as number })
      if (get().currentTrack?.id === track.id) requestAnimationFrame(tick)
    }

    howl.play()
    requestAnimationFrame(tick)

    // 30-second play count
    const prevTimer = get()._playCountTimer
    if (prevTimer) clearTimeout(prevTimer)
    const playCountTimer = setTimeout(async () => {
      try { await fetch(`/api/tracks/${track.id}/play`, { method: 'POST' }) } catch {}
    }, 30_000)

    set({ _howl: howl, _playCountTimer: playCountTimer })
  },

  pause: () => { get()._howl?.pause(); set({ isPlaying: false }) },
  resume: () => { get()._howl?.play(); set({ isPlaying: true }) },
  togglePlay: () => { const { isPlaying, pause, resume } = get(); isPlaying ? pause() : resume() },

  next: async () => {
    const { queue, queueIndex, shuffle, repeat, playQueueItem } = get()
    if (!queue.length) return
    let nextIdx: number
    if (shuffle) nextIdx = Math.floor(Math.random() * queue.length)
    else {
      nextIdx = queueIndex + 1
      if (nextIdx >= queue.length) {
        if (repeat === 'all') nextIdx = 0
        else { set({ isPlaying: false }); return }
      }
    }
    await playQueueItem(nextIdx)
  },

  prev: async () => {
    const { currentTime, queueIndex, playQueueItem, seek } = get()
    if (currentTime > 3) { seek(0); return }
    await playQueueItem(Math.max(0, queueIndex - 1))
  },

  playQueueItem: async (index: number) => {
    const { queue, play, setIsLoading } = get()
    const track = queue[index]
    if (!track) return

    setIsLoading(true)
    // fetchStreamUrl returns cached URL instantly if available
    const url = await fetchStreamUrl(track.id)
    if (!url) { setIsLoading(false); return }
    play({ ...track, audio_url: url }, queue)
  },

  seek: (time) => {
    const { _howl, duration } = get()
    if (_howl) {
      _howl.seek(time)
      set({ currentTime: time })
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.setPositionState({ duration, playbackRate: 1, position: time })
      }
    }
  },

  setVolume: (vol) => { get()._howl?.volume(vol); set({ volume: vol }) },
  toggleShuffle: () => set(s => ({ shuffle: !s.shuffle })),
  cycleRepeat: () => set(s => ({
    repeat: s.repeat === 'none' ? 'all' : s.repeat === 'all' ? 'one' : 'none'
  })),
  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setIsLoading: (v) => set({ isLoading: v }),
}))
