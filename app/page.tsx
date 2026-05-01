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
  const { data } = await supabase
    .from('users')
    .select('github_id, score, tier, tier_rank')
    .order('score', { ascending: false })
    .limit(100)
  return data ?? []
}

async function getMyData(githubId: string) {
  const { data } = await supabase
    .from('users')
    .select('github_id, score, tier, tier_rank, percentile')
    .eq('github_id', githubId)
    .single()
  return data
}

export default async function Home() {
  const client = await createClient()
  const { data: { user } } = await client.auth.getUser()
  const githubId = user?.user_metadata?.user_name as string | undefined

  const [ranking, myData] = await Promise.all([
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
                </tr>
              </thead>
              <tbody>
                {ranking.map((user, i) => {
                  const tierColor = TIER_COLOR[user.tier] ?? '#C0C0C0'
                  const tierLabel = TIER_LABEL[user.tier] ?? user.tier
                  const rankLabel = user.tier_rank ? `${tierLabel} ${user.tier_rank}` : tierLabel

                  return (
                    <tr
                      key={user.github_id}
                      className="group transition-all duration-150"
                      style={{ borderBottom: i < ranking.length - 1 ? '1px solid var(--border)' : undefined }}
                    >
                      <td className="px-4 py-3 text-[var(--text-sub)] font-mono text-xs group-hover:text-[var(--text)] transition-colors">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/result/${user.github_id}`}
                          className="text-[#58a6ff] hover:underline font-mono text-sm"
                        >
                          {user.github_id}
                        </a>
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
