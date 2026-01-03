"use client"

import { HStack, Link, Box } from "@chakra-ui/react"
import { useAnchorNavigation } from "@/hooks/useAnchorNavigation"

export default function HeaderDesktop({ items }: { items: { href: string; label: string; }[] }) {
  const { handleClick, isActive } = useAnchorNavigation()

  return (
    <HStack gap={10} display={{ base: "none", md: "flex" }} justifyContent="center" py={2}>
      {items.map((item) => (
        <Box key={item.href} position="relative">
          <Link
            href={item.href}
            onClick={(e) => handleClick(e, item.href)}
            px={3}
            py={2}
            position="relative"
            _hover={{
              bg: "gray.900",
              transform: "translateY(-2px)",
              transition: "all 0.2s ease"
            }}
            transition="all 0.2s ease"
          >
            {item.label}
          </Link>
          {isActive(item.href) && (
            <Box
              position="absolute"
              bottom={0}
              left="50%"
              transform="translateX(-50%)"
              width="60%"
              height="2px"
              bg="blue.400"
              borderRadius="full"
              css={{
                animation: "slideIn 0.3s ease",
                "@keyframes slideIn": {
                  from: {
                    width: "0%",
                    opacity: 0
                  },
                  to: {
                    width: "60%",
                    opacity: 1
                  }
                }
              }}
            />
          )}
        </Box>
      ))}
    </HStack>
  )
}