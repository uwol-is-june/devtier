import { supabase } from '@/lib/supabase'

const TIER_ORDER = ['challenger', 'diamond', 'platinum', 'gold', 'silver', 'bronze']
const TIER_LABEL: Record<string, string> = {
  challenger: '챌린저',
  diamond: '다이아',
  platinum: '플래티넘',
  gold: '골드',
  silver: '실버',
  bronze: '브론즈',
}

type BatchLog = {
  id: number
  run_at: string
  total: number
  updated: number
  skipped: number
  duration_sec: number
}

type RegisteredUser = {
  github_id: string
  created_at: string
}

async function fetchAdminData() {
  const [
    { count: totalUsers },
    { data: tierRows },
    { count: nullScoreCount },
    { count: staleCount },
    { data: batchLogs },
    { data: authData },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('tier').not('tier', 'is', null),
    supabase.from('users').select('*', { count: 'exact', head: true }).is('score', null),
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .lt('updated_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('batch_logs')
      .select('*')
      .order('run_at', { ascending: false })
      .limit(10),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ])

  const tierCounts: Record<string, number> = {}
  for (const row of (tierRows ?? []) as { tier: string }[]) {
    tierCounts[row.tier] = (tierCounts[row.tier] ?? 0) + 1
  }

  const registeredUsers: RegisteredUser[] = (authData?.users ?? [])
    .filter((u) => u.user_metadata?.user_name)
    .map((u) => ({ github_id: u.user_metadata.user_name as string, created_at: u.created_at }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return {
    totalUsers: totalUsers ?? 0,
    tierCounts,
    nullScoreCount: nullScoreCount ?? 0,
    staleCount: staleCount ?? 0,
    batchLogs: (batchLogs ?? []) as BatchLog[],
    registeredUsers,
  }
}

function formatDuration(sec: number) {
  if (sec < 60) return `${sec}초`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}분 ${s}초`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ secret?: string }>
}) {
  const { secret } = await searchParams

  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return (
      <main style={{ padding: '2rem', fontFamily: "'Malgun Gothic', 'Apple SD Gothic Neo', monospace", color: '#e6edf3', background: '#0d1117', minHeight: '100vh' }}>
        <p style={{ color: '#f85149' }}>Access denied</p>
      </main>
    )
  }

  const { totalUsers, tierCounts, nullScoreCount, staleCount, batchLogs, registeredUsers } = await fetchAdminData()
  const registeredCount = registeredUsers.length
  const batchOnlyCount = totalUsers - registeredCount

  return (
    <main style={{
      padding: '2rem',
      fontFamily: "system-ui, 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif",
      color: '#e6edf3',
      background: '#0d1117',
      minHeight: '100vh',
      maxWidth: '800px',
      margin: '0 auto',
    }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', borderBottom: '1px solid #30363d', paddingBottom: '1rem' }}>
        DevTier 어드민
      </h1>

      {/* 유저 현황 */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', color: '#8b949e', marginBottom: '1rem' }}>유저 현황</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <StatCard label="총 유저" value={totalUsers.toLocaleString()} />
          <StatCard label="score NULL" value={nullScoreCount.toLocaleString()} warn={nullScoreCount > 0} />
          <StatCard label="2주 이상 미갱신" value={staleCount.toLocaleString()} warn={staleCount > 0} />
        </div>
      </section>

      {/* 가입 현황 */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', color: '#8b949e', marginBottom: '1rem' }}>가입 현황</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          <StatCard label="배치 수집" value={batchOnlyCount.toLocaleString()} />
          <StatCard label="실제 가입 (OAuth)" value={registeredCount.toLocaleString()} />
        </div>
        {registeredUsers.length === 0 ? (
          <p style={{ color: '#8b949e', fontSize: '0.875rem' }}>가입 유저 없음</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #30363d', color: '#8b949e' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem 0', width: '2.5rem' }}>#</th>
                <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>GitHub ID</th>
                <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>가입 시각</th>
              </tr>
            </thead>
            <tbody>
              {registeredUsers.map((u, i) => (
                <tr key={u.github_id} style={{ borderBottom: '1px solid #21262d' }}>
                  <td style={{ padding: '0.5rem 0', color: '#8b949e' }}>{i + 1}</td>
                  <td style={{ padding: '0.5rem 0' }}>{u.github_id}</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem 0', color: '#8b949e' }}>{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* 티어 분포 */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', color: '#8b949e', marginBottom: '1rem' }}>티어 분포</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #30363d', color: '#8b949e' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>티어</th>
              <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>인원</th>
              <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>비율</th>
            </tr>
          </thead>
          <tbody>
            {TIER_ORDER.map((tier) => {
              const count = tierCounts[tier] ?? 0
              const pct = totalUsers > 0 ? ((count / totalUsers) * 100).toFixed(1) : '0.0'
              return (
                <tr key={tier} style={{ borderBottom: '1px solid #21262d' }}>
                  <td style={{ padding: '0.5rem 0' }}>{TIER_LABEL[tier]}</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem 0' }}>{count.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem 0', color: '#8b949e' }}>{pct}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      {/* 배치 이력 */}
      <section>
        <h2 style={{ fontSize: '1rem', color: '#8b949e', marginBottom: '1rem' }}>배치 실행 이력 (최근 10건)</h2>
        {batchLogs.length === 0 ? (
          <p style={{ color: '#8b949e', fontSize: '0.875rem' }}>배치 이력 없음</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #30363d', color: '#8b949e' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>실행 시각</th>
                <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>전체</th>
                <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>갱신</th>
                <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>스킵</th>
                <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>소요</th>
              </tr>
            </thead>
            <tbody>
              {batchLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #21262d' }}>
                  <td style={{ padding: '0.5rem 0', color: '#8b949e' }}>{formatDate(log.run_at)}</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem 0' }}>{log.total.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem 0', color: '#3fb950' }}>{log.updated.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem 0', color: log.skipped > 0 ? '#f85149' : '#8b949e' }}>{log.skipped.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem 0', color: '#8b949e' }}>{formatDuration(log.duration_sec)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}

function StatCard({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <div style={{
      padding: '1rem',
      background: '#161b22',
      border: `1px solid ${warn ? '#f85149' : '#30363d'}`,
      borderRadius: '6px',
    }}>
      <p style={{ fontSize: '0.75rem', color: '#8b949e', marginBottom: '0.25rem' }}>{label}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: warn ? '#f85149' : '#e6edf3' }}>{value}</p>
    </div>
  )
}
