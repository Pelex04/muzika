import PublicPageShell from '@/components/public/PublicPageShell'
import { Eyebrow, PageTitle, Lead, H2, P, Ul } from '@/components/public/LegalContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Royalties & Payments · Playback',
  description: 'How Playback royalties work.',
}

export default function RoyaltiesPage() {
  return (
    <PublicPageShell>
      <Eyebrow>For Artists</Eyebrow>
      <PageTitle>How Playback Royalties Work</PageTitle>
      <Lead>
        Playback pays eligible artists based on qualified streams, downloads, and other approved revenue sources. Royalties may come from:
      </Lead>
      <Ul items={['Paid downloads', 'Subscription revenue', 'Advertising revenue', 'Promotional campaigns', 'Future monetization programs introduced by Playback']} />

      <P>The amount earned depends on factors such as:</P>
      <Ul items={['Total qualified streams', 'Listener location', 'Subscription type', 'Advertising revenue', 'Revenue-sharing agreements']} />

      <H2>Qualified Streams</H2>
      <P>Only legitimate streams count toward royalty payments. Streams may not qualify if they involve:</P>
      <Ul items={['Bots or automated software', 'Artificial streaming', 'Repeated plays intended to manipulate statistics', 'Fraudulent activity']} />
      <P>Playback actively monitors streaming activity to protect artists and ensure fair payouts.</P>

      <H2>Payment Schedule</H2>
      <P>Eligible artists are paid on a monthly basis, provided they meet the minimum payout threshold. Payments are processed through supported payment providers available in your country.</P>

      <H2>Payment Methods</H2>
      <P>Depending on your location, Playback may support:</P>
      <Ul items={['Bank Transfer', 'PayPal', 'Mobile Money', 'Airtel Money', 'TNM Mpamba', 'Other supported payment services']} />

      <H2>Tax Information</H2>
      <P>Artists are responsible for complying with the tax laws applicable in their country.</P>

      <H2>Royalty Dashboard</H2>
      <P>Your dashboard shows:</P>
      <Ul items={['Total Streams', 'Qualified Streams', 'Downloads', 'Estimated Earnings', 'Paid Earnings', 'Pending Payments', 'Payment History']} />
    </PublicPageShell>
  )
}
