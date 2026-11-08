'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { translations, type Lang, type Translations } from './translations'

interface LangContextValue {
  lang: Lang
  t: Translations
  setLang: (l: Lang) => void
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({
  children,
  defaultLang = 'mr',
}: {
  children: ReactNode
  defaultLang?: Lang
}) {
  const [lang, setLangState] = useState<Lang>(defaultLang)

  const setLang = (l: Lang) => {
    setLangState(l)
    if (typeof window !== 'undefined') {
      localStorage.setItem('vispute_lang', l)
    }
  }

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
