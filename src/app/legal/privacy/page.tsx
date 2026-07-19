import PublicPageShell from '@/components/public/PublicPageShell'
import { Eyebrow, PageTitle, Meta, H2, P, Ul } from '@/components/public/LegalContent'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy · Playback' }

export default function PrivacyPolicyPage() {
  return (
    <PublicPageShell>
      <Eyebrow>Legal</Eyebrow>
      <PageTitle>Privacy Policy</PageTitle>
      <Meta>Last Updated: July 2026</Meta>

      <P>
        At Playback, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your information when you use our website, mobile app, and related services.
      </P>

      <H2>Information We Collect</H2>
      <P>When you use Playback, we may collect:</P>
      <Ul items={[
        'Your name and username', 'Email address', 'Profile photo', 'Password (encrypted)',
        'Country and language', 'Music uploads and artwork', 'Listening history',
        'Playlists and favorites', 'Followers and following', 'Device information', 'IP address and browser information',
      ]} />

      <H2>How We Use Your Information</H2>
      <P>We use your information to:</P>
      <Ul items={[
        'Create and manage your account',
        'Stream and deliver music',
        'Recommend songs, artists, and playlists',
        'Process artist verification',
        'Display your public artist profile',
        'Improve our platform and services',
        'Detect fraud, spam, or fake streams',
        'Send important account updates',
      ]} />

      <H2>Music Uploads</H2>
      <P>Artists retain ownership of the music they upload. By uploading content to Playback, you grant us permission to host, stream, and display your music on our platform in accordance with our Terms of Service.</P>

      <H2>Cookies</H2>
      <P>Playback uses cookies and similar technologies to improve your browsing experience, remember your preferences, and analyze website traffic.</P>

      <H2>Data Security</H2>
      <P>We use industry-standard security measures to protect your personal information. However, no online service can guarantee 100% security.</P>

      <H2>Third-Party Services</H2>
      <P>Playback may integrate with third-party services such as payment providers, analytics tools, or social media platforms. These services have their own privacy policies.</P>

      <H2>Children's Privacy</H2>
      <P>Playback is not intended for children under the age of 13. We do not knowingly collect personal information from children.</P>

      <H2>Your Rights</H2>
      <P>You can:</P>
      <Ul items={[
        'Update your profile information',
        'Change your password',
        'Delete your account',
        'Request a copy of your personal data',
        'Contact us with privacy-related questions',
      ]} />

      <H2>Changes to This Policy</H2>
      <P>We may update this Privacy Policy from time to time. Any changes will be posted on this page with the updated revision date.</P>

      <H2>Contact Us</H2>
      <P>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:playbackcharts@gmail.com" style={{ color: '#60a5fa' }}>playbackcharts@gmail.com</a>.</P>
    </PublicPageShell>
  )
}
