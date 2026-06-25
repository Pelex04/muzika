import { create } from 'zustand'
import { Howl } from 'howler'
import type { Track } from '@/types'

interface PlayerStore {
  // State
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

  // Internal howl instance
  _howl: Howl | null

  // Actions
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

  play: (track, queue) => {
    const state = get()

    // Destroy existing howl
    if (state._howl) {
      state._howl.unload()
    }

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

    const howl = new Howl({
      src: [track.audio_url!],
      html5: true,
      volume: state.volume,
      onload: () => {
        set({ duration: howl.duration(), isLoading: false })
      },
      onplay: () => set({ isPlaying: true }),
      onpause: () => set({ isPlaying: false }),
      onend: () => {
        const { repeat, next } = get()
        if (repeat === 'one') {
          howl.seek(0)
          howl.play()
        } else {
          next()
        }
      },
      onseek: () => {},
    })

    // Tick current time
    const tick = () => {
      if (howl.playing()) {
        set({ currentTime: howl.seek() as number })
      }
      if (get().currentTrack?.id === track.id) {
        requestAnimationFrame(tick)
      }
    }

    howl.play()
    requestAnimationFrame(tick)
    set({ _howl: howl })
  },

  pause: () => {
    get()._howl?.pause()
    set({ isPlaying: false })
  },

  resume: () => {
    get()._howl?.play()
    set({ isPlaying: true })
  },

  togglePlay: () => {
    const { isPlaying, pause, resume } = get()
    isPlaying ? pause() : resume()
  },

  next: async () => {
    const { queue, queueIndex, shuffle, repeat, playQueueItem } = get()
    if (!queue.length) return

    let nextIdx: number
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length)
    } else {
      nextIdx = queueIndex + 1
      if (nextIdx >= queue.length) {
        if (repeat === 'all') nextIdx = 0
        else { set({ isPlaying: false }); return }
      }
    }
    await playQueueItem(nextIdx)
  },

  prev: async () => {
    const { queue, queueIndex, currentTime, playQueueItem, seek } = get()
    if (currentTime > 3) { seek(0); return }
    const prevIdx = Math.max(0, queueIndex - 1)
    await playQueueItem(prevIdx)
  },

  // Advances to a specific position in the queue and fetches a FRESH
  // signed audio URL before playing it. This matters because tracks
  // sitting in the queue array never carry a usable audio_url -- only
  // the track the user directly clicked gets one injected (by the
  // calling UI code, right before play()). next()/prev() previously
  // called play(queue[idx], queue) directly, reusing that stale queue
  // object with no audio_url -- Howler would get src: [undefined],
  // never fire onload, and just sit there. The title (currentTrack)
  // had already updated by then, so visually it looked like the song
  // changed but the audio/progress just froze on whatever the last
  // working track left behind.
  playQueueItem: async (index: number) => {
    const { queue, play, setIsLoading } = get()
    const track = queue[index]
    if (!track) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/tracks/${track.id}/stream`)
      const data = await res.json()
      if (!data.url) { setIsLoading(false); return }
      play({ ...track, audio_url: data.url }, queue)
    } catch {
      setIsLoading(false)
    }
  },

  seek: (time) => {
    const { _howl } = get()
    if (_howl) {
      _howl.seek(time)
      set({ currentTime: time })
    }
  },

  setVolume: (vol) => {
    get()._howl?.volume(vol)
    set({ volume: vol })
  },

  toggleShuffle: () => set(s => ({ shuffle: !s.shuffle })),

  cycleRepeat: () => set(s => ({
    repeat: s.repeat === 'none' ? 'all' : s.repeat === 'all' ? 'one' : 'none'
  })),

  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setIsLoading: (v) => set({ isLoading: v }),
}))
