export const runtime = 'edge'

import { supabase } from '@/lib/supabase'

export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('score_history')
    .select('score, recorded_at')
    .eq('github_id', username)
    .gte('recorded_at', since)
    .order('recorded_at', { ascending: true })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ history: data ?? [] })
}
