import PublicPageShell from '@/components/public/PublicPageShell'
import { Eyebrow, PageTitle, H2, P, Ul } from '@/components/public/LegalContent'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Copyright Policy · Playback' }

export default function CopyrightPolicyPage() {
  return (
    <PublicPageShell>
      <Eyebrow>Legal</Eyebrow>
      <PageTitle>Copyright Policy</PageTitle>

      <P>Playback respects the intellectual property rights of artists, labels, producers, and copyright owners. Artists may only upload music they own or are legally authorized to distribute.</P>

      <H2>Copyright infringement includes</H2>
      <Ul items={[
        "Uploading another artist's music without permission",
        'Uploading remixes without authorization',
        'Using copyrighted cover art without permission',
        'Uploading leaked or stolen recordings',
      ]} />

      <H2>Playback may</H2>
      <Ul items={['Remove infringing content', 'Suspend accounts', 'Permanently ban repeat offenders']} />

      <P>Users who believe their work has been copied without permission may submit a copyright complaint — see our <a href="/legal/dmca" style={{ color: '#60a5fa' }}>DMCA Notice</a> for how to file one.</P>
    </PublicPageShell>
  )
}
