'use client'

import { useState, useRef, useEffect } from 'react'

export function StatTooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!visible) return
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setVisible(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [visible])

  return (
    <span ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible(v => !v)}
        className="flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-bold leading-none cursor-pointer select-none"
        style={{ background: 'var(--border)', color: 'var(--text-sub)' }}
        aria-label="설명 보기"
      >
        ?
      </button>
      {visible && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-10 w-max max-w-[180px] px-2.5 py-1.5 rounded text-xs leading-snug pointer-events-none"
          style={{
            background: '#21262d',
            border: '1px solid var(--border)',
            color: 'var(--text-sub)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          {text}
          <span
            className="absolute top-full left-1/2 -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid #30363d',
            }}
          />
        </span>
      )}
    </span>
  )
}
