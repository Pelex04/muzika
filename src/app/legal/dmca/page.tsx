import PublicPageShell from '@/components/public/PublicPageShell'
import { Eyebrow, PageTitle, H2, P, Ul } from '@/components/public/LegalContent'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'DMCA Notice · Playback' }

export default function DMCAPage() {
  return (
    <PublicPageShell>
      <Eyebrow>Legal</Eyebrow>
      <PageTitle>DMCA Notice</PageTitle>

      <P>Playback complies with the Digital Millennium Copyright Act (DMCA) and responds promptly to valid copyright complaints.</P>

      <H2>If you believe content on Playback infringes your copyright, please send a DMCA notice including</H2>
      <Ul items={[
        'Your full legal name',
        'Contact information',
        'Description of the copyrighted work',
        'Link to the infringing content',
        'A statement that you believe the use is unauthorized',
        'A statement that the information is accurate',
        'Your physical or electronic signature',
      ]} />

      <P>Send notices to: <a href="mailto:playbackcharts@gmail.com" style={{ color: '#60a5fa' }}>playbackcharts@gmail.com</a></P>

      <P>Playback may remove the reported content while the complaint is reviewed. Users who repeatedly infringe copyrights may have their accounts permanently terminated.</P>
    </PublicPageShell>
  )
}
