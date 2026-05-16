import { cache } from 'react'
import type { Metadata } from 'next'
import { getScoreData, getWeaknessPercentiles } from '@/lib/getScoreData'
import { createClient } from '@/lib/supabase-server'
import { ResultClient } from '@/app/_components/ResultClient'

const TIER_LABEL: Record<string, string> = {
  challenger: '챌린저',
  diamond:    '다이아',
  platinum:   '플래티넘',
  gold:       '골드',
  silver:     '실버',
  bronze:     '브론즈',
}

const fetchScore = cache(async (username: string) => {
  try {
    return await getScoreData(username)
  } catch {
    return null
  }
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const data = await fetchScore(username)

  if (!data) {
    return { title: `${username} — DevTier` }
  }

  const tierLabel = TIER_LABEL[data.tier] ?? data.tier
  const fullTierLabel = data.tier_rank ? `${tierLabel} ${data.tier_rank}` : tierLabel
  const title = `${data.github_id}의 DevTier — ${fullTierLabel} | ${data.score.toLocaleString('ko-KR')}점`
  const description = data.percentile !== null
    ? `수집된 한국 개발자 상위 ${data.percentile.toFixed(1)}% — GitHub 잔디로 측정한 개발자 전투력`
    : 'GitHub 잔디로 측정한 개발자 전투력'
  const badgeUrl = `https://devtier-brown.vercel.app/api/badge/${username}`
  const pageUrl = `https://devtier-brown.vercel.app/result/${username}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      images: [{ url: badgeUrl, width: 180, height: 56 }],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [badgeUrl],
    },
  }
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const [data, client, weaknessData] = await Promise.all([
    fetchScore(username),
    createClient(),
    getWeaknessPercentiles(username),
  ])
  const { data: { user } } = await client.auth.getUser()
  const loggedInId = user?.user_metadata?.user_name as string | undefined

  return <ResultClient username={username} data={data} loggedInId={loggedInId} weaknessData={weaknessData} />
}
