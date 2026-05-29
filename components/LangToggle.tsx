'use client'

import { useT } from '@/context/LangContext'
import type { Locale } from '@/lib/i18n'

export function LangToggle() {
  const { locale, setLocale } = useT()

  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {(['ko', 'en'] as Locale[]).map((lang) => (
        <button
          key={lang}
          onClick={() => setLocale(lang)}
          style={{
            fontFamily: 'var(--font-orbitron), monospace',
            fontSize: '0.52rem',
            letterSpacing: '0.12em',
            fontWeight: locale === lang ? 700 : 400,
            color: locale === lang ? '#7CFF5B' : 'rgba(255,255,255,0.3)',
            background: 'none',
            border: locale === lang ? '1px solid rgba(124,255,91,0.4)' : '1px solid transparent',
            padding: '0.25rem 0.5rem',
            borderRadius: '3px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
