'use client'

import Link from 'next/link'
import { Home, Users, Music, Disc, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/discover', label: 'Home',    icon: Home },
  { href: '/artists',  label: 'Artists', icon: Users },
  { href: '/songs',    label: 'Songs',   icon: Music },
  { href: '/charts',   label: 'Albums',  icon: Disc },
  { href: '/blog',     label: 'Blog',    icon: FileText },
]

export default function QuickNav({ active }: { active: string }) {
  return (
    <div className="flex gap-3.5 mb-7 overflow-x-auto pb-1 scrollbar-none">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = label.toLowerCase() === active
        return (
          <Link key={href} href={href} className="flex flex-col items-center gap-1.5 min-w-[62px]">
            <div className={cn(
              'w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all border-2',
              isActive
                ? 'bg-[#0D1B3E] text-white border-blue-500'
                : 'bg-[#ECEEF5] text-[#5C677D] border-transparent hover:bg-[#E2E5F0]'
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <span className={cn(
              'text-[11px] font-semibold whitespace-nowrap',
              isActive ? 'text-[#0D1B3E] font-bold' : 'text-[#5C677D]'
            )}>{label}</span>
          </Link>
        )
      })}
    </div>
  )
}
