'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Orbitron, Space_Grotesk } from 'next/font/google'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import ParticleCanvas from '@/app/_components/ParticleCanvas'
import { STYLES } from '@/app/_styles/home'
import { TierIcon } from '@/components/TierIcon'
import { ScoreCounter } from '@/components/ScoreCounter'
import { LangToggle } from '@/components/LangToggle'
import { useT } from '@/context/LangContext'
import type { ScoreData, WeaknessPercentile } from '@/lib/getScoreData'

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'], variable: '--font-orbitron', display: 'swap' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-space-grotesk', display: 'swap' })

const TIER_COLOR: Record<string, string> = {
  challenger: '#FF4655',
  diamond:    '#56C8D8',
  platinum:   '#5AC9A6',
  gold:       '#FFD700',
  silver:     '#C0C0C0',
  bronze:     '#CD7F32',
}

type Props = {
  user1: string
  user2: string
  data1: ScoreData | null
  data2: ScoreData | null
  weakness1: WeaknessPercentile[]
  weakness2: WeaknessPercentile[]
}

type StatKey = 'total_contributions' | 'current_streak' | 'longest_streak' | 'contribution_density' | 'peak_intensity' | 'total_stars' | 'total_prs' | 'total_issues'

const STAT_KEYS: StatKey[] = [
  'total_contributions',
  'current_streak',
  'longest_streak',
  'contribution_density',
  'peak_intensity',
  'total_stars',
  'total_prs',
  'total_issues',
]

function getStatValue(key: StatKey, d: ScoreData): number {
  if (key === 'contribution_density') return d.details.contribution_density
  return d.details[key] as number
}

const COMPARE_STYLES = `
  @media (max-width: 600px) {
    .compare-hero { grid-template-columns: 1fr !important; }
    .compare-vs-center { order: -1; flex-direction: row !important; gap: 0.5rem !important; }
  }
`

