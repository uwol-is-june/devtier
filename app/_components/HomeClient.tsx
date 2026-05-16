'use client'

import { useEffect, useRef, useState } from 'react'
import { Orbitron, Space_Grotesk } from 'next/font/google'
import ParticleCanvas from './ParticleCanvas'
import { STYLES } from '../_styles/home'
import { TierIcon } from '@/components/TierIcon'
import { LoginButton } from '@/components/LoginButton'
import { LogoutButton } from '@/components/LogoutButton'
import { RankingTable } from '@/components/RankingTable'

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

const FEATURES = [
  {
    num: '01',
    label: 'TIER_SYSTEM',
    title: '6티어 × 4단계 시스템',
    desc: '브론즈부터 챌린저까지, 각 티어는 1~4단계로 세분화. GitHub 잔디 데이터로 한국 개발자 전체와 실시간 비교.',
    stat: '24',
    statLabel: 'TOTAL RANKS',
    accent: '#FF4655',
  },
  {
    num: '02',
    label: 'SCORE_ENGINE',
    title: '전투력 알고리즘',
    desc: '잔디 수, 연속 스트릭, 최대 스트릭, 레포 스타 등 6가지 지표를 정밀 공식으로 합산.',
    stat: '6×',
    statLabel: 'METRICS',
    accent: '#7CFF5B',
  },
  {
    num: '03',
    label: 'BADGE_API',
    title: 'README 뱃지',
    desc: 'GitHub 프로필에 티어 뱃지를 달아 실력을 증명. 매주 자동 업데이트.',
    stat: '<1S',
    statLabel: 'RESPONSE',
    accent: '#56C8D8',
  },
]

const TIERS = [
  { name: '챌린저', range: 'TOP 100명',     color: '#FF4655', width: '8%'  },
  { name: '다이아',  range: '상위 1~5%',    color: '#56C8D8', width: '18%' },
  { name: '플래티넘', range: '상위 5~15%',  color: '#5AC9A6', width: '34%' },
  { name: '골드',   range: '상위 15~30%',   color: '#FFD700', width: '55%' },
  { name: '실버',   range: '상위 30~50%',   color: '#C0C0C0', width: '76%' },
  { name: '브론즈',  range: '상위 50~100%', color: '#CD7F32', width: '100%' },
]

const STATS = [
  { key: 'INDEXED_USERS',  val: '4,000+' },
  { key: 'SCORE_METRICS',  val: '6 종'   },
  { key: 'UPDATE_CYCLE',   val: 'WEEKLY' },
  { key: 'BADGE_LATENCY',  val: '<200ms' },
]

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

type RankingRow = {
  github_id: string
  score: number
  tier: string
  tier_rank: number | null
  percentile: number | null
}

type MyData = {
  github_id: string
  score: number
  tier: string
  tier_rank: number | null
  percentile: number | null
  rank: number | null
}

