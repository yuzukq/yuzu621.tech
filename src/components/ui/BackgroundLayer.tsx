"use client"

import { Box } from "@chakra-ui/react"
import { useScrollTheme } from "@/context/ScrollThemeContext"

export const BackgroundLayer = () => {
  const { theme } = useScrollTheme()

  return (
    <Box position="fixed" top={0} left={0} right={0} bottom={0} zIndex={-1} pointerEvents="none">
      {/* Dark Theme Layer */}
      <Box
        position="absolute"
        inset={0}
        backgroundImage="linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(82, 93, 122, 0.66) 30%, rgba(0, 0, 0, 0.9) 100%)"
        opacity={theme === "dark" ? 1 : 0}
        transition="opacity 0.5s ease-in-out"
      />
      {/* Light Theme Layer */}
      <Box
        position="absolute"
        inset={0}
        backgroundImage="linear-gradient(to bottom, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0.78) 30%, rgba(255, 255, 255, 0.56) 100%)"
        opacity={theme === "light" ? 1 : 0}
        transition="opacity 0.5s ease-in-out"
      />
    </Box>
  )
}
