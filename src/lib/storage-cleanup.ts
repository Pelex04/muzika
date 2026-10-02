import { deleteB2Objects } from '@/lib/b2'

// Album/podcast deletes remove several tracks' audio at once, and those
// tracks can be split across both storage providers (older ones on
// Supabase, newer ones on B2). `admin` is any Supabase client with
// storage access (service-role).
export async function deleteTrackAudioFiles(
  admin: { storage: { from: (bucket: string) => { remove: (paths: string[]) => Promise<unknown> } } },
  tracks: Array<{ audio_path?: string | null; audio_storage?: string | null }>
): Promise<void> {
  const supabasePaths = tracks
    .filter(t => t.audio_path && t.audio_storage !== 'b2')
    .map(t => t.audio_path as string)
  const b2Paths = tracks
    .filter(t => t.audio_path && t.audio_storage === 'b2')
    .map(t => t.audio_path as string)

  await Promise.all([
    supabasePaths.length ? admin.storage.from('tracks').remove(supabasePaths) : Promise.resolve(),
    b2Paths.length ? deleteB2Objects(b2Paths) : Promise.resolve(),
  ])
}