function MyTierCard({ data }: { data: MyData }) {
  const tierColor = TIER_COLOR[data.tier] ?? '#C0C0C0'
  const tierLabel = TIER_LABEL[data.tier] ?? data.tier
  const fullTierLabel = data.tier_rank ? `${tierLabel} ${data.tier_rank}` : tierLabel

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      padding: '1.75rem 2rem',
      background: 'rgba(0,0,0,0.75)',
      border: `1.5px solid ${tierColor}`,
      borderRadius: '8px',
      backdropFilter: 'blur(12px)',
      boxShadow: `0 0 20px ${tierColor}33, 0 0 50px ${tierColor}11`,
      minWidth: '220px',
      animation: 'hero-enter 0.9s ease 0.85s both',
    }}>
      <TierIcon tier={data.tier} size={52} />
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-orbitron), monospace',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: tierColor,
          letterSpacing: '0.1em',
        }}>{fullTierLabel}</div>
        <div style={{
          fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
          fontSize: '0.72rem',
          color: 'rgba(255,255,255,0.45)',
          marginTop: '2px',
        }}>{data.github_id}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-orbitron), monospace',
          fontSize: '1.75rem',
          fontWeight: 900,
          color: tierColor,
          letterSpacing: '-0.02em',
        }}>{data.score.toLocaleString('ko-KR')}</div>
        <div style={{
          fontFamily: 'var(--font-orbitron), monospace',
          fontSize: '0.52rem',
          letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.3)',
          marginTop: '2px',
        }}>전투력</div>
      </div>
      {data.percentile !== null && (
        <div style={{
          fontFamily: 'var(--font-orbitron), monospace',
          fontSize: '0.58rem',
          letterSpacing: '0.14em',
          color: tierColor,
          border: `1px solid ${tierColor}55`,
          background: `${tierColor}12`,
          padding: '0.3rem 0.9rem',
          borderRadius: '100px',
        }}>
          상위 {data.percentile.toFixed(1)}%
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
        <a
          href={`/result/${data.github_id}`}
          style={{
            fontFamily: 'var(--font-orbitron), monospace',
            fontSize: '0.58rem',
            letterSpacing: '0.12em',
            color: 'rgba(124,255,91,0.7)',
            textDecoration: 'none',
          }}
        >
          자세히 보기 →
        </a>
        <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
        <LogoutButton />
      </div>
    </div>
  )
}

