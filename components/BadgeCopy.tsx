'use client'

import { useState } from 'react'

export function BadgeCopy({ username }: { username: string }) {
  const [copied, setCopied] = useState(false)
  const badgeUrl = `https://devtier.dev/api/badge/${username}`
  const markdown = `![DevTier](${badgeUrl})`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select the text
    }
  }

  return (
    <div className="w-full max-w-lg flex flex-col gap-3">
      <p className="text-sm text-[var(--text-sub)]">뱃지 코드 — GitHub README에 붙여넣기</p>
      <div
        className="
          flex items-center gap-2 px-4 py-3 rounded-md
          bg-[var(--surface)] border border-[var(--border)]
          font-mono text-xs text-[var(--text)] overflow-x-auto
        "
      >
        <span className="flex-1 whitespace-nowrap">{markdown}</span>
        <button
          onClick={handleCopy}
          className="
            shrink-0 px-3 py-1.5 rounded text-xs font-medium
            border transition-all duration-200 cursor-pointer
            active:scale-95
            "
          style={copied
            ? { background: '#1a4a2e', borderColor: '#2ea043', color: '#3fb950' }
            : { background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-sub)' }
          }
        >
          {copied ? '✓ 복사됨' : '복사'}
        </button>
      </div>
      <p className="text-xs text-[var(--text-sub)]">
        ⚠️ GitHub location을 한국으로 설정한 유저 기준 백분위입니다.
      </p>
    </div>
  )
}
