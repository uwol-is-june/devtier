'use client'

import { useState } from 'react'
import { StatTooltip } from '@/components/StatTooltip'
import { AchievementGrid } from '@/components/AchievementGrid'

type Stat = {
  label: string
  value: string
  tip: string
}

type Tab = 'stats' | 'achievements'

export function StatsTabs({ stats, username }: { stats: Stat[]; username: string }) {
  const [active, setActive] = useState<Tab>('stats')

  return (
    <section className="w-full max-w-lg mb-8">
      {/* 탭 헤더 */}
      <div
        className="flex mb-4 rounded-md overflow-hidden"
        style={{ border: '1px solid var(--border)' }}
      >
        {(['stats', 'achievements'] as Tab[]).map((tab) => {
          const label = tab === 'stats' ? '세부 지표' : '도전과제'
          const isActive = active === tab
          return (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className="flex-1 py-2 text-sm font-medium transition-colors"
              style={{
                background: isActive ? 'var(--surface)' : 'transparent',
                color: isActive ? 'var(--text)' : 'var(--text-sub)',
                borderBottom: isActive ? '2px solid #58a6ff' : '2px solid transparent',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* 탭 콘텐츠 */}
      {active === 'stats' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`rounded-md p-4 flex flex-col gap-1 animate-fade-in-up stagger-${i + 1}`}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-1 text-xs text-[var(--text-sub)]">
                {stat.label}
                <StatTooltip text={stat.tip} />
              </div>
              <div className="text-lg font-semibold font-mono text-[var(--text)]">{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {active === 'achievements' && <AchievementGrid username={username} />}
    </section>
  )
}