export function CompareClient({ user1, user2, data1, data2, weakness1, weakness2 }: Props) {
  const rootClass = `${orbitron.variable} ${spaceGrotesk.variable}`
  const { t, locale } = useT()
  const localeStr = locale === 'ko' ? 'ko-KR' : 'en-US'
  const router = useRouter()
  const [compareInput, setCompareInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [radarMounted, setRadarMounted] = useState(false)

  useEffect(() => { setRadarMounted(true) }, [])

  const color1 = TIER_COLOR[data1?.tier ?? ''] ?? '#C0C0C0'
  const color2 = TIER_COLOR[data2?.tier ?? ''] ?? '#C0C0C0'

  const winner: 'user1' | 'user2' | 'draw' | null = data1 && data2
    ? (data1.score > data2.score ? 'user1' : data2.score > data1.score ? 'user2' : 'draw')
    : null
  const gap = data1 && data2 ? Math.abs(data1.score - data2.score) : 0

  const tierLabel = (d: ScoreData) =>
    (t.tier.labels[d.tier] ?? d.tier) + (d.tier_rank ? ` ${d.tier_rank}` : '')

  const formatStat = (key: StatKey, d: ScoreData): string => {
    switch (key) {
      case 'current_streak':
        return locale === 'ko' ? `${d.details.current_streak}일` : `${d.details.current_streak}d`
      case 'longest_streak':
        return locale === 'ko' ? `${d.details.longest_streak}일` : `${d.details.longest_streak}d`
      case 'contribution_density':
        return `${(d.details.contribution_density * 100).toFixed(1)}%`
      case 'peak_intensity':
        return locale === 'ko' ? `${d.details.peak_intensity}/일` : `${d.details.peak_intensity}/day`
      case 'total_prs':
      case 'total_issues':
        return locale === 'ko'
          ? `${d.details[key].toLocaleString(localeStr)}개`
          : d.details[key].toLocaleString(localeStr)
      default:
        return d.details[key as keyof typeof d.details] instanceof Array
          ? ''
          : (d.details[key as keyof typeof d.details] as number).toLocaleString(localeStr)
    }
  }

  // Radar chart data — merge both users' weakness arrays
  const radarData = (() => {
    const base = weakness1.length > 0 ? weakness1 : weakness2
    if (base.length === 0) return []
    return base.map(({ key }) => {
      const w1 = weakness1.find(d => d.key === key)
      const w2 = weakness2.find(d => d.key === key)
      return {
        label: t.stats[key]?.label() ?? key,
        pct1: w1?.pct ?? 0,
        pct2: w2?.pct ?? 0,
        fullMark: 100,
      }
    })
  })()

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault()
    const target = compareInput.trim()
    if (!target) return
    router.push(`/compare/${user1}/${target}`)
  }

  return (
    <div className={rootClass} style={{ minHeight: '100vh', background: '#000', color: '#e6edf3', position: 'relative', overflowX: 'hidden' }}>
      <style>{STYLES}</style>
      <style>{COMPARE_STYLES}</style>
      <ParticleCanvas style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }} />

      {/* Nav */}
      <nav className="cyber-nav">
        <a href="/" className="nav-logo">← DEVTIER</a>
        <ul className="nav-links">
          <li><LangToggle /></li>
        </ul>
      </nav>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '860px', margin: '0 auto', padding: '7rem 1.5rem 6rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* ── VS Hero ── */}
        <section
          className="compare-hero"
          style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'start' }}
        >
          <UserCard
            username={user1}
            data={data1}
            color={color1}
            tierLabel={data1 ? tierLabel(data1) : ''}
            isWinner={winner === 'user1'}
            localeStr={localeStr}
          />

          {/* Center */}
          <div
            className="compare-vs-center"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', paddingTop: '2.5rem', minWidth: '72px' }}
          >
            <div style={{
              fontFamily: "var(--font-orbitron), 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif",
              fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
              fontWeight: 900,
              color: '#FF4655',
              textShadow: '0 0 18px #FF465566',
              letterSpacing: '0.1em',
            }}>
              VS
            </div>
            {winner && data1 && data2 && (
              <div style={{ textAlign: 'center' }}>
                {winner === 'draw' ? (
                  <span style={{
                    fontFamily: "var(--font-orbitron), monospace",
                    fontSize: '0.7rem',
                    letterSpacing: '0.12em',
                    color: '#FFD700',
                    textShadow: '0 0 10px #FFD70066',
                  }}>
                    {t.compare.draw}
                  </span>
                ) : (
                  <span style={{
                    fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
                    fontSize: '0.78rem',
                    color: '#7CFF5B',
                    fontWeight: 600,
                  }}>
                    +{gap.toLocaleString(localeStr)}
                  </span>
                )}
              </div>
            )}
          </div>

          <UserCard
            username={user2}
            data={data2}
            color={color2}
            tierLabel={data2 ? tierLabel(data2) : ''}
            isWinner={winner === 'user2'}
            localeStr={localeStr}
          />
        </section>

        {/* Winner banner */}
        {winner && winner !== 'draw' && data1 && data2 && (
          <div style={{
            textAlign: 'center',
            fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.5)',
            padding: '0.6rem',
            background: 'rgba(124,255,91,0.04)',
            border: '1px solid rgba(124,255,91,0.12)',
            borderRadius: '6px',
          }}>
            {t.compare.winsBy(
              winner === 'user1' ? user1 : user2,
              gap.toLocaleString(localeStr)
            )}
          </div>
        )}

        {/* Stats comparison */}
        {data1 && data2 && (
          <div className="stat-panel">
            <div style={{
              fontFamily: "var(--font-orbitron), 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif",
              fontSize: '0.6rem',
              letterSpacing: '0.22em',
              color: 'rgba(255,255,255,0.28)',
              marginBottom: '1rem',
            }}>
              {t.compare.statsLabel}
            </div>

            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <div />
              <div style={{
                fontFamily: "var(--font-orbitron), monospace",
                fontSize: '0.6rem',
                letterSpacing: '0.08em',
                color: color1,
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>{user1}</div>
              <div style={{
                fontFamily: "var(--font-orbitron), monospace",
                fontSize: '0.6rem',
                letterSpacing: '0.08em',
                color: color2,
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>{user2}</div>
            </div>

            {STAT_KEYS.map((key) => {
              const v1 = getStatValue(key, data1)
              const v2 = getStatValue(key, data2)
              const u1Wins = v1 > v2
              const u2Wins = v2 > v1
              return (
                <div
                  key={key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr',
                    gap: '0.5rem',
                    alignItems: 'center',
                    padding: '0.4rem 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <div style={{
                    fontFamily: "var(--font-orbitron), 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif",
                    fontSize: '0.6rem',
                    letterSpacing: '0.08em',
                    color: 'rgba(255,255,255,0.35)',
                  }}>
                    {t.stats[key]?.label() ?? key}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
                    fontSize: '0.75rem',
                    color: u1Wins ? '#7CFF5B' : 'rgba(255,255,255,0.5)',
                    textAlign: 'center',
                    fontWeight: u1Wins ? 600 : 400,
                  }}>
                    {formatStat(key, data1)}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
                    fontSize: '0.75rem',
                    color: u2Wins ? '#7CFF5B' : 'rgba(255,255,255,0.5)',
                    textAlign: 'center',
                    fontWeight: u2Wins ? 600 : 400,
                  }}>
                    {formatStat(key, data2)}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Radar chart overlay */}
        {radarMounted && radarData.length > 0 && (
          <div className="stat-panel">
            <div style={{
              fontFamily: "var(--font-orbitron), 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif",
              fontSize: '0.6rem',
              letterSpacing: '0.22em',
              color: 'rgba(255,255,255,0.28)',
              marginBottom: '0.75rem',
            }}>
              {t.compare.radarTitle}
            </div>
            <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              {[{ label: user1, color: color1 }, { label: user2, color: color2 }].map(({ label, color }) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: "var(--font-orbitron), monospace", fontSize: '0.6rem', color }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '2px', background: color, borderRadius: '1px' }} />
                  {label}
                </span>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData} margin={{ top: 10, right: 28, bottom: 10, left: 28 }}>
                <PolarGrid stroke="rgba(48,54,61,0.9)" />
                <PolarAngleAxis
                  dataKey="label"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'var(--font-orbitron), monospace' }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="pct1" stroke={color1} fill={color1} fillOpacity={0.12} dot={false} />
                <Radar dataKey="pct2" stroke={color2} fill={color2} fillOpacity={0.12} dot={false} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Compare with different user */}
        <div className="stat-panel">
          <div style={{
            fontFamily: "var(--font-orbitron), 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif",
            fontSize: '0.5rem',
            letterSpacing: '0.22em',
            color: 'rgba(255,255,255,0.28)',
            marginBottom: '0.75rem',
          }}>
            COMPARE_WITH
          </div>
          <form onSubmit={handleCompare} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={compareInput}
              onChange={e => setCompareInput(e.target.value)}
              placeholder={t.compare.inputPlaceholder}
              style={{
                flex: 1,
                fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
                fontSize: '0.85rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '6px',
                padding: '0.55rem 0.85rem',
                color: '#e6edf3',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                fontFamily: "var(--font-orbitron), 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif",
                fontSize: '0.7rem',
                letterSpacing: '0.12em',
                color: '#7CFF5B',
                background: 'rgba(124,255,91,0.08)',
                border: '1px solid rgba(124,255,91,0.25)',
                borderRadius: '6px',
                padding: '0.55rem 1rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {t.compare.goBtn}
            </button>
          </form>
        </div>

        {/* Copy link */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleCopyLink}
            style={{
              fontFamily: "var(--font-orbitron), 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif",
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              color: copied ? '#7CFF5B' : 'rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${copied ? 'rgba(124,255,91,0.3)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '6px',
              padding: '0.65rem 1.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {copied ? t.compare.linkCopied : t.compare.copyLink}
          </button>
        </div>

      </main>
    </div>
  )
}

// ── UserCard ──────────────────────────────────────────────────────────────────

type UserCardProps = {
  username: string
  data: ScoreData | null
  color: string
  tierLabel: string
  isWinner: boolean
  localeStr: string
}

function UserCard({ username, data, color, tierLabel, isWinner, localeStr }: UserCardProps) {
  const { t } = useT()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1.5rem 1rem',
        background: 'rgba(0,0,0,0.72)',
        border: `1.5px solid ${data ? color : 'rgba(255,255,255,0.12)'}`,
        borderRadius: '8px',
        backdropFilter: 'blur(14px)',
        boxShadow: isWinner
          ? `0 0 24px ${color}3a, 0 0 60px ${color}14`
          : `0 0 12px ${color}14`,
        position: 'relative',
      }}
    >
      {isWinner && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "var(--font-orbitron), monospace",
          fontSize: '0.6rem',
          letterSpacing: '0.12em',
          color: '#7CFF5B',
          background: '#000',
          border: '1px solid rgba(124,255,91,0.3)',
          borderRadius: '3px',
          padding: '0.15rem 0.5rem',
          whiteSpace: 'nowrap',
        }}>
          WIN
        </div>
      )}

      <a
        href={`https://github.com/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: "var(--font-orbitron), 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif",
          fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)',
          letterSpacing: '0.08em',
          color: data ? color : 'rgba(255,255,255,0.4)',
          textDecoration: 'none',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {username}
      </a>

      {data ? (
        <>
          <TierIcon tier={data.tier} size={56} />
          <div style={{
            fontFamily: "var(--font-orbitron), 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif",
            fontSize: 'clamp(0.85rem, 2.5vw, 1.1rem)',
            fontWeight: 700,
            color,
            textShadow: `0 0 12px ${color}66`,
            textAlign: 'center',
          }}>
            {tierLabel}
          </div>
          <div style={{
            fontFamily: "var(--font-orbitron), 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif",
            fontSize: 'clamp(1.4rem, 4vw, 2rem)',
            fontWeight: 900,
            color,
            textShadow: `0 0 16px ${color}55`,
            letterSpacing: '-0.02em',
          }}>
            <ScoreCounter target={data.score} />
          </div>
          <div style={{
            fontFamily: "var(--font-orbitron), monospace",
            fontSize: '0.6rem',
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.25)',
          }}>
            {t.result.points}
          </div>
          {data.percentile !== null && (
            <div style={{
              fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
              fontSize: '0.78rem',
              color: 'rgba(255,255,255,0.4)',
              textAlign: 'center',
            }}>
              {t.result.topPercent(data.percentile.toFixed(1))}
            </div>
          )}
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem 0' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,70,85,0.5)" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6M9 9l6 6" />
          </svg>
          <div style={{
            fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
            fontSize: '0.75rem',
            color: 'rgba(255,70,85,0.7)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}>
            {t.compare.notFound}
          </div>
        </div>
      )}
    </div>
  )
}
