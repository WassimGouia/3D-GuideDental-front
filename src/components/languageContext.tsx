import { createContext, useContext, useState } from "react"

type Language = "english" | "french"

type LanguageProviderProps = {
  children: React.ReactNode
  defaultLanguage?: Language
}

type LanguageProviderState = {
  language: Language
  setLanguage: (language: Language) => void
}

const initialState: LanguageProviderState = {
  language: "english",
  setLanguage: () => null,
}

const LanguageProviderContext = createContext<LanguageProviderState>(initialState)

export function LanguageProvider({
  children,
  defaultLanguage = "english",
  ...props
}: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(defaultLanguage)

  const value = {
    language,
    setLanguage: (language: Language) => {
      setLanguage(language)
    },
  }

  return (
    <LanguageProviderContext.Provider {...props} value={value}>
      {children}
    </LanguageProviderContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageProviderContext)

  if (context === undefined)
    throw new Error("useLanguage must be used within a LanguageProvider")

  return context
}