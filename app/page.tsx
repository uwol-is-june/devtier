import { LoginButton } from '@/components/LoginButton'
import { LogoutButton } from '@/components/LogoutButton'
import { TierIcon } from '@/components/TierIcon'
import { createClient } from '@/lib/supabase-server'
import { supabase } from '@/lib/supabase'

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
    <div
      className="flex flex-col items-center gap-4 w-full max-w-sm rounded-lg px-8 py-6"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${tierColor}`,
        boxShadow: `0 0 16px 2px color-mix(in srgb, ${tierColor} 15%, transparent)`,
      }}
    >
      <TierIcon tier={data.tier} size={56} />

      <div className="text-center">
        <div className="text-xl font-bold" style={{ color: tierColor }}>{fullTierLabel}</div>
        <div className="text-[var(--text-sub)] text-sm font-mono mt-0.5">{data.github_id}</div>
      </div>

      <div className="text-center">
        <div className="text-3xl font-bold font-mono" style={{ color: tierColor }}>
          {data.score.toLocaleString('ko-KR')}
        </div>
        <div className="text-xs text-[var(--text-sub)] mt-0.5">전투력</div>
      </div>

      {data.percentile !== null && (
        <div
          className="text-xs px-3 py-1 rounded-full"
          style={{
            background: `color-mix(in srgb, ${tierColor} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${tierColor} 40%, transparent)`,
            color: tierColor,
          }}
        >
          상위 {data.percentile.toFixed(1)}%
        </div>
      )}

      <div className="flex items-center gap-4 mt-1">
        <a
          href={`/result/${data.github_id}`}
          className="text-sm text-[#58a6ff] hover:underline"
        >
          자세히 보기 →
        </a>
        <span className="text-[var(--border)]">|</span>
        <LogoutButton />
      </div>
    </div>
  )
}

async function getRanking() {
  const [{ data }, { count: total }] = await Promise.all([
    supabase
      .from('users')
      .select('github_id, score, tier, tier_rank, percentile')
      .order('score', { ascending: false })
      .limit(100),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ])
  return { users: data ?? [], total: total ?? 0 }
}

async function getMyData(githubId: string): Promise<MyData | null> {
  const { data } = await supabase
    .from('users')
    .select('github_id, score, tier, tier_rank, percentile')
    .eq('github_id', githubId)
    .single()
  if (!data) return null
  const { count: higherCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gt('score', data.score)
  return { ...data, rank: (higherCount ?? 0) + 1 }
}

export default async function Home() {
  const client = await createClient()
  const { data: { user } } = await client.auth.getUser()
  const githubId = user?.user_metadata?.user_name as string | undefined

  const [{ users: ranking, total: rankingTotal }, myData] = await Promise.all([
    getRanking(),
    githubId ? getMyData(githubId) : Promise.resolve(null),
  ])

  return (
    <main className="flex flex-col items-center w-full px-4 pb-24">
      {/* ── Hero ── */}
      <section className="flex flex-col items-center text-center pt-20 pb-16 gap-6 animate-fade-in-up">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] text-xs text-[var(--text-sub)]">
          GitHub 잔디 기반 개발자 전투력 측정
        </div>

        <h1 className="text-5xl font-bold tracking-tight leading-tight">
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
            DevTier
          </span>
        </h1>

        <p className="text-[var(--text-sub)] text-lg max-w-md leading-relaxed">
          GitHub 잔디 데이터로 한국 개발자 전투력을 측정하고<br />
          티어를 부여합니다. README에 뱃지를 달아보세요.
        </p>

        {myData ? (
          <MyTierCard data={myData} />
        ) : (
          <LoginButton />
        )}
      </section>

      {/* ── Ranking Table ── */}
      <section className="w-full max-w-2xl animate-fade-in-up stagger-3">
        <h2 className="text-sm font-semibold text-[var(--text-sub)] uppercase tracking-widest mb-4">
          전체 랭킹
          {rankingTotal > 0 && (
            <span className="ml-2 normal-case font-normal text-xs text-[var(--text-sub)]">
              · 총 {rankingTotal.toLocaleString('ko-KR')}명 기준
            </span>
          )}
        </h2>

        {ranking.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-sub)] text-sm">
            아직 데이터가 없습니다. 배치를 실행하거나 아이디를 검색해보세요.
          </div>
        ) : (
          <div
            className="rounded-md border border-[var(--border)] overflow-hidden"
            style={{ background: 'var(--surface)' }}
          >
            <table className="w-full text-sm">
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
                {myData && !ranking.some(u => u.github_id === githubId) && (() => {
                  const myTierColor = TIER_COLOR[myData.tier] ?? '#C0C0C0'
                  const myTierLabel = TIER_LABEL[myData.tier] ?? myData.tier
                  const myRankLabel = myData.tier_rank ? `${myTierLabel} ${myData.tier_rank}` : myTierLabel
                  return (
                    <>
                      <tr style={{ background: 'color-mix(in srgb, #58a6ff 8%, transparent)', borderBottom: '1px solid var(--border)' }}>
                        <td className="px-4 py-3 text-[var(--text-sub)] font-mono text-xs">
                          {myData.rank}
                        </td>
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
                              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                              </svg>
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
                {ranking.map((user, i) => {
                  const tierColor = TIER_COLOR[user.tier] ?? '#C0C0C0'
                  const tierLabel = TIER_LABEL[user.tier] ?? user.tier
                  const rankLabel = user.tier_rank ? `${tierLabel} ${user.tier_rank}` : tierLabel
                  const isMe = githubId === user.github_id

                  return (
                    <tr
                      key={user.github_id}
                      className="group transition-all duration-150"
                      style={{
                        borderBottom: i < ranking.length - 1 ? '1px solid var(--border)' : undefined,
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
                            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
                              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                            </svg>
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
        )}
      </section>
    </main>
  )
}
