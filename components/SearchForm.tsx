'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useT } from '@/context/LangContext'

export function SearchForm() {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useT()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const username = value.trim()
    if (!username) return
    setLoading(true)
    router.push(`/result/${encodeURIComponent(username)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t.search.placeholder}
        autoComplete="off"
        spellCheck={false}
        className="
          flex-1 px-4 py-3 rounded-md text-sm
          bg-[var(--surface)] text-[var(--text)]
          border border-[var(--border)]
          placeholder:text-[var(--text-sub)]
          outline-none
          transition-all duration-200
          focus:border-[#58a6ff]
          focus:shadow-[0_0_0_3px_rgba(88,166,255,0.15)]
        "
      />
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="
          px-5 py-3 rounded-md text-sm font-medium
          bg-[#238636] text-white
          border border-[#2ea043]
          transition-all duration-200
          hover:bg-[#2ea043] hover:shadow-[0_0_12px_rgba(46,160,67,0.4)]
          active:scale-95
          disabled:opacity-40 disabled:cursor-not-allowed
          cursor-pointer
        "
      >
        {loading ? t.search.loading : t.search.button}
      </button>
    </form>
  )
}
