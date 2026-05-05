"use client"

import { Box, Flex, Heading, HStack, Link, Button } from "@chakra-ui/react"

export default function BlogHeader() {
  return (
    <Box
      as="header"
      w="100%"
      py={4}
      px={{ base: 4, md: 8 }}
      bg="rgba(0, 0, 0, 0.5)"
      backdropFilter="blur(10px)"
      position="sticky"
      top={0}
      zIndex={1000}
      borderBottomWidth="1px"
      borderColor="gray.700"
    >
      <Flex align="center" gap={4}>
        {/* Left: Title linking to blog home */}
        <Link href="/" _hover={{ textDecoration: "none", opacity: 0.9 }}>
          <Heading as="span" size="lg">Yuzuのブログ</Heading>
        </Link>

        {/* Right: Menu (for now only Profile) */}
        <HStack gap={3} ml="auto">
          <Link href="/portfolio#about">
            <Button variant="ghost" colorPalette="gray" size="md">Profile</Button>
          </Link>
        </HStack>
      </Flex>
    </Box>
  )
}
