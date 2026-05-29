'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { useT } from '@/context/LangContext'

export function LogoutButton() {
  const router = useRouter()
  const { t } = useT()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-[var(--text-sub)] hover:text-[var(--text)] transition-colors"
    >
      {t.logout.button}
    </button>
  )
}
