import PublicPageShell from '@/components/public/PublicPageShell'
import { Eyebrow, PageTitle, Lead, H2, P, Ul } from '@/components/public/LegalContent'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Community Guidelines · Playback' }

export default function CommunityGuidelinesPage() {
  return (
    <PublicPageShell>
      <Eyebrow>Legal</Eyebrow>
      <PageTitle>Community Guidelines</PageTitle>
      <Lead>Playback is built to support artists, creators, and music fans. We ask everyone to treat others with respect.</Lead>

      <H2>Be Respectful</H2>
      <P>Do not:</P>
      <Ul items={['Harass other users', 'Bully or threaten others', 'Impersonate artists or other users']} />

      <H2>Upload Only Content You Own</H2>
      <P>Only upload music, artwork, podcasts, or other content that you own or have permission to distribute.</P>

      <H2>No Fake Activity</H2>
      <P>Do not:</P>
      <Ul items={['Buy fake streams', 'Use bots or automated software', 'Artificially inflate plays, likes, or followers']} />
      <P>Violation may result in removal of streams, suspension, or permanent account termination.</P>

      <H2>No Illegal Content</H2>
      <P>Do not upload content that:</P>
      <Ul items={['Promotes terrorism', 'Encourages violence', 'Contains child exploitation', 'Contains malware or harmful software', 'Violates applicable laws']} />

      <H2>Adult Content</H2>
      <P>Explicit music may be allowed if properly labeled, but pornographic or sexually explicit visual content is prohibited.</P>

      <H2>Artist Verification</H2>
      <P>Do not attempt to obtain a verification badge by providing false or misleading information.</P>

      <H2>Reporting</H2>
      <P>If you encounter abusive behavior or content that violates these guidelines, you can report it directly through Playback or contact our support team.</P>

      <H2>Enforcement</H2>
      <P>Playback may:</P>
      <Ul items={['Remove content', 'Restrict features', 'Suspend accounts', 'Permanently ban users who repeatedly violate these guidelines']} />

      <P>Our goal is to create a trusted platform where artists can share their music and listeners can discover it safely and fairly.</P>
    </PublicPageShell>
  )
}
