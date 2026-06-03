export const runtime = 'edge'

import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('users')
    .select('top_language')
    .not('top_language', 'is', null)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    const lang = row.top_language as string
    counts[lang] = (counts[lang] ?? 0) + 1
  }

  const languages = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([lang, count]) => ({ lang, count }))

  return Response.json({ languages })
}