export default function HomeClient({
  myData,
  ranking,
  rankingTotal,
}: {
  myData: MyData | null
  ranking: RankingRow[]
  rankingTotal: number
}) {
  const [cardTilts, setCardTilts] = useState(['', '', ''])
  const [systemVisible, setSystemVisible] = useState(false)
  const [rankingVisible, setRankingVisible] = useState(false)
  const [ctaVisible, setCtaVisible]       = useState(false)
  const [tiersAnimate, setTiersAnimate]   = useState(false)

  const cardRefs    = useRef<(HTMLDivElement | null)[]>([null, null, null])
  const heroContent = useRef<HTMLDivElement>(null)
  const systemRef   = useRef<HTMLElement | null>(null)
  const rankingRef  = useRef<HTMLElement | null>(null)
  const ctaRef      = useRef<HTMLElement | null>(null)
  const rafTilt     = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (!heroContent.current) return
      const progress = Math.min(y / (window.innerHeight * 0.7), 1)
      heroContent.current.style.transform = `translateY(${y * 0.28}px)`
      heroContent.current.style.opacity   = String(1 - progress * 1.1)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).classList.add('is-visible')
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )
    cardRefs.current.forEach((card, i) => {
      if (card) {
        card.style.transitionDelay = `${i * 0.14}s`
        obs.observe(card)
      }
    })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          if (entry.target === systemRef.current) {
            setSystemVisible(true)
            setTimeout(() => setTiersAnimate(true), 400)
            obs.unobserve(entry.target)
          }
          if (entry.target === rankingRef.current) {
            setRankingVisible(true)
            obs.unobserve(entry.target)
          }
          if (entry.target === ctaRef.current) {
            setCtaVisible(true)
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    )
    if (systemRef.current)  obs.observe(systemRef.current)
    if (rankingRef.current) obs.observe(rankingRef.current)
    if (ctaRef.current)     obs.observe(ctaRef.current)
    return () => obs.disconnect()
  }, [])

  function handleCardTilt(e: React.MouseEvent<HTMLDivElement>, idx: number) {
    if (rafTilt.current) return
    rafTilt.current = true
    const rect = e.currentTarget.getBoundingClientRect()
    const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)
    const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)
    requestAnimationFrame(() => {
      setCardTilts((prev) => {
        const next = [...prev]
        next[idx] = `perspective(800px) rotateX(${-dy * 9}deg) rotateY(${dx * 9}deg) scale3d(1.03,1.03,1.03)`
        return next
      })
      rafTilt.current = false
    })
  }

  function resetCardTilt(idx: number) {
    setCardTilts((prev) => {
      const next = [...prev]
      next[idx] = `perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`
      return next
    })
  }

  return (
    <div
      className={`${orbitron.variable} ${spaceGrotesk.variable}`}
      style={{
        fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
        background: '#000',
        color: '#e6edf3',
        overflowX: 'hidden',
      }}
    >
      <style>{STYLES}</style>

      {/* fixed canvas background */}
      <ParticleCanvas
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* scanline overlays */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 2,
          pointerEvents: 'none',
          height: '120px',
          background:
            'linear-gradient(180deg, transparent 0%, rgba(124,255,91,0.022) 50%, transparent 100%)',
          animation: 'scanline-move 10s linear infinite',
          animationDelay: '2s',
        }}
      />

      {/* navigation */}
      <nav className="cyber-nav" aria-label="메인 네비게이션">
        <a href="/" className="nav-logo">DEVTIER</a>
        <ul className="nav-links">
          <li><a href="#ranking" className="nav-link">RANKING</a></li>
          <li><a href="#features" className="nav-link">FEATURES</a></li>
        </ul>
      </nav>

      {/* ════════ HERO SECTION ════════ */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          zIndex: 10,
          background:
            'radial-gradient(ellipse 65% 60% at 50% 50%, rgba(0,15,4,0.72) 0%, rgba(0,0,0,0) 100%)',
        }}
      >
        <div className="hud-corner hud-tl" aria-hidden />
        <div className="hud-corner hud-tr" aria-hidden />
        <div className="hud-corner hud-bl" aria-hidden />
        <div className="hud-corner hud-br" aria-hidden />

        <div
          ref={heroContent}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '0 1.5rem',
            gap: '1.75rem',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* status badge */}
          <div className="status-badge" style={{ animationDelay: '0.1s' }}>
            <span className="status-dot" />
            SYSTEM ONLINE · 한국 개발자 전투력 측정
          </div>

          {/* glitch title */}
          <div className="glitch-wrap" style={{ animation: 'hero-enter 0.9s ease 0.2s both' }}>
            <h1 className="glitch-title">DEVTIER</h1>
            <span className="glitch-layer glitch-layer-1" aria-hidden>DEVTIER</span>
            <span className="glitch-layer glitch-layer-2" aria-hidden>DEVTIER</span>
          </div>

          {/* tagline */}
          <div style={{ animation: 'hero-enter 0.9s ease 0.45s both' }}>
            <p style={{
              fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
              fontSize: 'clamp(0.95rem, 2.5vw, 1.35rem)',
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.04em',
              maxWidth: '560px',
              lineHeight: 1.6,
              margin: 0,
            }}>
              GitHub 잔디 기반{' '}
              <span style={{ color: '#7CFF5B', fontWeight: 600 }}>개발자 전투력 측정</span>{' '}
              시스템
            </p>
            <p style={{
              fontFamily: 'var(--font-orbitron), monospace',
              fontSize: '0.6rem',
              color: 'rgba(124,255,91,0.4)',
              letterSpacing: '0.22em',
              marginTop: '0.6rem',
            }}>
              한국 개발자 실시간 랭킹 · 티어 · 뱃지
            </p>
          </div>

          {/* hero CTA: MyTierCard (logged in) or login button + badge mockup (not logged in) */}
          {myData ? (
            <MyTierCard data={myData} />
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  animation: 'hero-enter 0.9s ease 0.65s both',
                }}
              >
                <LoginButton />
                <a href="#features" className="btn-outline">기능 보기</a>
              </div>

              {/* floating tier badge mockup */}
              <div style={{ animation: 'hero-enter 0.9s ease 0.85s both, float-y 5s ease-in-out 1.5s infinite' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '14px',
                  background: 'rgba(0,0,0,0.82)',
                  border: '1.5px solid #FFD700',
                  borderRadius: '8px',
                  padding: '14px 22px',
                  boxShadow:
                    '0 0 18px rgba(255,215,0,0.28), 0 0 40px rgba(255,215,0,0.1), inset 0 0 12px rgba(255,215,0,0.04)',
                  backdropFilter: 'blur(10px)',
                  minWidth: '200px',
                }}>
                  <div style={{
                    width: '36px', height: '36px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 35% 30%, #FFE566, #FFD700 55%, #B8860C)',
                    boxShadow: '0 0 14px rgba(255,215,0,0.55), inset 0 -2px 4px rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', flexShrink: 0,
                  }}>★</div>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-orbitron), monospace',
                      color: '#FFD700', fontWeight: 700,
                      fontSize: '0.62rem', letterSpacing: '0.15em',
                    }}>GOLD 1</div>
                    <div style={{
                      fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
                      color: 'rgba(255,255,255,0.65)', fontSize: '0.7rem', marginTop: '2px',
                    }}>2,847점</div>
                  </div>
                  <div style={{
                    marginLeft: 'auto',
                    fontFamily: 'var(--font-orbitron), monospace',
                    color: 'rgba(255,255,255,0.25)', fontSize: '0.5rem', letterSpacing: '0.12em',
                  }}>DevTier</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* scroll indicator */}
        <div
          aria-hidden
          style={{
            position: 'absolute', bottom: '2.5rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            animation: 'hero-enter 0.9s ease 1.2s both',
          }}
        >
          <span style={{
            fontFamily: 'var(--font-orbitron), monospace',
            fontSize: '0.52rem', letterSpacing: '0.25em',
            color: 'rgba(124,255,91,0.38)',
          }}>SCROLL</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
            {[0, 0.2, 0.4].map((d, i) => (
              <div key={i} style={{
                width: '1.5px', height: '8px',
                background: 'rgba(124,255,91,0.4)',
                borderRadius: '1px',
                animation: `scroll-bounce 1.6s ease-in-out ${d}s infinite`,
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FEATURES SECTION ════════ */}
      <section
        id="features"
        style={{
          position: 'relative',
          zIndex: 10,
          background: 'rgba(0,0,0,0.88)',
          borderTop: '1px solid rgba(124,255,91,0.06)',
          padding: 'clamp(5rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{
            fontFamily: 'var(--font-orbitron), monospace',
            fontSize: '0.58rem',
            letterSpacing: '0.28em',
            color: 'rgba(124,255,91,0.45)',
            marginBottom: '1rem',
          }}>
            CORE_FEATURES
          </div>
          <h2 style={{
            fontFamily: 'var(--font-orbitron), monospace',
            fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
            fontWeight: 700,
            color: '#e6edf3',
            letterSpacing: '0.04em',
            margin: 0,
          }}>
            핵심 기능
          </h2>
          <div style={{
            width: '48px', height: '2px',
            background: 'linear-gradient(90deg, transparent, #7CFF5B, transparent)',
            margin: '1.2rem auto 0',
          }} />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          maxWidth: '1100px',
          margin: '0 auto',
        }}>
          {FEATURES.map((feat, i) => (
            <div
              key={feat.num}
              className="feature-card"
              ref={(el) => { cardRefs.current[i] = el }}
              style={{
                transform: cardTilts[i] || undefined,
                transition: cardTilts[i]
                  ? 'border-color 0.35s ease, box-shadow 0.35s ease'
                  : undefined,
              }}
              onMouseMove={(e) => handleCardTilt(e, i)}
              onMouseLeave={() => resetCardTilt(i)}
            >
              <div className="card-shine" />

              <div style={{
                fontFamily: 'var(--font-orbitron), monospace',
                fontSize: '0.58rem',
                letterSpacing: '0.2em',
                color: feat.accent,
                opacity: 0.7,
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}>
                <span>{feat.num}</span>
                <span style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${feat.accent}44, transparent)` }} />
                <span style={{ opacity: 0.7 }}>{feat.label}</span>
              </div>

              <div style={{
                width: '44px', height: '44px',
                borderRadius: '8px',
                border: `1px solid ${feat.accent}44`,
                background: `${feat.accent}0d`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.25rem',
                fontSize: '20px',
              }}>
                {i === 0 ? '◈' : i === 1 ? '⬡' : '◉'}
              </div>

              <h3 style={{
                fontFamily: 'var(--font-orbitron), monospace',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#e6edf3',
                letterSpacing: '0.04em',
                margin: '0 0 0.75rem',
              }}>
                {feat.title}
              </h3>

              <p style={{
                fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.7,
                margin: '0 0 1.5rem',
              }}>
                {feat.desc}
              </p>

              <div style={{
                marginTop: 'auto',
                paddingTop: '1.25rem',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'baseline', gap: '0.5rem',
              }}>
                <span style={{
                  fontFamily: 'var(--font-orbitron), monospace',
                  fontSize: '1.6rem',
                  fontWeight: 900,
                  color: feat.accent,
                  letterSpacing: '-0.02em',
                }}>
                  {feat.stat}
                </span>
                <span style={{
                  fontFamily: 'var(--font-orbitron), monospace',
                  fontSize: '0.55rem',
                  letterSpacing: '0.18em',
                  color: 'rgba(255,255,255,0.3)',
                }}>
                  {feat.statLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div aria-hidden style={{
        position: 'relative', zIndex: 10,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(124,255,91,0.12), transparent)',
      }} />

      {/* ════════ SYSTEM SECTION ════════ */}
      <section
        ref={(el) => { systemRef.current = el }}
        className={systemVisible ? 'section-visible' : ''}
        style={{
          position: 'relative',
          zIndex: 10,
          background: 'rgba(0,2,0,0.91)',
          padding: 'clamp(5rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem)',
        }}
      >
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem',
          alignItems: 'start',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="section-anim-child" style={{
              fontFamily: 'var(--font-orbitron), monospace',
              fontSize: '0.58rem',
              letterSpacing: '0.28em',
              color: 'rgba(124,255,91,0.45)',
            }}>
              SYSTEM_STATUS
            </div>

            <div className="section-anim-child">
              <h2 style={{
                fontFamily: 'var(--font-orbitron), monospace',
                fontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
                fontWeight: 700,
                color: '#e6edf3',
                letterSpacing: '0.03em',
                margin: '0 0 0.75rem',
                lineHeight: 1.2,
              }}>
                실시간 운영 현황
              </h2>
              <p style={{
                fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.48)',
                lineHeight: 1.75,
                margin: 0,
              }}>
                한국 개발자 {rankingTotal.toLocaleString('ko-KR')}+명의 GitHub 데이터를 주 1회 수집·분석합니다.
                전투력 점수, 티어, 백분위가 자동으로 갱신됩니다.
              </p>
            </div>

            <div className="stat-panel section-anim-child">
              <div className="stat-panel-header">
                <span className="status-dot" />
                <span className="stat-panel-label">SYS_METRICS</span>
              </div>
              {STATS.map((s) => (
                <div className="stat-row" key={s.key}>
                  <span className="stat-key">{s.key}</span>
                  <span style={{ flex: 1, height: '1px', background: 'rgba(124,255,91,0.06)', margin: '0 1rem' }} />
                  <span className="stat-val">{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="section-anim-child" style={{
              fontFamily: 'var(--font-orbitron), monospace',
              fontSize: '0.58rem',
              letterSpacing: '0.28em',
              color: 'rgba(124,255,91,0.45)',
            }}>
              TIER_DISTRIBUTION
            </div>

            <div className="stat-panel section-anim-child">
              <div className="stat-panel-header">
                <span className="status-dot" />
                <span className="stat-panel-label">TIER_LADDER</span>
              </div>
              {TIERS.map((tier) => (
                <div className="tier-row" key={tier.name}>
                  <span
                    className="tier-name"
                    style={{ color: tier.color, textShadow: `0 0 8px ${tier.color}66` }}
                  >
                    {tier.name}
                  </span>
                  <div className="tier-bar-track">
                    <div
                      className={`tier-bar-fill${tiersAnimate ? ' animate' : ''}`}
                      style={{
                        background: `linear-gradient(90deg, ${tier.color}bb, ${tier.color})`,
                        boxShadow: `0 0 6px ${tier.color}66`,
                        '--tw': tier.width,
                      } as React.CSSProperties}
                    />
                  </div>
                  <span className="tier-range">{tier.range}</span>
                </div>
              ))}
            </div>

            <div
              className="section-anim-child"
              style={{
                background: 'rgba(0,0,0,0.65)',
                border: '1px solid rgba(124,255,91,0.1)',
                borderRadius: '6px',
                padding: '1.1rem 1.25rem',
                fontFamily: 'Courier New, monospace',
                fontSize: '0.72rem',
                lineHeight: 2,
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              <span style={{ color: 'rgba(124,255,91,0.6)', fontSize: '0.58rem', letterSpacing: '0.15em', display: 'block', marginBottom: '0.5rem' }}>SCORE_FORMULA</span>
              <span style={{ color: '#79C0FF' }}>잔디 수</span>       × 1{'\n'}
              + <span style={{ color: '#79C0FF' }}>현재 스트릭</span> × 3{'\n'}
              + <span style={{ color: '#79C0FF' }}>최대 스트릭</span> × 2{'\n'}
              + <span style={{ color: '#FFA857' }}>log₂</span>(<span style={{ color: '#79C0FF' }}>스타 + 1</span>) × 10
            </div>
          </div>
        </div>
      </section>

      <div aria-hidden style={{
        position: 'relative', zIndex: 10,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(124,255,91,0.12), transparent)',
      }} />

      {/* ════════ RANKING SECTION ════════ */}
      <section
        id="ranking"
        ref={(el) => { rankingRef.current = el }}
        className={rankingVisible ? 'section-visible' : ''}
        style={{
          position: 'relative',
          zIndex: 10,
          background: 'rgba(0,0,0,0.9)',
          padding: 'clamp(5rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem)',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="section-anim-child" style={{
              fontFamily: 'var(--font-orbitron), monospace',
              fontSize: '0.58rem',
              letterSpacing: '0.28em',
              color: 'rgba(124,255,91,0.45)',
              marginBottom: '1rem',
            }}>
              LEADERBOARD
            </div>
            <h2 className="section-anim-child" style={{
              fontFamily: 'var(--font-orbitron), monospace',
              fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
              fontWeight: 700,
              color: '#e6edf3',
              letterSpacing: '0.04em',
              margin: 0,
            }}>
              전체 랭킹
              {rankingTotal > 0 && (
                <span style={{
                  fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
                  fontSize: '0.8rem',
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.28)',
                  marginLeft: '1rem',
                  letterSpacing: '0.04em',
                }}>
                  총 {rankingTotal.toLocaleString('ko-KR')}명
                </span>
              )}
            </h2>
            <div className="section-anim-child" style={{
              width: '48px', height: '2px',
              background: 'linear-gradient(90deg, transparent, #7CFF5B, transparent)',
              margin: '1.2rem auto 0',
            }} />
          </div>

          <div className="section-anim-child">
            <RankingTable initialRows={ranking} myData={myData} total={rankingTotal} />
          </div>
        </div>
      </section>

      <div aria-hidden style={{
        position: 'relative', zIndex: 10,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(124,255,91,0.12), transparent)',
      }} />

      {/* ════════ CTA SECTION ════════ */}
      <section
        ref={(el) => { ctaRef.current = el }}
        className={ctaVisible ? 'section-visible' : ''}
        style={{
          position: 'relative',
          zIndex: 10,
          background: 'rgba(0,0,0,0.9)',
          padding: 'clamp(5rem, 12vw, 9rem) clamp(1.5rem, 5vw, 4rem)',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0,
            animation: 'cta-glow-pulse 5s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        <div style={{
          maxWidth: '860px', margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '2.5rem',
          position: 'relative',
        }}>
          <div className="section-anim-child" style={{
            fontFamily: 'var(--font-orbitron), monospace',
            fontSize: '0.58rem',
            letterSpacing: '0.28em',
            color: 'rgba(124,255,91,0.45)',
          }}>
            GET_STARTED
          </div>

          <div className="section-anim-child">
            <h2 style={{
              fontFamily: 'var(--font-orbitron), monospace',
              fontSize: 'clamp(1.8rem, 6vw, 4rem)',
              fontWeight: 900,
              color: '#e6edf3',
              letterSpacing: '0.05em',
              margin: '0 0 0.5rem',
              lineHeight: 1.1,
            }}>
              당신의 <span style={{
                color: '#7CFF5B',
                textShadow: '0 0 20px rgba(124,255,91,0.5), 0 0 40px rgba(124,255,91,0.2)',
              }}>RANK</span>는?
            </h2>
            <p style={{
              fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.48)',
              margin: 0,
              lineHeight: 1.7,
            }}>
              GitHub 계정으로 로그인하면 전투력을 측정하고, 한국 개발자들과 순위를 비교할 수 있어요.
            </p>
          </div>

          <div className="terminal section-anim-child">
            <div className="terminal-bar">
              <span className="t-dot t-dot-r" />
              <span className="t-dot t-dot-y" />
              <span className="t-dot t-dot-g" />
              <span className="terminal-title">devtier — bash</span>
            </div>
            <div className="terminal-body">
              <span className="t-line">
                <span className="t-prompt">$ </span>
                <span className="t-cmd">curl devtier-brown.vercel.app/api/score/</span>
                <span className="t-cursor">█</span>
              </span>
              <span className="t-line" style={{ color: 'rgba(255,255,255,0.18)' }}>{'{'}</span>
              <span className="t-line" style={{ paddingLeft: '1.5rem' }}>
                <span className="t-key">&quot;tier&quot;</span>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>: </span>
                <span className="t-str">&quot;challenger&quot;</span>
                <span style={{ color: 'rgba(255,255,255,0.18)' }}>,</span>
              </span>
              <span className="t-line" style={{ paddingLeft: '1.5rem' }}>
                <span className="t-key">&quot;score&quot;</span>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>: </span>
                <span className="t-num">9999</span>
                <span style={{ color: 'rgba(255,255,255,0.18)' }}>,</span>
              </span>
              <span className="t-line" style={{ paddingLeft: '1.5rem' }}>
                <span className="t-key">&quot;percentile&quot;</span>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>: </span>
                <span className="t-num">0.02</span>
              </span>
              <span className="t-line" style={{ color: 'rgba(255,255,255,0.18)' }}>{'}'}</span>
            </div>
          </div>

          <div className="section-anim-child" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {myData ? (
              <>
                <a href={`/result/${myData.github_id}`} className="btn-primary">내 결과 자세히 보기 →</a>
                <a href="#ranking" className="btn-outline">랭킹 확인하기</a>
              </>
            ) : (
              <>
                <LoginButton />
                <a href="#ranking" className="btn-outline">랭킹 확인하기</a>
              </>
            )}
          </div>

          <p className="section-anim-child" style={{
            fontFamily: 'var(--font-orbitron), monospace',
            fontSize: '0.55rem',
            letterSpacing: '0.18em',
            color: 'rgba(255,255,255,0.2)',
            margin: 0,
          }}>
            GitHub location 한국 설정 유저 기준 백분위 · 주 1회 자동 업데이트
          </p>
        </div>
      </section>
    </div>
  )
}
