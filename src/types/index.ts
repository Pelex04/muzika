// ─────────────────────────────────────────────────────────
//  PLAYBACK — Core Types
// ─────────────────────────────────────────────────────────

export type UserRole = 'listener' | 'artist' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string
  username: string
  avatar_url: string | null
  role: UserRole
  bio: string | null
  location: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Artist {
  id: string
  profile_id: string
  stage_name: string
  genre: string
  location: string
  bio: string | null
  avatar_url: string | null
  cover_url: string | null
  verified: boolean
  follower_count: number
  track_count: number
  creator_type?: 'artist' | 'podcast_creator'
  created_at: string
  // joined from profile
  profile?: Profile
  // client-side state
  is_following?: boolean
}

export type TrackGenre = 'Afropop' | 'Gospel' | 'Hip-Hop' | 'Reggae' | 'RnB' | 'Jazz' | 'Traditional' | 'Amapiano'

export interface Track {
  id: string
  artist_id: string
  title: string
  genre: TrackGenre
  cover_url: string | null
  audio_url: string | null       // signed URL (private bucket)
  audio_path: string             // storage path
  duration_seconds: number
  price_mwk: number              // price in MWK (e.g. 800)
  play_count: number
  download_count: number
  published: boolean
  album_id?: string | null
  track_number?: number | null
  content_type?: 'track' | 'podcast_episode'
  podcast_id?: string | null
  episode_number?: number | null
  created_at: string
  updated_at: string
  // joined
  artist?: Artist
  album?: Album
  // client-side
  is_purchased?: boolean
  is_saved?: boolean
}

export interface Album {
  id: string
  artist_id: string
  title: string
  cover_url: string | null
  genre: TrackGenre
  release_type?: 'album' | 'ep'
  published: boolean
  created_at: string
  updated_at: string
  // joined
  artist?: Artist
  tracks?: Track[]
  track_count?: number
}

export interface Purchase {
  id: string
  user_id: string
  track_id: string
  amount_mwk: number
  platform_fee_mwk: number
  artist_payout_mwk: number
  payment_reference: string
  payment_status: 'pending' | 'completed' | 'failed'
  created_at: string
  track?: Track
}

export interface SavedTrack {
  id: string
  user_id: string
  track_id: string
  created_at: string
  track?: Track
}

export interface ArtistFollow {
  id: string
  user_id: string
  artist_id: string
  created_at: string
}

export interface Playlist {
  id: string
  user_id: string
  name: string
  description: string | null
  cover_url: string | null
  is_public: boolean
  created_at: string
  updated_at: string
  // joined
  track_count?: number
  tracks?: Track[]
}

export interface PlaylistTrack {
  id: string
  playlist_id: string
  track_id: string
  position: number
  added_at: string
  track?: Track
}

export type BlogCategory = 'news' | 'artist_blog' | 'interview'

export interface BlogPost {
  id: string
  author_id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_url: string | null
  category: BlogCategory
  published: boolean
  view_count: number
  created_at: string
  updated_at: string
  // joined
  author?: Profile
}

// ─── Player ───────────────────────────────────────────────
export interface PlayerState {
  currentTrack: Track | null
  queue: Track[]
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  shuffle: boolean
  repeat: 'none' | 'one' | 'all'
}

// ─── API Response wrappers ────────────────────────────────
export interface ApiSuccess<T> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─── Supabase DB schema helper ────────────────────────────
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      artists: { Row: Artist; Insert: Partial<Artist>; Update: Partial<Artist> }
      tracks: { Row: Track; Insert: Partial<Track>; Update: Partial<Track> }
      albums: { Row: Album; Insert: Partial<Album>; Update: Partial<Album> }
      purchases: { Row: Purchase; Insert: Partial<Purchase>; Update: Partial<Purchase> }
      saved_tracks: { Row: SavedTrack; Insert: Partial<SavedTrack>; Update: Partial<SavedTrack> }
      artist_follows: { Row: ArtistFollow; Insert: Partial<ArtistFollow>; Update: Partial<ArtistFollow> }
      blog_posts: { Row: BlogPost; Insert: Partial<BlogPost>; Update: Partial<BlogPost> }
    }
  }
}
