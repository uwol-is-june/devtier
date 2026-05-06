'use client'

import { useState } from 'react'

type Theme = 'dark' | 'light'
type Size  = 'sm' | 'md' | 'lg'
type Align = 'left' | 'center' | 'right'

const THEME_OPTIONS: [Theme, string][] = [['dark', '다크'], ['light', '라이트']]
const SIZE_OPTIONS:  [Size,  string][] = [['sm', '작게'], ['md', '보통'], ['lg', '크게']]
const ALIGN_OPTIONS: [Align, string][] = [['left', '왼쪽'], ['center', '가운데'], ['right', '오른쪽']]

const BASE = 'https://devtier-brown.vercel.app'

export function BadgeCopy({ username }: { username: string }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [size,  setSize]  = useState<Size>('md')
  const [align, setAlign] = useState<Align>('left')
  const [copied, setCopied] = useState(false)

  const previewUrl = `/api/badge/${username}?theme=${theme}&size=${size}`
  const badgeUrl   = `${BASE}/api/badge/${username}?theme=${theme}&size=${size}`
  const resultUrl  = `${BASE}/result/${username}`

  const markdown =
    align === 'center' ? `<p align="center"><a href="${resultUrl}"><img src="${badgeUrl}" alt="DevTier" /></a></p>` :
    align === 'right'  ? `<p align="right"><a href="${resultUrl}"><img src="${badgeUrl}" alt="DevTier" /></a></p>` :
                         `[![DevTier](${badgeUrl})](${resultUrl})`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  function segBtn(active: boolean) {
    return {
      background:   'transparent',
      borderColor:  active ? 'var(--text)' : 'var(--border)',
      color:        active ? 'var(--text)'  : 'var(--text-sub)',
    } as const
  }

  return (
    <div className="w-full max-w-lg flex flex-col gap-4">
      <p className="text-sm text-[var(--text-sub)]">뱃지 코드 — GitHub README에 붙여넣기</p>

      {/* ── 옵션 ── */}
      <div className="flex flex-col gap-2.5">
        {([
          ['테마', THEME_OPTIONS, theme,  setTheme],
          ['크기', SIZE_OPTIONS,  size,   setSize],
          ['정렬', ALIGN_OPTIONS, align,  setAlign],
        ] as const).map(([label, opts, val, setter]) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-sub)] w-7 shrink-0">{label}</span>
            <div className="flex gap-1 flex-wrap">
              {(opts as [string, string][]).map(([v, display]) => (
                <button
                  key={v}
                  onClick={() => (setter as (x: string) => void)(v)}
                  className="px-3 py-1 rounded text-xs font-medium border transition-colors duration-150 cursor-pointer"
                  style={segBtn(val === v)}
                >
                  {display}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── 미리보기 ── */}
      <div
        className="rounded-md p-4 flex transition-colors duration-200"
        style={{
          background:   'var(--surface)',
          border:       '1px solid var(--border)',
          justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={previewUrl} alt="DevTier badge preview" />
      </div>

      {/* ── 마크다운 코드 ── */}
      <div className="px-4 py-3 rounded-md bg-[var(--surface)] border border-[var(--border)] font-mono text-xs text-[var(--text)] overflow-x-auto">
        <span className="whitespace-nowrap">{markdown}</span>
      </div>

      {/* ── 복사 버튼 ── */}
      <div className="flex justify-end">
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded text-xs font-medium border transition-all duration-200 cursor-pointer active:scale-95"
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
