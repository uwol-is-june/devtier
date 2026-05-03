import type { Metadata } from 'next'
import { TierIcon } from '@/components/TierIcon'

export const metadata: Metadata = {
  title: 'DevTier란? — 서비스 소개',
  description:
    'DevTier 서비스 소개, 티어 구조, 전투력 점수 계산 공식, GitHub 뱃지 사용법을 안내합니다.',
}

const TIER_DATA = [
  { tier: 'challenger', label: '챌린저',   color: '#FF4655', ranksLabel: null,    criteria: '상위 100명 (절대)' },
  { tier: 'diamond',    label: '다이아',   color: '#56C8D8', ranksLabel: '1 – 4', criteria: '상위 1 ~ 5%' },
  { tier: 'platinum',   label: '플래티넘', color: '#5AC9A6', ranksLabel: '1 – 4', criteria: '상위 5 ~ 15%' },
  { tier: 'gold',       label: '골드',     color: '#FFD700', ranksLabel: '1 – 4', criteria: '상위 15 ~ 30%' },
  { tier: 'silver',     label: '실버',     color: '#C0C0C0', ranksLabel: '1 – 4', criteria: '상위 30 ~ 50%' },
  { tier: 'bronze',     label: '브론즈',   color: '#CD7F32', ranksLabel: '1 – 4', criteria: '상위 50 ~ 100%' },
]

const SCORE_FACTORS = [
  { formula: '총 잔디 수',    weight: '× 1',   note: '최근 1년 GitHub contribution 총 개수' },
  { formula: '현재 스트릭',   weight: '× 3',   note: '오늘 기준 연속 커밋 일수 (가장 큰 비중)' },
  { formula: '최대 스트릭',   weight: '× 2',   note: '역대 최장 연속 커밋 기록' },
  { formula: '잔디 밀도 (%)', weight: '× 100', note: '365일 중 커밋이 있는 날의 비율 (0~100)' },
  { formula: '피크 강도',     weight: '× 0.5', note: '하루 최대 커밋 수' },
]

