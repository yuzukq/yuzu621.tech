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
          <Box
            position="absolute"
            bottom={0}
            left="50%"
            transform="translateX(-50%)"
            width={isActive(item.href) ? "60%" : "0%"}
            opacity={isActive(item.href) ? 1 : 0}
            height="2px"
            bg="blue.400"
            borderRadius="full"
            transition="width 0.3s ease, opacity 0.3s ease"
          />
        </Box>
      ))}
    </HStack>
  )
}