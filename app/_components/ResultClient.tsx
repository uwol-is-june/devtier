'use client'

import { useState } from 'react'
import { Orbitron, Space_Grotesk } from 'next/font/google'
import ParticleCanvas from './ParticleCanvas'
import { STYLES } from '../_styles/home'
import { TierIcon } from '@/components/TierIcon'
import { ScoreCounter } from '@/components/ScoreCounter'
import { BadgeCopy } from '@/components/BadgeCopy'
import { ShareButtons } from '@/components/ShareButtons'
import { TierCardDownload } from '@/components/TierCardDownload'
import { AchievementGrid } from '@/components/AchievementGrid'
import { StatTooltip } from '@/components/StatTooltip'
import { ScoreHistoryChart } from '@/components/ScoreHistoryChart'
import type { ScoreData } from '@/lib/getScoreData'

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-orbitron',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

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

type Props = {
  username: string
  data: ScoreData | null
  loggedInId: string | undefined
}

export function ResultClient({ username, data, loggedInId }: Props) {
  const rootClass = `${orbitron.variable} ${spaceGrotesk.variable}`
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements'>('stats')

  if (!data) {
    return (
      <div
        className={rootClass}
        style={{ minHeight: '100vh', background: '#000', color: '#e6edf3', position: 'relative', overflowX: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      >
        <style>{STYLES}</style>
        <ParticleCanvas style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }} />
        <nav className="cyber-nav">
          <a href="/" className="nav-logo">DEVTIER</a>
        </nav>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '2rem' }}>
          <div className="glitch-wrap" style={{ marginBottom: '1.5rem' }}>
            <h1
              className="glitch-title"
              style={{ color: '#FF4655', fontSize: 'clamp(3rem, 10vw, 5rem)', animation: 'none', textShadow: '0 0 24px #FF465588' }}
            >
              404
            </h1>
            <span className="glitch-layer glitch-layer-1" aria-hidden="true" style={{ color: '#FF4655', fontSize: 'clamp(3rem, 10vw, 5rem)' }}>404</span>
            <span className="glitch-layer glitch-layer-2" aria-hidden="true" style={{ color: '#FF4655', fontSize: 'clamp(3rem, 10vw, 5rem)' }}>404</span>
          </div>
          <p style={{ fontFamily: 'var(--font-orbitron), monospace', fontSize: '0.65rem', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.38)', marginBottom: '0.75rem' }}>
            USER_NOT_FOUND
          </p>
          <p style={{ fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', marginBottom: '2.5rem' }}>
            <span style={{ color: '#7CFF5B', fontFamily: 'Courier New, monospace' }}>{username}</span>
            {' '}— GitHub 아이디를 확인해주세요.
          </p>
          <a href="/" className="btn-primary">← BACK TO HOME</a>
        </div>
      </div>
    )
  }

  const tierColor = TIER_COLOR[data.tier] ?? '#C0C0C0'
  const tierLabel = TIER_LABEL[data.tier] ?? data.tier
  const fullTierLabel = data.tier_rank ? `${tierLabel} ${data.tier_rank}` : tierLabel
  const isOwn = loggedInId === data.github_id

  const currentYear = new Date().getFullYear()
  const stats = [
    { key: 'TOTAL_CONTRIBUTIONS',  label: '총 잔디 수',       value: data.details.total_contributions.toLocaleString('ko-KR'),  tooltip: '최근 1년(365일) GitHub contribution 총합. 전투력 점수에 ×1 가중치.' },
    { key: 'CURRENT_STREAK',       label: '현재 스트릭',      value: `${data.details.current_streak}일`,                        tooltip: '오늘 기준 연속으로 커밋한 날수. 가중치 ×3으로 모든 지표 중 가장 높음.' },
    { key: 'LONGEST_STREAK',       label: '최대 스트릭',      value: `${data.details.longest_streak}일`,                        tooltip: '역대 최장 연속 커밋 기록. 가중치 ×2.' },
    { key: 'CONTRIBUTION_DENSITY', label: '잔디 밀도',        value: `${(data.details.contribution_density * 100).toFixed(1)}%`, tooltip: '365일 중 커밋한 날의 비율 (0~100%). 가중치 ×100.' },
    { key: 'PEAK_INTENSITY',       label: '피크 강도',        value: `${data.details.peak_intensity}/일`,                       tooltip: '하루에 가장 많이 커밋한 횟수. 가중치 ×0.5.' },
    { key: 'TOTAL_STARS',          label: '레포 스타',        value: data.details.total_stars.toLocaleString('ko-KR'),           tooltip: '본인 소유 레포 스타 합계 (최대 100개 레포). log2(n+1)×10 스케일.' },
    { key: 'CURRENT_YEAR_COMMITS', label: `${currentYear}년 커밋`, value: `${data.details.current_year_commits.toLocaleString('ko-KR')}회`, tooltip: `${currentYear}년 1월 1일부터 현재까지의 커밋 수. 가중치 ×0.5.` },
    { key: 'TOTAL_PRS',            label: '총 PR',            value: `${data.details.total_prs.toLocaleString('ko-KR')}개`,     tooltip: '최근 1년 Pull Request 수. 커밋 대비 고가치 지표, 가중치 ×3.' },
    { key: 'TOTAL_ISSUES',         label: '총 이슈',          value: `${data.details.total_issues.toLocaleString('ko-KR')}개`,  tooltip: '최근 1년 Issue 수. 오픈소스 참여 지표, 가중치 ×1.' },
  ]

  const LANG_COLORS = ['#7CFF5B', '#56C8D8', '#FFD700', '#FF4655', '#5AC9A6']

  return (
    <div
      className={rootClass}
      style={{ minHeight: '100vh', background: '#000', color: '#e6edf3', position: 'relative', overflowX: 'hidden' }}
    >
      <style>{STYLES}</style>
      <ParticleCanvas style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }} />

      {/* ── Nav ── */}
      <nav className="cyber-nav">
        <a href="/" className="nav-logo">← DEVTIER</a>
        <ul className="nav-links">
          <li>
            <a
              href={`https://github.com/${data.github_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              {data.github_id}
            </a>
          </li>
        </ul>
      </nav>

      {/* ── Main ── */}
      <main style={{ position: 'relative', zIndex: 1, maxWidth: '640px', margin: '0 auto', padding: '7rem 1.5rem 6rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* ── Tier Hero ── */}
        <section
          id="tier-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            padding: '2.5rem',
            background: 'rgba(0,0,0,0.72)',
            border: `1.5px solid ${tierColor}`,
            borderRadius: '8px',
            backdropFilter: 'blur(14px)',
            boxShadow: `0 0 24px ${tierColor}2a, 0 0 60px ${tierColor}0d`,
          }}
        >
          <div className="glitch-wrap">
            <h1
              className="glitch-title"
              style={{ color: tierColor, fontSize: 'clamp(2rem, 7vw, 3.5rem)', animation: 'none', textShadow: `0 0 18px ${tierColor}88` }}
            >
              {fullTierLabel}
            </h1>
            <span className="glitch-layer glitch-layer-1" aria-hidden="true" style={{ color: tierColor, fontSize: 'clamp(2rem, 7vw, 3.5rem)' }}>
              {fullTierLabel}
            </span>
            <span className="glitch-layer glitch-layer-2" aria-hidden="true" style={{ color: tierColor, fontSize: 'clamp(2rem, 7vw, 3.5rem)' }}>
              {fullTierLabel}
            </span>
          </div>

          {data.tier !== 'challenger' && data.tier_rank && (
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', marginTop: '0.3rem' }}>
              RANK {data.tier_rank} / 4 &nbsp;·&nbsp; 1이 최고 등급
            </div>
          )}

          <TierIcon tier={data.tier} size={80} />

          <a
            href={`https://github.com/${data.github_id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: '0.45rem', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#7CFF5B')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          >
            <svg height="14" width="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            {data.github_id}
          </a>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-orbitron), monospace', fontSize: '0.52rem', letterSpacing: '0.28em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem' }}>
              COMBAT POWER
            </div>
            <div style={{ fontFamily: 'var(--font-orbitron), monospace', fontSize: 'clamp(2.4rem, 8vw, 3.8rem)', fontWeight: 900, color: tierColor, textShadow: `0 0 20px ${tierColor}66`, letterSpacing: '-0.02em' }}>
              <ScoreCounter target={data.score} />
            </div>
            <div style={{ fontFamily: 'var(--font-orbitron), monospace', fontSize: '0.52rem', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.3)', marginTop: '0.3rem' }}>
              점
            </div>
            {data.next_tier_gap !== null && (
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.5rem' }}>
                ▲ {data.next_tier_label}까지 {data.next_tier_gap.toLocaleString('ko-KR')}점
              </div>
            )}
          </div>

          {data.percentile !== null && (
            <div
              className="status-badge"
              style={{ borderColor: `${tierColor}44`, background: `${tierColor}0a`, color: tierColor }}
            >
              <span className="status-dot" style={{ background: tierColor, animation: 'none', boxShadow: `0 0 6px ${tierColor}` }} />
              상위 {data.percentile.toFixed(1)}%
              {data.total_users !== null && (
                <span style={{ opacity: 0.5, fontSize: '0.5rem' }}>
                  {' '}(총 {data.total_users.toLocaleString('ko-KR')}명)
                </span>
              )}
            </div>
          )}
        </section>

        {/* ── Stats / Achievements ── */}
        <div className="stat-panel">
          <div className="stat-panel-header" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
            {(['stats', 'achievements'] as const).map((tab) => {
              const label = tab === 'stats' ? 'COMBAT_STATS' : 'ACHIEVEMENTS'
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    fontFamily: 'var(--font-orbitron), monospace',
                    fontSize: '0.58rem',
                    letterSpacing: '0.22em',
                    color: isActive ? '#7CFF5B' : 'rgba(255,255,255,0.28)',
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? '1px solid #7CFF5B' : '1px solid transparent',
                    paddingBottom: '0.6rem',
                    cursor: 'pointer',
                    marginRight: '1.5rem',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
          <div style={{ borderBottom: '1px solid rgba(124,255,91,0.07)', marginBottom: '1.25rem' }} />
          {activeTab === 'stats' && (
            <>
              {stats.map(stat => (
                <div key={stat.key} className="stat-row">
                  <div className="stat-key">{stat.key} <StatTooltip text={stat.tooltip} /></div>
                  <div className="stat-val">{stat.value}</div>
                </div>
              ))}
              {data.details.top_languages.length > 0 && (
                <div style={{ marginTop: '1.25rem' }}>
                  <div style={{ fontFamily: 'var(--font-orbitron), monospace', fontSize: '0.5rem', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.28)', marginBottom: '0.6rem' }}>
                    TOP_LANGUAGES
                  </div>
                  <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', gap: '1px' }}>
                    {data.details.top_languages.map((lang, i) => (
                      <div
                        key={lang.name}
                        style={{ width: `${lang.pct}%`, background: LANG_COLORS[i % LANG_COLORS.length], borderRadius: '2px' }}
                        title={`${lang.name} ${lang.pct.toFixed(1)}%`}
                      />
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', marginTop: '0.5rem' }}>
                    {data.details.top_languages.map((lang, i) => (
                      <span key={lang.name} style={{ fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: LANG_COLORS[i % LANG_COLORS.length] }} />
                        {lang.name} {lang.pct.toFixed(1)}%
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          {activeTab === 'achievements' && <AchievementGrid username={data.github_id} />}
        </div>

        {/* ── Score History ── */}
        <ScoreHistoryChart username={data.github_id} />

        {/* ── Badge (본인만) ── */}
        {isOwn && (
          <div className="terminal" style={{ maxWidth: 'none' }}>
            <div className="terminal-bar">
              <span className="t-dot t-dot-r" />
              <span className="t-dot t-dot-y" />
              <span className="t-dot t-dot-g" />
              <span className="terminal-title">badge.md — README 뱃지</span>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <BadgeCopy username={data.github_id} />
            </div>
          </div>
        )}

        {/* ── Download + Share ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <TierCardDownload username={data.github_id} />
          <ShareButtons
            username={data.github_id}
            score={data.score}
            tierLabel={fullTierLabel}
            percentile={data.percentile}
            isOwn={isOwn}
          />
        </div>

      </main>
    </div>
  )
}
