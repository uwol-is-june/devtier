'use client'

import { useState } from 'react'
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

  const myGithubId = myData?.github_id

  async function handleToggle() {
    if (!expanded) {
      setLoading(true)
      const res = await fetch('/api/ranking')
      const json = await res.json()
      setRows(json.users)
      setExpanded(true)
      setLoading(false)
    } else {
      setRows(initialRows)
      setExpanded(false)
    }
  }

  if (rows.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--text-sub)] text-sm">
        아직 데이터가 없습니다. 배치를 실행하거나 아이디를 검색해보세요.
      </div>
    )
  }

  const myNotInList = myData && !rows.some(u => u.github_id === myGithubId)

  return (
    <div
      className="rounded-md border border-[var(--border)] overflow-hidden"
      style={{ background: 'var(--surface)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr
              className="text-left text-xs text-[var(--text-sub)] uppercase tracking-wider"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <th className="px-4 py-3 w-12">#</th>
              <th className="px-4 py-3">GitHub ID</th>
              <th className="px-4 py-3">티어</th>
              <th className="px-4 py-3 text-right">전투력</th>
              <th className="px-4 py-3 text-right">백분위</th>
            </tr>
          </thead>
          <tbody>
            {myNotInList && (() => {
              const myTierColor = TIER_COLOR[myData.tier] ?? '#C0C0C0'
              const myTierLabel = TIER_LABEL[myData.tier] ?? myData.tier
              const myRankLabel = myData.tier_rank ? `${myTierLabel} ${myData.tier_rank}` : myTierLabel
              return (
                <>
                  <tr style={{ background: 'color-mix(in srgb, #58a6ff 8%, transparent)', borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-3 text-[var(--text-sub)] font-mono text-xs">{myData.rank}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <a href={`/result/${myData.github_id}`} className="text-[#58a6ff] hover:underline font-mono text-sm">
                          {myData.github_id}
                        </a>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                          style={{
                            background: 'color-mix(in srgb, #58a6ff 15%, transparent)',
                            color: '#58a6ff',
                            border: '1px solid color-mix(in srgb, #58a6ff 40%, transparent)',
                          }}
                        >
                          나
                        </span>
                        <a
                          href={`https://github.com/${myData.github_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--text-sub)] hover:text-[var(--text)] transition-colors"
                          title="GitHub 프로필 열기"
                        >
                          {GH_ICON}
                        </a>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <TierIcon tier={myData.tier} size={20} />
                        <span className="text-xs font-medium" style={{ color: myTierColor }}>{myRankLabel}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-[var(--text)]">
                      {myData.score.toLocaleString('ko-KR')}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-[var(--text-sub)]">
                      {myData.percentile != null ? `상위 ${myData.percentile.toFixed(1)}%` : '-'}
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
              const tierLabel = TIER_LABEL[user.tier] ?? user.tier
              const rankLabel = user.tier_rank ? `${tierLabel} ${user.tier_rank}` : tierLabel
              const isMe = myGithubId === user.github_id

              return (
                <tr
                  key={user.github_id}
                  className="group transition-all duration-150"
                  style={{
                    borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : undefined,
                    background: isMe ? 'color-mix(in srgb, #58a6ff 8%, transparent)' : undefined,
                  }}
                >
                  <td className="px-4 py-3 text-[var(--text-sub)] font-mono text-xs group-hover:text-[var(--text)] transition-colors">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <a
                        href={`/result/${user.github_id}`}
                        className="text-[#58a6ff] hover:underline font-mono text-sm"
                      >
                        {user.github_id}
                      </a>
                      {isMe && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                          style={{
                            background: 'color-mix(in srgb, #58a6ff 15%, transparent)',
                            color: '#58a6ff',
                            border: '1px solid color-mix(in srgb, #58a6ff 40%, transparent)',
                          }}
                        >
                          나
                        </span>
                      )}
                      <a
                        href={`https://github.com/${user.github_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--text-sub)] hover:text-[var(--text)] transition-colors"
                        title="GitHub 프로필 열기"
                      >
                        {GH_ICON}
                      </a>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <TierIcon tier={user.tier} size={20} />
                      <span className="text-xs font-medium" style={{ color: tierColor }}>
                        {rankLabel}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-[var(--text)]">
                    {user.score.toLocaleString('ko-KR')}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-[var(--text-sub)]">
                    {user.percentile != null ? `상위 ${user.percentile.toFixed(1)}%` : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {total > 20 && (
        <div
          className="flex justify-center py-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={handleToggle}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-[var(--text-sub)] hover:text-[var(--text)] transition-colors px-3 py-1.5 rounded disabled:opacity-50"
            style={{ border: '1px solid var(--border)' }}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                불러오는 중...
              </>
            ) : expanded ? (
              '접기 ↑'
            ) : (
              `펼쳐보기 (총 ${total.toLocaleString('ko-KR')}명) ↓`
            )}
          </button>
        </div>
      )}
    </div>
  )
}
