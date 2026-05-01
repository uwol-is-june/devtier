import { supabase } from '@/lib/supabase'

const QUERIES = [
  { q: 'location:Korea', sort: 'followers' },
  { q: 'location:Korea', sort: 'repositories' },
  { q: 'location:Seoul', sort: 'followers' },
  { q: 'location:한국', sort: 'followers' },
]
const PER_PAGE = 100
const MAX_PAGES = 10
const PAGE_DELAY_MS = 2500
const UPSERT_CHUNK = 500

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchSearchPage(q: string, sort: string, page: number): Promise<string[]> {
  const url = `https://api.github.com/search/users?q=${encodeURIComponent(q)}&sort=${sort}&order=desc&per_page=${PER_PAGE}&page=${page}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get('Retry-After') ?? '60', 10)
    console.warn(`  Rate limit 429 → ${retryAfter}초 대기`)
    await delay(retryAfter * 1000)
    return fetchSearchPage(q, sort, page)
  }

  if (!res.ok) throw new Error(`Search API ${res.status}: ${await res.text()}`)

  const json = await res.json()
  return (json.items as { login: string }[]).map((u) => u.login)
}

async function collectQuery(q: string, sort: string, collected: Set<string>) {
  for (let page = 1; page <= MAX_PAGES; page++) {
    const logins = await fetchSearchPage(q, sort, page)
    logins.forEach((l) => collected.add(l))
    console.log(`  [${q} sort:${sort}] page ${page}: ${logins.length}명 (누적 고유: ${collected.size})`)
    if (logins.length < PER_PAGE) break
    if (page < MAX_PAGES) await delay(PAGE_DELAY_MS)
  }
}

async function upsertUsers(logins: string[]) {
  for (let i = 0; i < logins.length; i += UPSERT_CHUNK) {
    const chunk = logins.slice(i, i + UPSERT_CHUNK).map((github_id) => ({ github_id }))
    const { error } = await supabase
      .from('users')
      .upsert(chunk, { onConflict: 'github_id', ignoreDuplicates: true })
    if (error) throw new Error(`Supabase upsert 실패: ${error.message}`)
    console.log(`  upsert ${Math.min(i + UPSERT_CHUNK, logins.length)}/${logins.length}`)
  }
}

async function main() {
  const collected = new Set<string>()

  for (const { q, sort } of QUERIES) {
    console.log(`\n[쿼리] ${q} sort:${sort}`)
    await collectQuery(q, sort, collected)
    await delay(PAGE_DELAY_MS)
  }

  console.log(`\n총 고유 유저: ${collected.size}명`)
  await upsertUsers([...collected])
  console.log('완료')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
