import fs from 'fs'
import { supabase } from '@/lib/supabase'
import { fetchContributions } from '@/lib/github'
import { calcScore, detectSuspiciousActivity } from '@/lib/score'

const DB_CHUNK = 1000
const CONCURRENCY = 3
const GITHUB_DELAY_MS = 750
const RATE_LIMIT_DELAY_MS = 60_000
const CHECKPOINT_FILE = '.collect-checkpoint'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRetryable(msg: string): boolean {
  const lower = msg.toLowerCase()
  return (
    lower.includes('rate limit') ||
    lower.includes('canceled') ||
    lower.includes('cancelled') ||
    lower.includes('abort') ||
    lower.includes('ecanceled') ||
    lower.includes('socket hang up') ||
    lower.includes('econnreset') ||
    lower.includes('api error: 502') ||
    lower.includes('api error: 503') ||
    lower.includes('terminated')
  )
}

function loadCheckpoint(): Set<string> {
  try {
    const raw = fs.readFileSync(CHECKPOINT_FILE, 'utf-8')
    return new Set(JSON.parse(raw))
  } catch {
    return new Set()
  }
}

function saveCheckpoint(done: Set<string>) {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify([...done]))
}

async function fetchAllUsers(): Promise<{ id: number; github_id: string }[]> {
  const all: { id: number; github_id: string }[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('users')
      .select('id, github_id')
      .order('id')
      .range(from, from + DB_CHUNK - 1)
    if (error) throw new Error(error.message)
    if (!data || data.length === 0) break
    all.push(...data)
    if (data.length < DB_CHUNK) break
    from += DB_CHUNK
  }
  return all
}

async function processUser(github_id: string) {
  const stats = await fetchContributions(github_id)
  const score = calcScore(stats)
  const bot_score = detectSuspiciousActivity(stats)

  const now = new Date().toISOString()
  const { error } = await supabase.from('users').upsert(
    {
      github_id,
      score,
      total_contributions: stats.total_contributions,
      current_streak: stats.current_streak,
      longest_streak: stats.longest_streak,
      contribution_density: stats.contribution_density,
      peak_intensity: stats.peak_intensity,
      total_stars: stats.total_stars,
      current_year_commits: stats.current_year_commits,
      total_prs: stats.total_prs,
      total_issues: stats.total_issues,
      top_languages: stats.top_languages,
      contribution_cv: stats.contribution_cv,
      bot_score,
      updated_at: now,
    },
    { onConflict: 'github_id' },
  )
  if (error) throw new Error(error.message)

  try {
    await supabase.from('score_history').insert({ github_id, score, recorded_at: now })
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    await supabase.from('score_history').delete().eq('github_id', github_id).lt('recorded_at', cutoff)
  } catch { /* score_history 실패는 점수 저장에 영향 없음 */ }
}

async function main() {
  const startTime = Date.now()
  const users = await fetchAllUsers()
  const checkpoint = loadCheckpoint()

  const remaining = users.filter((u) => !checkpoint.has(u.github_id))
  console.log(
    `총 ${users.length}명 중 ${remaining.length}명 점수 계산 시작` +
      (checkpoint.size > 0 ? ` (체크포인트: ${checkpoint.size}명 건너뜀)` : ''),
  )

  const failed: string[] = []
  const retryQueue: typeof users = []
  let processed = 0

  for (let i = 0; i < remaining.length; i += CONCURRENCY) {
    const batch = remaining.slice(i, i + CONCURRENCY)
    const results = await Promise.allSettled(batch.map(u => processUser(u.github_id)))

    for (let j = 0; j < batch.length; j++) {
      const user = batch[j]
      const result = results[j]
      if (result.status === 'fulfilled') {
        checkpoint.add(user.github_id)
        processed++
        if (processed % 100 === 0) {
          saveCheckpoint(checkpoint)
          console.log(`${checkpoint.size}/${users.length} 완료 (실패: ${failed.length}, 재시도 대기: ${retryQueue.length})`)
        }
      } else {
        const msg = result.reason instanceof Error ? result.reason.message : String(result.reason)
        if (isRetryable(msg)) {
          retryQueue.push(user)
          console.warn(`  [RETRY] ${user.github_id} → 재시도 큐 (${retryQueue.length}명): ${msg}`)
        } else {
          console.warn(`[SKIP] ${user.github_id}: ${msg}`)
          failed.push(user.github_id)
        }
      }
    }

    await delay(GITHUB_DELAY_MS)
  }

  if (retryQueue.length > 0) {
    console.log(`\n재시도 큐 ${retryQueue.length}명 — ${RATE_LIMIT_DELAY_MS / 1000}초 대기 중...`)
    await delay(RATE_LIMIT_DELAY_MS)
    for (const user of retryQueue) {
      try {
        await processUser(user.github_id)
        checkpoint.add(user.github_id)
        processed++
        console.log(`  [재시도 성공] ${user.github_id}`)
        await delay(GITHUB_DELAY_MS)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.warn(`[재시도 실패] ${user.github_id}: ${msg}`)
        failed.push(user.github_id)
      }
    }
  }

  console.log(`\n완료: ${processed}명 성공, ${failed.length}명 실패`)
  if (failed.length > 0) {
    console.log('실패 목록:', failed.join(', '))
  }

  const duration = Math.round((Date.now() - startTime) / 1000)
  const { error: logError } = await supabase.from('batch_logs').insert({
    total: users.length,
    updated: processed,
    skipped: failed.length,
    duration_sec: duration,
  })
  if (logError) console.warn('batch_logs 기록 실패:', logError.message)
  else console.log(`배치 로그 기록 완료 (소요: ${duration}초)`)

  fs.rmSync(CHECKPOINT_FILE, { force: true })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
