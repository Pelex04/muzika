import PublicPageShell from '@/components/public/PublicPageShell'
import { Eyebrow, PageTitle, Lead, H2, P, Ul } from '@/components/public/LegalContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analytics · Playback',
  description: 'Understand your audience. Grow your career.',
}

export default function AnalyticsPage() {
  return (
    <PublicPageShell>
      <Eyebrow>For Artists</Eyebrow>
      <PageTitle>Understand your audience. Grow your career.</PageTitle>
      <Lead>Playback Analytics provides real-time insights into how your music is performing.</Lead>

      <H2>Track Your Performance</H2>
      <P>See detailed statistics for:</P>
      <Ul items={['Total Streams', 'Monthly Listeners', 'Followers', 'Downloads', 'Playlist Adds', 'Likes', 'Shares', 'Comments']} />

      <H2>Audience Insights</H2>
      <P>Learn more about your fans:</P>
      <Ul items={['Top Countries', 'Top Cities', 'Age Groups (where available)', 'Gender (where available)', 'Devices Used', 'Listening Times']} />

      <H2>Song Performance</H2>
      <P>View performance for each release:</P>
      <Ul items={['Daily Streams', 'Weekly Streams', 'Monthly Streams', 'Lifetime Streams', 'Skip Rate', 'Completion Rate', 'Average Listening Time']} />

      <H2>Playlist Performance</H2>
      <P>See which playlists are driving your success:</P>
      <Ul items={['Editorial Playlists', 'User Playlists', 'Trending Playlists', 'Genre Playlists']} />

      <H2>Revenue Analytics</H2>
      <P>Track your earnings with:</P>
      <Ul items={['Estimated Royalties', 'Paid Royalties', 'Pending Royalties', 'Monthly Revenue', 'Revenue by Song', 'Revenue by Country']} />

      <H2>Growth Tools</H2>
      <P>Playback Analytics helps you:</P>
      <Ul items={[
        'Identify your fastest-growing songs',
        'Discover where your fans are located',
        'Measure the success of new releases',
        'Plan tours and promotional campaigns',
        'Understand listener behavior',
      ]} />
    </PublicPageShell>
  )
}
