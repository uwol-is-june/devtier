import { cache } from 'react'
import type { Metadata } from 'next'
import { getScoreData, getWeaknessPercentiles } from '@/lib/getScoreData'
import { CompareClient } from './CompareClient'

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
  params: Promise<{ user1: string; user2: string }>
}): Promise<Metadata> {
  const { user1, user2 } = await params
  const [data1, data2] = await Promise.all([fetchScore(user1), fetchScore(user2)])

  const title = `${user1} vs ${user2} — DevTier 전투력 비교`

  let description = 'GitHub 잔디로 측정한 개발자 전투력 비교'
  if (data1 && data2) {
    const tier1 = TIER_LABEL[data1.tier] ?? data1.tier
    const tier2 = TIER_LABEL[data2.tier] ?? data2.tier
    const gap = Math.abs(data1.score - data2.score)
    const winner = data1.score > data2.score ? user1 : data2.score > data1.score ? user2 : null
    description = winner
      ? `${winner}이 ${gap.toLocaleString('ko-KR')}점 앞섰습니다 · ${user1} ${tier1} ${data1.score.toLocaleString('ko-KR')}점 vs ${user2} ${tier2} ${data2.score.toLocaleString('ko-KR')}점`
      : `동점 DRAW · ${user1} ${tier1} ${data1.score.toLocaleString('ko-KR')}점 vs ${user2} ${tier2} ${data2.score.toLocaleString('ko-KR')}점`
  }

  const pageUrl = `https://devtier-brown.vercel.app/compare/${user1}/${user2}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ user1: string; user2: string }>
}) {
  const { user1, user2 } = await params
  const [data1, data2, weakness1, weakness2] = await Promise.all([
    fetchScore(user1),
    fetchScore(user2),
    getWeaknessPercentiles(user1),
    getWeaknessPercentiles(user2),
  ])

  return (
    <CompareClient
      user1={user1}
      user2={user2}
      data1={data1}
      data2={data2}
      weakness1={weakness1}
      weakness2={weakness2}
    />
  )
}
