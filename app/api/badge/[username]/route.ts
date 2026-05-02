export const runtime = 'edge'

import { generateBadgeSvg } from '@/lib/badge'
import { supabase } from '@/lib/supabase'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  const { data: row } = await supabase
    .from('users')
    .select('score, tier, tier_rank')
    .eq('github_id', username)
    .single()

  const svg = generateBadgeSvg({
    github_id: username,
    tier: row?.tier ?? 'bronze',
    tier_rank: row?.tier_rank ?? 4,
    score: row?.score ?? 0,
  })

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
    },
  })
}
