import { BadgeCopy } from '@/components/BadgeCopy'
import { ScoreCounter } from '@/components/ScoreCounter'
import { TierIcon } from '@/components/TierIcon'

const TIER_LABEL: Record<string, string> = {
  challenger: '챌린저',
  diamond:    '다이아',
  platinum:   '플래티넘',
  gold:       '골드',
  silver:     '실버',
  bronze:     '브론즈',
}

const TIER_COLOR: Record<string, string> = {
  challenger: '#FF4655',
  diamond:    '#56C8D8',
  platinum:   '#5AC9A6',
  gold:       '#FFD700',
  silver:     '#C0C0C0',
  bronze:     '#CD7F32',
}

type ScoreData = {
  github_id: string
  score: number
  tier: string
  tier_rank: number | null
  percentile: number | null
  details: {
    total_contributions: number
    current_streak: number
    longest_streak: number
    contribution_density: number
    peak_intensity: number
  }
}

async function fetchScore(username: string): Promise<ScoreData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/score/${encodeURIComponent(username)}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const data = await fetchScore(username)

  if (!data) {
    return (
      <main className="flex flex-col items-center justify-center flex-1 gap-6 px-4">
        <div className="animate-fade-in-up text-center">
          <p className="text-4xl mb-4">😵</p>
          <h1 className="text-xl font-semibold text-[var(--text)] mb-2">유저를 찾을 수 없습니다</h1>
          <p className="text-[var(--text-sub)] text-sm mb-6">
            <span className="font-mono text-[var(--text)]">{username}</span> — GitHub 아이디를 확인해주세요.
          </p>
          <a
            href="/"
            className="px-5 py-2.5 rounded-md text-sm font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:border-[#58a6ff] transition-colors"
          >
            ← 돌아가기
          </a>
        </div>
      </main>
    )
  }

  const tierColor = TIER_COLOR[data.tier] ?? '#C0C0C0'
  const tierLabel = TIER_LABEL[data.tier] ?? data.tier
  const fullTierLabel = data.tier_rank ? `${tierLabel} ${data.tier_rank}` : tierLabel
  const isChallenger = data.tier === 'challenger'

  const stats = [
    { label: '총 잔디 수',     value: `${data.details.total_contributions.toLocaleString('ko-KR')} 개` },
    { label: '현재 스트릭',   value: `${data.details.current_streak} 일` },
    { label: '최대 스트릭',   value: `${data.details.longest_streak} 일` },
    { label: '잔디 밀도',     value: `${(data.details.contribution_density * 100).toFixed(1)}%` },
    { label: '피크 강도',     value: `${data.details.peak_intensity} 개/일` },
  ]

  return (
    <main className="flex flex-col items-center w-full px-4 pb-24 pt-12">
      {/* ── Back ── */}
      <div className="w-full max-w-lg mb-8 animate-fade-in-up">
        <a
          href="/"
          className="text-sm text-[var(--text-sub)] hover:text-[var(--text)] transition-colors"
        >
          ← 돌아가기
        </a>
      </div>

      {/* ── Tier Card ── */}
      <section
        className="w-full max-w-lg rounded-lg p-8 flex flex-col items-center gap-6 mb-8 animate-fade-in-up"
        style={{
          background: 'var(--surface)',
          border: `1px solid ${tierColor}`,
          boxShadow: isChallenger
            ? `0 0 0 1px ${tierColor}, 0 0 32px 4px color-mix(in srgb, ${tierColor} 25%, transparent)`
            : `0 0 16px 2px color-mix(in srgb, ${tierColor} 15%, transparent)`,
          animation: isChallenger ? 'border-pulse 2s ease-in-out infinite' : undefined,
        }}
      >
        {/* 아이콘 */}
        <TierIcon tier={data.tier} size={80} />

        {/* 티어명 */}
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: tierColor }}>
            {fullTierLabel}
          </div>
          <div className="text-[var(--text-sub)] text-sm mt-1 font-mono">
            {data.github_id}
          </div>
        </div>

        {/* 전투력 점수 */}
        <div className="text-center">
          <div className="text-xs text-[var(--text-sub)] uppercase tracking-widest mb-1">전투력</div>
          <div className="text-5xl font-bold font-mono" style={{ color: tierColor }}>
            <ScoreCounter target={data.score} />
          </div>
          <div className="text-sm text-[var(--text-sub)] mt-1">점</div>
        </div>

        {/* 백분위 */}
        {data.percentile !== null && (
          <div
            className="px-4 py-2 rounded-full text-sm"
            style={{
              background: `color-mix(in srgb, ${tierColor} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${tierColor} 40%, transparent)`,
              color: tierColor,
            }}
          >
            수집된 한국 개발자 상위 {data.percentile.toFixed(1)}%
          </div>
        )}
      </section>

      {/* ── Stats Grid ── */}
      <section className="w-full max-w-lg mb-8">
        <h2 className="text-xs text-[var(--text-sub)] uppercase tracking-widest mb-4">세부 지표</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`rounded-md p-4 flex flex-col gap-1 animate-fade-in-up stagger-${i + 1}`}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="text-xs text-[var(--text-sub)]">{stat.label}</div>
              <div className="text-lg font-semibold font-mono text-[var(--text)]">{stat.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Badge Copy ── */}
      <section className="w-full max-w-lg animate-fade-in-up stagger-6">
        <h2 className="text-xs text-[var(--text-sub)] uppercase tracking-widest mb-4">뱃지</h2>
        <BadgeCopy username={data.github_id} />
      </section>
    </main>
  )
}
