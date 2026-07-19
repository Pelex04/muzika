import PublicPageShell from '@/components/public/PublicPageShell'
import { Eyebrow, PageTitle, Lead, H2, Card } from '@/components/public/LegalContent'
import { Briefcase, Heart, Users2, GraduationCap, Globe2, Send } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Careers · Playback',
  description: 'Join the team building the future of music in Africa.',
}

const SECTIONS = [
  { icon: Briefcase, title: 'Open Positions', body: "We're not hiring for specific roles right now, but we're always open to hearing from people who want to help build Playback." },
  { icon: Heart, title: 'Why Work at Playback', body: 'Help empower independent artists across Malawi and beyond, and shape a platform still early in its journey.' },
  { icon: Users2, title: 'Company Culture', body: 'A small, close-knit team that cares about music, technology, and the artists we serve.' },
  { icon: GraduationCap, title: 'Internship Opportunities', body: "If you're a student or early-career and passionate about music tech, reach out — we're happy to talk." },
  { icon: Globe2, title: 'Remote Opportunities', body: 'Playback is built by people working from wherever they are.' },
  { icon: Send, title: 'Submit Your CV', body: 'Send your CV and a short note about what you\'d like to work on to playbackcharts@gmail.com.' },
]

export default function CareersPage() {
  return (
    <PublicPageShell>
      <Eyebrow>Company</Eyebrow>
      <PageTitle>Careers</PageTitle>
      <Lead>
        Join the team building the future of music in Africa. At Playback, we're creating a platform where artists can share their music with the world and fans can discover incredible talent. We're always looking for passionate people who love music, technology, design, marketing, and innovation — whether you're an engineer, designer, content specialist, marketer, or customer support professional, we'd love to hear from you. We believe great ideas come from diverse people working together to empower independent artists.
      </Lead>

      {SECTIONS.map(s => (
        <Card key={s.title}>
          <div style={{ display: 'flex', gap: '14px' }}>
            <s.icon size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>{s.title}</p>
              <p style={{ color: '#717171', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{s.body}</p>
            </div>
          </div>
        </Card>
      ))}

      <p style={{ color: '#555', fontSize: '13px', textAlign: 'center', marginTop: '12px' }}>
        Interested? Email us at <a href="mailto:playbackcharts@gmail.com" style={{ color: '#60a5fa' }}>playbackcharts@gmail.com</a>
      </p>
    </PublicPageShell>
  )
}
