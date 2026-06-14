import { redirect } from 'next/navigation'

export default function RootPage() {
  // Always redirect root to landing page
  // The proxy handles redirecting authed users from /landing to /discover
  redirect('/landing')
}
