import PublicPageShell from '@/components/public/PublicPageShell'
import { Eyebrow, PageTitle, Lead, H2, TagRow } from '@/components/public/LegalContent'
import { Newspaper } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Newsroom · Playback',
  description: "Stay up to date with the latest announcements, platform updates, and news from Playback.",
}

const CATEGORIES = ['Platform Updates', 'Product Announcements', 'Artist Spotlight', 'Music Industry News', 'New Features', 'Success Stories', 'Press Releases', 'Community Events']

const UPCOMING = [
  'Playback launches Podcasts across Africa',
  'Artist Verification is now available',
  'Playback reaches 100,000 registered users',
  'Introducing Editorial Playlists',
  'Top 10 Most Streamed Songs This Week',
  'How Playback calculates streams',
  'New Dashboard Analytics for Artists',
  'Tips to Grow Your Audience on Playback',
]

export default function NewsroomPage() {
  return (
    <PublicPageShell>
      <Eyebrow>Company</Eyebrow>
      <PageTitle>Playback Newsroom</PageTitle>
      <Lead>
        Stay up to date with the latest announcements, platform updates, artist success stories, new features, partnerships, and industry news. Learn what's happening at Playback and discover how we're helping artists reach more listeners every day.
      </Lead>

      <H2>Categories</H2>
      <TagRow items={CATEGORIES} />

      <H2>Coming Soon</H2>
      <p style={{ color: '#717171', fontSize: '13px', marginBottom: '16px' }}>
        We're just getting started — here's a preview of the kind of stories you'll find here soon.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {UPCOMING.map(title => (
          <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#161616', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '14px 16px' }}>
            <Newspaper size={15} color="#3b82f6" style={{ flexShrink: 0 }} />
            <p style={{ color: '#b3b3b3', fontSize: '13px', fontWeight: 600, margin: 0 }}>{title}</p>
          </div>
        ))}
      </div>
    </PublicPageShell>
  )
}
