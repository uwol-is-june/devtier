import { createClient } from '@/lib/supabase-server'
import { supabase } from '@/lib/supabase'
import HomeClient from './_components/HomeClient'

type MyData = {
  github_id: string
  score: number
  tier: string
  tier_rank: number | null
  percentile: number | null
  rank: number | null
}

async function getRanking() {
  const [{ data }, { count: total }] = await Promise.all([
    supabase
      .from('users')
      .select('github_id, score, tier, tier_rank, percentile')
      .order('score', { ascending: false })
      .limit(20),
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
    <HomeClient
      myData={myData}
      ranking={ranking}
      rankingTotal={rankingTotal}
    />
  )
}