export default function AboutPage() {
  return (
    <main className="flex flex-col items-center w-full px-4 pb-24 pt-6 sm:pt-12">

      {/* ── Back link ── */}
      <div className="w-full max-w-2xl mb-8 animate-fade-in-up">
        <a
          href="/"
          className="text-sm text-[#8b949e] hover:text-[#e6edf3] transition-colors"
        >
          ← 돌아가기
        </a>
      </div>

      {/* ── Hero ── */}
      <section className="w-full max-w-2xl mb-12 animate-fade-in-up">
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs w-fit mb-6"
          style={{ border: '1px solid var(--border)', color: 'var(--text-sub)' }}
        >
          서비스 소개
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          <span
            className="animate-gradient-shift"
            style={{
              backgroundImage: 'linear-gradient(135deg, #e6edf3 0%, #58a6ff 40%, #bc8cff 70%, #e6edf3 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              backgroundSize: '200% 200%',
            }}
          >
            DevTier란?
          </span>
        </h1>
        <p className="text-base leading-relaxed max-w-lg" style={{ color: 'var(--text-sub)' }}>
          GitHub 잔디(contribution) 데이터를 분석해 한국 개발자의{' '}
          <strong style={{ color: 'var(--text)' }}>전투력 점수</strong>를 산출하고
          티어를 부여하는 서비스입니다.{' '}
          GitHub location이{' '}
          <strong style={{ color: 'var(--text)' }}>South Korea</strong>로 설정된
          개발자들 사이에서 상대적 백분위를 계산합니다.
        </p>
      </section>

      {/* ── Tier table ── */}
      <section className="w-full max-w-2xl mb-12 animate-fade-in-up stagger-2">
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: 'var(--text-sub)' }}
        >
          티어 구조
        </h2>
        <div
          className="rounded-md overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left text-xs uppercase tracking-wider"
                style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-sub)' }}
              >
                <th className="px-4 py-3">티어</th>
                <th className="px-4 py-3">이름</th>
                <th className="px-4 py-3">서브 랭크</th>
                <th className="px-4 py-3 text-right">기준</th>
              </tr>
            </thead>
            <tbody>
              {TIER_DATA.map((row, i) => (
                <tr
                  key={row.tier}
                  style={{
                    borderBottom: i < TIER_DATA.length - 1 ? '1px solid var(--border)' : undefined,
                  }}
                >
                  <td className="px-4 py-3">
                    <TierIcon tier={row.tier} size={28} />
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: row.color }}>
                    {row.label}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-sub)' }}>
                    {row.ranksLabel ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm" style={{ color: 'var(--text-sub)' }}>
                    {row.criteria}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-sub)' }}>
          * 티어 내 숫자가 낮을수록 높은 등급 (1이 최고, 4가 최저)
        </p>
      </section>

      {/* ── Score formula ── */}
      <section className="w-full max-w-2xl mb-12 animate-fade-in-up stagger-3">
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: 'var(--text-sub)' }}
        >
          전투력 점수 계산 공식
        </h2>
        <div
          className="rounded-md px-5 py-4 mb-4 font-mono text-sm leading-relaxed overflow-x-auto"
          style={{ background: '#0d1117', border: '1px solid var(--border)' }}
        >
          <span style={{ color: 'var(--text)' }}>전투력 = </span>
          <span style={{ color: '#58a6ff' }}>총잔디</span>
          <span style={{ color: 'var(--text-sub)' }}> × 1  +  </span>
          <span style={{ color: '#3fb950' }}>현재스트릭</span>
          <span style={{ color: 'var(--text-sub)' }}> × 3  +  </span>
          <span style={{ color: '#56C8D8' }}>최대스트릭</span>
          <span style={{ color: 'var(--text-sub)' }}> × 2  +  </span>
          <span style={{ color: '#5AC9A6' }}>잔디밀도(%)</span>
          <span style={{ color: 'var(--text-sub)' }}> × 100  +  </span>
          <span style={{ color: '#FFD700' }}>피크강도</span>
          <span style={{ color: 'var(--text-sub)' }}> × 0.5</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SCORE_FACTORS.map((f) => (
            <div
              key={f.formula}
              className="rounded-md p-4 flex flex-col gap-1"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-sub)' }}>{f.formula}</span>
                <span className="text-xs font-mono font-semibold" style={{ color: '#58a6ff' }}>{f.weight}</span>
              </div>
              <p className="text-xs leading-snug" style={{ color: 'var(--text-sub)' }}>{f.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Badge usage ── */}
      <section className="w-full max-w-2xl mb-12 animate-fade-in-up stagger-4">
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: 'var(--text-sub)' }}
        >
          뱃지 사용법
        </h2>
        <div
          className="rounded-md p-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm mb-3" style={{ color: 'var(--text-sub)' }}>
            GitHub README에 아래 마크다운을 붙여넣으면 자동으로 현재 티어 뱃지가 표시됩니다.
          </p>
          <div
            className="rounded px-4 py-3 font-mono text-xs overflow-x-auto"
            style={{ background: '#0d1117', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            {'![DevTier](https://devtier.dev/api/badge/깃헙아이디)'}
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--text-sub)' }}>
            <code
              className="px-1.5 py-0.5 rounded font-mono"
              style={{
                color: '#58a6ff',
                background: 'color-mix(in srgb, #58a6ff 10%, transparent)',
              }}
            >
              깃헙아이디
            </code>
            {' '}부분을 본인의 GitHub 아이디로 교체하세요.
            뱃지는 실시간으로 최신 티어 정보를 반영합니다.
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-sub)' }}>
            * GitHub location을 한국(South Korea)으로 설정한 유저 기준 백분위입니다.
          </p>
        </div>
      </section>

      {/* ── Back to home CTA ── */}
      <section className="animate-fade-in-up stagger-5">
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all duration-200"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
        >
          홈으로 돌아가기 →
        </a>
      </section>

    </main>
  )
}
