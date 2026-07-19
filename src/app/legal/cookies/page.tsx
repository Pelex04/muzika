import PublicPageShell from '@/components/public/PublicPageShell'
import { Eyebrow, PageTitle, H2, P, Ul } from '@/components/public/LegalContent'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Cookie Policy · Playback' }

export default function CookiePolicyPage() {
  return (
    <PublicPageShell>
      <Eyebrow>Legal</Eyebrow>
      <PageTitle>Cookie Policy</PageTitle>

      <P>Playback uses cookies and similar technologies to improve your experience.</P>

      <H2>What Are Cookies?</H2>
      <P>Cookies are small files stored on your device that help websites remember information about your visit.</P>

      <H2>Why We Use Cookies</H2>
      <P>We use cookies to:</P>
      <Ul items={[
        'Keep you signed in',
        'Remember your preferences',
        'Improve website performance',
        'Analyze platform usage',
        'Recommend music based on listening habits',
        'Protect accounts from unauthorized access',
      ]} />

      <H2>Managing Cookies</H2>
      <P>You can disable cookies through your browser settings. Some features of Playback may not function properly if cookies are disabled.</P>
    </PublicPageShell>
  )
}
