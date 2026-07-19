import PublicPageShell from '@/components/public/PublicPageShell'
import { Eyebrow, PageTitle, Lead, H2, P, Ul } from '@/components/public/LegalContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Artist Help · Playback',
  description: 'Everything you need to succeed on Playback.',
}

export default function ArtistHelpPage() {
  return (
    <PublicPageShell>
      <Eyebrow>For Artists</Eyebrow>
      <PageTitle>Everything you need to succeed on Playback</PageTitle>
      <Lead>
        Welcome to the Playback Artist Help Center. Whether you're uploading your first single or managing a full catalog, we're here to help you make the most of the platform.
      </Lead>

      <H2>Getting Started</H2>
      <P>Create an artist account to:</P>
      <Ul items={[
        'Upload your music',
        'Customize your artist profile',
        'Build your fanbase',
        'Track your performance',
        'Earn royalties from your music',
      ]} />

      <H2>Uploading Music</H2>
      <P>Before uploading, make sure you have:</P>
      <Ul items={[
        'Your audio file (MP3, WAV, or FLAC)',
        'Album or single artwork (minimum 3000 × 3000 pixels recommended)',
        'Song title',
        'Artist name',
        'Featured artists (if applicable)',
        'Producer and songwriter credits',
        'Genre and subgenre',
        'Lyrics (optional but recommended)',
        'Release date',
        'ISRC code (optional if supported)',
      ]} />
    </PublicPageShell>
  )
}
