'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Locale, Translations } from '@/lib/i18n'
import { ko, en } from '@/lib/i18n'

const translations: Record<Locale, Translations> = { ko, en }

type LangContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translations
}

const LangContext = createContext<LangContextValue>({
  locale: 'ko',
  setLocale: () => {},
  t: ko,
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ko')

  useEffect(() => {
    const saved = localStorage.getItem('devtier-locale') as Locale | null
    if (saved === 'ko' || saved === 'en') {
      setLocaleState(saved)
    }
  }, [])

  function setLocale(next: Locale) {
    setLocaleState(next)
    localStorage.setItem('devtier-locale', next)
    document.documentElement.lang = next === 'ko' ? 'ko' : 'en'
  }

  return (
    <LangContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LangContext.Provider>
  )
}

export function useT() {
  return useContext(LangContext)
}
