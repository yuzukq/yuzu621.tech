"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type Theme = "light" | "dark"

interface ScrollThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ScrollThemeContext = createContext<ScrollThemeContextType | undefined>(undefined)

export const ScrollThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("dark")

  return (
    <ScrollThemeContext.Provider value={{ theme, setTheme }}>
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
