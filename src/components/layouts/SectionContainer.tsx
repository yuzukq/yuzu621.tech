"use client"

import { Box } from "@chakra-ui/react"
import { ReactNode, useEffect } from "react"
import { useInView } from "@/hooks/useInView"
import { useScrollTheme } from "@/context/ScrollThemeContext"

interface SectionContainerProps {
  backgroundColor: "light" | "dark"
  id: string
  children: ReactNode
}

export const SectionContainer = ({backgroundColor, id, children}: SectionContainerProps) => {
  const { ref, isInView } = useInView({ 
    threshold: 0,
    rootMargin: "-45% 0px -45% 0px", // 画面中央付近で切り替え
    triggerOnce: false 
  })
  const { setTheme, setCurrentSection } = useScrollTheme()

  useEffect(() => {
    if (isInView) {
      setTheme(backgroundColor)
      setCurrentSection(id)
    }
  }, [isInView, backgroundColor, id, setTheme, setCurrentSection])

  return (
    <Box
      ref={ref}
      minH="100vh"
      id={id}
      as="section"
      position="relative"
      overflow="hidden">
      {children}
    </Box>
  )
}