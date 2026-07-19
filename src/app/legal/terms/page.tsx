import PublicPageShell from '@/components/public/PublicPageShell'
import { Eyebrow, PageTitle, Meta, H2, P, Ul } from '@/components/public/LegalContent'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service · Playback' }

export default function TermsPage() {
  return (
    <PublicPageShell>
      <Eyebrow>Legal</Eyebrow>
      <PageTitle>Terms of Service</PageTitle>
      <Meta>Last Updated: July 2026</Meta>

      <P>Welcome to Playback. By accessing or using our website, mobile application, or services, you agree to these Terms of Service. If you do not agree with these terms, please do not use Playback.</P>

      <H2>1. Eligibility</H2>
      <P>You must be at least 13 years old or the minimum legal age in your country to use Playback.</P>

      <H2>2. User Accounts</H2>
      <P>You are responsible for:</P>
      <Ul items={['Keeping your account information secure', 'Maintaining the confidentiality of your password', 'All activities that occur under your account']} />
      <P>Playback may suspend or terminate accounts that violate these Terms.</P>

      <H2>3. Music Uploads</H2>
      <P>Artists are responsible for ensuring they own or have permission to upload any music, artwork, videos, or other content. You must not upload content that:</P>
      <Ul items={['Infringes copyright', 'Contains illegal material', 'Promotes violence or terrorism', 'Contains hate speech', 'Contains malicious software']} />

      <H2>4. Ownership</H2>
      <P>Artists retain ownership of their music. By uploading content, you grant Playback a non-exclusive, worldwide license to host, stream, distribute, and display your content through our services.</P>

      <H2>5. Streaming</H2>
      <P>Playback provides music streaming and downloading according to the permissions granted by artists. Playback may remove content that violates these Terms.</P>

      <H2>6. Payments</H2>
      <P>If Playback offers paid downloads, subscriptions, or royalties, artists agree to our payment policies and revenue-sharing terms.</P>

      <H2>7. Account Suspension</H2>
      <P>Playback may suspend or permanently remove accounts that:</P>
      <Ul items={['Use fake streams', 'Use bots', 'Upload copyrighted content without permission', 'Abuse other users', 'Attempt to hack or interfere with the platform']} />

      <H2>8. Disclaimer</H2>
      <P>Playback is provided "as is." We do not guarantee uninterrupted or error-free service.</P>

      <H2>9. Changes</H2>
      <P>We may update these Terms at any time. Continued use of Playback means you accept the revised Terms.</P>
    </PublicPageShell>
  )
}
