"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type Theme = "light" | "dark"

interface ScrollThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  currentSection: string
  setCurrentSection: (section: string) => void
}

const ScrollThemeContext = createContext<ScrollThemeContextType | undefined>(undefined)

export const ScrollThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("dark")
  const [currentSection, setCurrentSection] = useState<string>("top")

  return (
    <ScrollThemeContext.Provider value={{ theme, setTheme, currentSection, setCurrentSection }}>
      {children}
    </ScrollThemeContext.Provider>
  )
}

export const useScrollTheme = () => {
  const context = useContext(ScrollThemeContext)
  if (!context) {
    throw new Error("useScrollTheme must be used within ScrollThemeProvider")
  }
  return context
}
