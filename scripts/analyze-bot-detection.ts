// 읽기 전용 분석 스크립트 — DB/파일 수정 없음
// 상위 N명의 GitHub 캘린더를 재조회해 봇 탐지 신호 3종 계산 후 랭킹 변화 시뮬레이션

import { supabase } from '@/lib/supabase'

const TOP_N = 100
const CONCURRENCY = 3
const DELAY_MS = 750

const CALENDAR_QUERY = `
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        weeks {
          contributionDays { contributionCount }
        }
      }
    }
  }
}
`

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchCV(username: string): Promise<number | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30_000)
  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({ query: CALENDAR_QUERY, variables: { username } }),
      signal: controller.signal,
    })
    if (!res.ok) return null
    const json = await res.json()
    if (!json.data?.user) return null

    const counts: number[] = json.data.user.contributionsCollection.contributionCalendar.weeks
      .flatMap((w: { contributionDays: { contributionCount: number }[] }) =>
        w.contributionDays.map((d) => d.contributionCount)
      )
      .filter((c: number) => c > 0)

    if (counts.length < 2) return 0
    const mean = counts.reduce((s, v) => s + v, 0) / counts.length
    const variance = counts.reduce((s, v) => s + (v - mean) ** 2, 0) / counts.length
    return mean > 0 ? Math.sqrt(variance) / mean : 0
  } catch {
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

function computeQuality(
  total_contributions: number,
  total_prs: number,
  total_stars: number,
  cv: number | null,
): { multiplier: number; collab_cv: number; stars: number } {
  // Signal 1+2: PR 절대값 + CV 결합
  // PR 수가 충분하면 CV 무관하게 정상, PR=0이면 CV로 솔로 개발자 vs 봇 구분
  let collab_cv: number
  if (total_prs >= 5) {
    collab_cv = 1.0
  } else if (total_prs >= 1) {
    collab_cv = 0.85
  } else {
    // PR = 0: CV로 판단
    if (cv === null || total_contributions < 30) {
      collab_cv = 0.75  // CV 계산 불가 → 약한 의심
    } else if (cv >= 1.0) {
      collab_cv = 0.85  // 다양한 커밋 분포 → 솔로 개발자
    } else if (cv >= 0.5) {
      collab_cv = 0.70  // 다소 균일 → 약한 의심
    } else {
      collab_cv = 0.40  // 매우 균일 → 봇 강의심
    }
  }

  // Signal 3: 스타 신뢰도
  let stars = 1.0
  if (total_contributions > 200 && total_stars === 0 && total_prs === 0) stars = 0.5
  else if (total_contributions > 200 && total_stars === 0) stars = 0.75

  const multiplier = Math.max(0.1, Math.min(1.0, collab_cv * stars))
  return { multiplier, collab_cv, stars }
}

async function main() {
  const { data: users, error } = await supabase
    .from('users')
    .select('github_id, score, total_contributions, total_prs, total_issues, total_stars, tier, tier_rank')
    .order('score', { ascending: false })
    .limit(TOP_N)

  if (error || !users) {
    console.error('DB 조회 실패:', error?.message)
    process.exit(1)
  }

  console.log(`\n상위 ${users.length}명 분석 중 (GitHub API CV 조회 포함)...\n`)

  type Result = {
    rank: number
    github_id: string
    score: number
    adjusted_score: number
    multiplier: number
    cv: number | null
    collab_cv: number
    stars: number
    total_prs: number
    total_issues: number
    total_contributions: number
    total_stars: number
  }

  const results: Result[] = []

  for (let i = 0; i < users.length; i += CONCURRENCY) {
    const batch = users.slice(i, i + CONCURRENCY)
    const batchResults = await Promise.all(
      batch.map(async (u, bi): Promise<Result> => {
        const rank = i + bi + 1
        const cv = await fetchCV(u.github_id)
        const { multiplier, collab_cv, stars } = computeQuality(
          u.total_contributions ?? 0,
          u.total_prs ?? 0,
          u.total_stars ?? 0,
          cv,
        )
        return {
          rank,
          github_id: u.github_id,
          score: u.score,
          adjusted_score: Math.round(u.score * multiplier),
          multiplier,
          cv,
          collab_cv,
          stars,
          total_prs: u.total_prs ?? 0,
          total_issues: u.total_issues ?? 0,
          total_contributions: u.total_contributions ?? 0,
          total_stars: u.total_stars ?? 0,
        }
      }),
    )
    results.push(...batchResults)
    process.stdout.write(`\r  ${Math.min(i + CONCURRENCY, users.length)}/${users.length} 처리 중...`)
    if (i + CONCURRENCY < users.length) await delay(DELAY_MS)
  }

  console.log('\n')
  const sep = '─'.repeat(110)

  // 의심 계정
  const flagged = results.filter((r) => r.multiplier < 0.7).sort((a, b) => a.multiplier - b.multiplier)
  console.log(`[의심 계정] multiplier < 0.7 : ${flagged.length}명\n`)
  console.log('현재순위 | GitHub ID               | 점수    | 보정점수 | 배수  | CV    | 협업  | 스타  | PR   | 이슈  | 잔디')
  console.log(sep)
  for (const r of flagged) {
    const cvStr = r.cv !== null ? r.cv.toFixed(2) : 'N/A '
    console.log(
      `#${String(r.rank).padStart(3)}    | ${r.github_id.padEnd(23)} | ${String(r.score).padStart(7)} | ${String(r.adjusted_score).padStart(8)} | ${r.multiplier.toFixed(2)} | ${cvStr} | ${r.collab_cv.toFixed(2)} | ${r.stars.toFixed(2)} | ${String(r.total_prs).padStart(4)} | ${String(r.total_issues).padStart(5)} | ${r.total_contributions}`,
    )
  }

  // 상위 20명 순위 변화
  const adjusted = [...results].sort((a, b) => b.adjusted_score - a.adjusted_score)
  console.log(`\n\n[상위 20명 순위 변화]\n`)
  console.log('현재순위 → 보정순위 | GitHub ID               | 현재점수  | 보정점수  | 배수  | 변화')
  console.log(sep)
  for (const r of results.slice(0, 20)) {
    const newRank = adjusted.findIndex((a) => a.github_id === r.github_id) + 1
    const diff = r.rank - newRank
    const changeStr = diff > 0 ? `▲${diff}` : diff < 0 ? `▼${Math.abs(diff)}` : '─'
    console.log(
      `#${String(r.rank).padStart(3)} → #${String(newRank).padStart(3)}      | ${r.github_id.padEnd(23)} | ${String(r.score).padStart(9)} | ${String(r.adjusted_score).padStart(9)} | ${r.multiplier.toFixed(2)} | ${changeStr}`,
    )
  }

  // multiplier 분포
  const buckets: Record<string, number> = { '0.1~0.3': 0, '0.3~0.5': 0, '0.5~0.7': 0, '0.7~0.9': 0, '0.9~1.0': 0 }
  for (const r of results) {
    if (r.multiplier <= 0.3) buckets['0.1~0.3']++
    else if (r.multiplier <= 0.5) buckets['0.3~0.5']++
    else if (r.multiplier <= 0.7) buckets['0.5~0.7']++
    else if (r.multiplier <= 0.9) buckets['0.7~0.9']++
    else buckets['0.9~1.0']++
  }
  console.log('\n\n[multiplier 분포]')
  for (const [range, count] of Object.entries(buckets)) {
    console.log(`  ${range}: ${'█'.repeat(count)} (${count}명)`)
  }
  console.log()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
