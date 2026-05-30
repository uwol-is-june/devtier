import { after } from 'next/server'
import { generateBadgeSvg } from '@/lib/badge'
import { supabase } from '@/lib/supabase'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const isCamo = req.headers.get('user-agent')?.toLowerCase().includes('github-camo') ?? false

  const { searchParams } = new URL(req.url)
  const rawTheme = searchParams.get('theme')
  const rawSize  = searchParams.get('size')
  const rawLang  = searchParams.get('lang')
  const theme = rawTheme === 'light' ? 'light' : 'dark'
  const size  = rawSize === 'sm' ? 'sm' : rawSize === 'lg' ? 'lg' : 'md'
  const lang  = rawLang === 'en' ? 'en' : 'ko'

  const { data: row } = await supabase
    .from('users')
    .select('score, tier, tier_rank, percentile')
    .eq('github_id', username)
    .single()

  const svg = generateBadgeSvg({
    github_id: username,
    tier: row?.tier ?? 'bronze',
    tier_rank: row?.tier_rank ?? 4,
    score: row?.score ?? 0,
    percentile: row?.percentile ?? null,
    theme,
    size,
    lang,
  })

  if (isCamo && row !== null) {
    after(async () => {
      await supabase.from('user_achievements').upsert(
        { github_id: username, achievement_id: 'badge_live', unlocked_at: new Date().toISOString() },
        { onConflict: 'github_id,achievement_id', ignoreDuplicates: true }
      )
    })
  }

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache',
    },
  })
}
