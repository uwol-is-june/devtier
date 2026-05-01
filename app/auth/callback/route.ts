import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=auth`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(`${origin}/?error=auth`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  const username = user?.user_metadata?.user_name as string | undefined

  if (!username) {
    return NextResponse.redirect(`${origin}/?error=auth`)
  }

  // 점수 즉시 수집 (실패해도 결과 페이지에서 재시도)
  await fetch(`${origin}/api/score/${encodeURIComponent(username)}`, {
    cache: 'no-store',
  }).catch(() => {})

  return NextResponse.redirect(`${origin}/result/${username}`)
}
