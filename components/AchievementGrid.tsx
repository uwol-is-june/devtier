'use client'

import { useEffect, useState, useRef } from 'react'

type Category = 'all' | 'activity' | 'tier' | 'pattern' | 'social'

const CATEGORY_LABELS: Record<Category, string> = {
  all:      '전체',
  activity: '잔디',
  tier:     '티어',
  pattern:  '패턴',
  social:   '소셜',
}

const RARITY_COLOR: Record<string, string> = {
  common:    '#8b949e',
  rare:      '#58a6ff',
  epic:      '#a371f7',
  legendary: '#FFD700',
}

const RARITY_LABEL: Record<string, string> = {
  common:    'Common',
  rare:      'Rare',
  epic:      'Epic',
  legendary: 'Legendary',
}

type AchievementItem = {
  id: string
  category: string
  name_ko: string
  description: string
  rarity: string
  icon: string
  unlocked: boolean
  unlocked_at: string | null
  progress: { current: number; target: number; display: string } | null
}

function AchievementTooltip({ description, percentage }: { description: string; percentage?: number }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!visible) return
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setVisible(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [visible])

  return (
    <span ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible(v => !v)}
        className="flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-bold leading-none cursor-pointer select-none"
        style={{ background: 'var(--border)', color: 'var(--text-sub)' }}
        aria-label="설명 보기"
      >
        ?
      </button>
      {visible && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-10 w-max max-w-[200px] px-2.5 py-1.5 rounded text-xs leading-snug pointer-events-none"
          style={{
            background: '#21262d',
            border: '1px solid var(--border)',
            color: 'var(--text-sub)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          <span className="block">{description}</span>
          {percentage !== undefined && (
            <span className="block mt-1" style={{ color: '#8b949e' }}>
              전체 유저의 {percentage.toFixed(1)}%가 보유
            </span>
          )}
          <span
            className="absolute top-full left-1/2 -translate-x-1/2"
            style={{
              width: 0, height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid #30363d',
            }}
          />
        </span>
      )}
    </span>
  )
}

function AchievementCard({
  item,
  percentage,
}: {
  item: AchievementItem
  percentage?: number
}) {
  const color = RARITY_COLOR[item.rarity] ?? '#8b949e'
  const progressPct =
    item.progress
      ? Math.min(100, Math.round((item.progress.current / item.progress.target) * 100))
      : 0

  if (item.unlocked) {
    return (
      <div
        className="rounded-md p-4 flex flex-col gap-2"
        style={{
          background: 'var(--surface)',
          border: `1px solid ${color}`,
          boxShadow: `0 0 8px 1px color-mix(in srgb, ${color} 20%, transparent)`,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xl leading-none">{item.icon}</span>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
            style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
          >
            {RARITY_LABEL[item.rarity]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-base font-semibold text-[var(--text)] leading-tight">{item.name_ko}</span>
          <AchievementTooltip description={item.description} percentage={percentage} />
        </div>
        {item.unlocked_at && (
          <span className="text-xs" style={{ color: '#8b949e' }}>
            {new Date(item.unlocked_at).toLocaleDateString('ko-KR')} 달성
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className="rounded-md p-4 flex flex-col gap-2"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        opacity: 0.6,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xl leading-none grayscale">🔒</span>
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
          style={{ background: 'var(--border)', color: 'var(--text-sub)' }}
        >
          {RARITY_LABEL[item.rarity]}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-base font-semibold text-[var(--text-sub)] leading-tight">{item.name_ko}</span>
        <AchievementTooltip description={item.description} percentage={percentage} />
      </div>
      {item.progress && (
        <div className="flex flex-col gap-1 mt-0.5">
          <div className="flex justify-between text-xs" style={{ color: '#8b949e' }}>
            <span>{item.progress.display}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full h-1 rounded-full" style={{ background: 'var(--border)' }}>
            <div
              className="h-1 rounded-full"
              style={{ width: `${progressPct}%`, background: '#58a6ff' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export function AchievementGrid({ username }: { username: string }) {
  const [achievements, setAchievements] = useState<AchievementItem[]>([])
  const [statsMap, setStatsMap] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Category>('all')

  useEffect(() => {
    Promise.all([
      fetch(`/api/achievements/${username}`).then(r => r.json()),
      fetch('/api/achievements/stats').then(r => r.json()),
    ]).then(([achData, statsData]) => {
      setAchievements(achData.achievements ?? [])
      const map: Record<string, number> = {}
      for (const s of statsData.stats ?? []) {
        map[s.achievement_id] = s.percentage
      }
      setStatsMap(map)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [username])

  const filtered = tab === 'all' ? achievements : achievements.filter(a => a.category === tab)
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const total = achievements.length

  return (
    <section className="w-full max-w-lg mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs text-[var(--text-sub)] uppercase tracking-widest">도전과제</h2>
        {!loading && (
          <span className="text-xs font-mono" style={{ color: '#8b949e' }}>
            {unlockedCount} / {total}
          </span>
        )}
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setTab(cat)}
            className="px-3 py-1 rounded text-xs font-medium transition-colors"
            style={
              tab === cat
                ? { background: '#58a6ff', color: '#0d1117' }
                : { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-sub)' }
            }
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* 그리드 */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-md p-4 h-28 animate-pulse"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[var(--text-sub)] text-center py-8">해당 카테고리 도전과제가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {filtered.map(item => (
            <AchievementCard
              key={item.id}
              item={item}
              percentage={statsMap[item.id]}
            />
          ))}
        </div>
      )}
    </section>
  )
}
