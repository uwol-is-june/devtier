'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { TierIcon } from '@/components/TierIcon'
import { useT } from '@/context/LangContext'

const TIER_COLOR: Record<string, string> = {
  challenger: '#FF4655',
  diamond:    '#56C8D8',
  platinum:   '#5AC9A6',
  gold:       '#FFD700',
  silver:     '#C0C0C0',
  bronze:     '#CD7F32',
}

type RankingUser = {
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

type Props = {
  initialRows: RankingUser[]
  myData: MyData | null
  total: number
}

const GH_ICON = (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
)

export function RankingTable({ initialRows, myData, total }: Props) {
  const [rows, setRows] = useState<RankingUser[]>(initialRows)
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedLang, setSelectedLang] = useState<string>('')
  const [filteredTotal, setFilteredTotal] = useState<number>(total)
  const [languages, setLanguages] = useState<string[]>([])
  const { t, locale } = useT()
  const localeStr = locale === 'ko' ? 'ko-KR' : 'en-US'
  const searchParams = useSearchParams()
  const router = useRouter()

  const myGithubId = myData?.github_id

  // load available languages once
  useEffect(() => {
    fetch('/api/ranking/languages')
      .then((r) => r.json())
      .then(({ languages: langs }: { languages: { lang: string }[] }) => {
        setLanguages(langs.map((l) => l.lang))
      })
      .catch(() => {/* ignore if column not yet migrated */})
  }, [])

  // apply URL param on mount
  useEffect(() => {
    const lang = searchParams.get('language') ?? ''
    if (lang) {
      setSelectedLang(lang)
      fetchFiltered(lang)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchFiltered(lang: string) {
    setLoading(true)
    const url = lang ? `/api/ranking?language=${encodeURIComponent(lang)}` : '/api/ranking'
    const res = await fetch(url)
    const json = await res.json()
    setRows(json.users ?? [])
    setFilteredTotal(json.total ?? 0)
    setExpanded(true)
    setLoading(false)
  }

  async function handleLangChange(lang: string) {
    setSelectedLang(lang)
    setExpanded(false)

    if (!lang) {
      setRows(initialRows)
      setFilteredTotal(total)
      router.push('/#ranking', { scroll: false })
      return
    }

    await fetchFiltered(lang)
    router.push(`/?language=${encodeURIComponent(lang)}#ranking`, { scroll: false })
  }

  async function handleToggle() {
    if (!expanded) {
      setLoading(true)
      const url = selectedLang
        ? `/api/ranking?language=${encodeURIComponent(selectedLang)}`
        : '/api/ranking'
      const res = await fetch(url)
      const json = await res.json()
      setRows(json.users)
      setFilteredTotal(json.total)
      setExpanded(true)
      setLoading(false)
    } else {
      setRows(selectedLang ? rows : initialRows)
      if (!selectedLang) setFilteredTotal(total)
      setExpanded(false)
    }
  }

  if (rows.length === 0 && !loading) {
    return (
      <div className="text-center py-16 text-[var(--text-sub)] text-sm">
        {t.rankingTable.empty}
      </div>
    )
  }

  const myNotInList = myData && !rows.some(u => u.github_id === myGithubId)

  return (
    <div>
      {/* Language filter */}
      {languages.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginBottom: '0.75rem',
          flexWrap: 'wrap',
        }}>
          <span style={{
            fontFamily: "var(--font-orbitron), 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif",
            fontSize: '0.55rem',
            letterSpacing: '0.18em',
            color: 'rgba(124,255,91,0.45)',
          }}>
            {t.rankingTable.langFilter}
          </span>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleLangChange('')}
              style={{
                fontFamily: "var(--font-orbitron), 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif",
                fontSize: '0.55rem',
                letterSpacing: '0.1em',
                padding: '0.25rem 0.65rem',
                borderRadius: '100px',
                border: selectedLang === '' ? '1px solid rgba(124,255,91,0.6)' : '1px solid rgba(255,255,255,0.12)',
                background: selectedLang === '' ? 'rgba(124,255,91,0.12)' : 'transparent',
                color: selectedLang === '' ? '#7CFF5B' : 'rgba(255,255,255,0.45)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {t.rankingTable.allLangs}
            </button>
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLangChange(lang)}
                style={{
                  fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
                  fontSize: '0.7rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '100px',
                  border: selectedLang === lang ? '1px solid rgba(124,255,91,0.6)' : '1px solid rgba(255,255,255,0.12)',
                  background: selectedLang === lang ? 'rgba(124,255,91,0.12)' : 'transparent',
                  color: selectedLang === lang ? '#7CFF5B' : 'rgba(255,255,255,0.45)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className="rounded-md overflow-hidden"
        style={{
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(124,255,91,0.1)',
          animation: 'border-glow 4s ease-in-out infinite',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr
                className="text-left uppercase"
                style={{
                  borderBottom: '1px solid rgba(124,255,91,0.15)',
                  fontFamily: 'var(--font-orbitron), monospace',
                  fontSize: '0.6rem',
                  letterSpacing: '0.18em',
                  color: 'rgba(124,255,91,0.55)',
                }}
              >
                <th className="px-4 py-3.5 w-12">#</th>
                <th className="px-4 py-3.5">GitHub ID</th>
                <th className="px-4 py-3.5">{t.rankingTable.tierHeader}</th>
                <th className="px-4 py-3.5 text-right">{t.rankingTable.combatHeader}</th>
                <th className="px-4 py-3.5 text-right">{t.rankingTable.percentileHeader}</th>
              </tr>
            </thead>
            <tbody>
              {myNotInList && (() => {
                const myTierColor = TIER_COLOR[myData.tier] ?? '#C0C0C0'
                const myTierLabel = t.tier.labels[myData.tier] ?? myData.tier
                const myRankLabel = myData.tier_rank ? `${myTierLabel} ${myData.tier_rank}` : myTierLabel
                return (
                  <>
                    <tr style={{ background: 'rgba(124,255,91,0.06)', borderLeft: '2px solid rgba(124,255,91,0.5)', borderBottom: '1px solid var(--border)' }}>
                      <td
                        className="px-4 py-3.5 font-mono text-sm"
                        style={{ fontFamily: 'var(--font-orbitron), monospace', color: 'rgba(255,255,255,0.28)' }}
                      >{myData.rank}</td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-2">
                          <a
                            href={`/result/${myData.github_id}`}
                            className="hover:underline font-mono text-base"
                            style={{ color: 'rgba(124,255,91,0.85)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#7CFF5B')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(124,255,91,0.85)')}
                          >
                            {myData.github_id}
                          </a>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                            style={{
                              background: 'rgba(124,255,91,0.12)',
                              color: '#7CFF5B',
                              border: '1px solid rgba(124,255,91,0.4)',
                            }}
                          >
                            {t.rankingTable.me}
                          </span>
                          <a
                            href={`https://github.com/${myData.github_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--text-sub)] hover:text-[var(--text)] transition-colors"
                            title={t.rankingTable.ghProfile}
                          >
                            {GH_ICON}
                          </a>
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-2">
                          <TierIcon tier={myData.tier} size={20} />
                          <span className="text-xs font-medium" style={{ color: myTierColor }}>{myRankLabel}</span>
                        </span>
                      </td>
                      <td
                        className="px-4 py-3.5 text-right"
                        style={{ fontFamily: 'var(--font-orbitron), monospace', fontWeight: 700, color: '#7CFF5B' }}
                      >
                        {myData.score.toLocaleString(localeStr)}
                      </td>
                      <td
                        className="px-4 py-3.5 text-right"
                        style={{ fontFamily: 'var(--font-orbitron), monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.28)' }}
                      >
                        {myData.percentile != null ? t.rankingTable.topPercent(myData.percentile.toFixed(1)) : '-'}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td colSpan={5} className="px-4 py-1.5 text-center text-xs text-[var(--text-sub)]">
                        · · ·
                      </td>
                    </tr>
                  </>
                )
              })()}
              {rows.map((user, i) => {
                const tierColor = TIER_COLOR[user.tier] ?? '#C0C0C0'
                const tierLabel = t.tier.labels[user.tier] ?? user.tier
                const rankLabel = user.tier_rank ? `${tierLabel} ${user.tier_rank}` : tierLabel
                const isMe = myGithubId === user.github_id

                return (
                  <tr
                    key={user.github_id}
                    className="group transition-all duration-150"
                    style={{
                      borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : undefined,
                      background: isMe ? 'rgba(124,255,91,0.06)' : undefined,
                      borderLeft: isMe ? '2px solid rgba(124,255,91,0.5)' : undefined,
                    }}
                  >
                    <td
                      className="px-4 py-3.5 font-mono text-sm"
                      style={{ fontFamily: 'var(--font-orbitron), monospace', color: 'rgba(255,255,255,0.28)' }}
                    >
                      {i + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-2">
                        <a
                          href={`/result/${user.github_id}`}
                          className="hover:underline font-mono text-base"
                          style={{ color: 'rgba(124,255,91,0.85)' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#7CFF5B')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(124,255,91,0.85)')}
                        >
                          {user.github_id}
                        </a>
                        {isMe && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                            style={{
                              background: 'rgba(124,255,91,0.12)',
                              color: '#7CFF5B',
                              border: '1px solid rgba(124,255,91,0.4)',
                            }}
                          >
                            {t.rankingTable.me}
                          </span>
                        )}
                        <a
                          href={`https://github.com/${user.github_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--text-sub)] hover:text-[var(--text)] transition-colors"
                          title={t.rankingTable.ghProfile}
                        >
                          {GH_ICON}
                        </a>
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-2">
                        <TierIcon tier={user.tier} size={20} />
                        <span className="text-sm font-medium" style={{ color: tierColor }}>
                          {rankLabel}
                        </span>
                      </span>
                    </td>
                    <td
                      className="px-4 py-3.5 text-right"
                      style={{ fontFamily: 'var(--font-orbitron), monospace', fontWeight: 700, color: '#7CFF5B' }}
                    >
                      {user.score.toLocaleString(localeStr)}
                    </td>
                    <td
                      className="px-4 py-3.5 text-right"
                      style={{ fontFamily: 'var(--font-orbitron), monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.28)' }}
                    >
                      {user.percentile != null ? t.rankingTable.topPercent(user.percentile.toFixed(1)) : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {!selectedLang && filteredTotal > 20 && (
          <div
            className="flex justify-center py-3"
            style={{ borderTop: '1px solid rgba(124,255,91,0.1)' }}
          >
            <button
              onClick={handleToggle}
              disabled={loading}
              className="btn-outline flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  {t.rankingTable.loading}
                </>
              ) : expanded ? (
                t.rankingTable.collapse
              ) : (
                t.rankingTable.expand
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
