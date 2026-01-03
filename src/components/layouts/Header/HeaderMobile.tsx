"use client"

import { VStack, Link, Drawer, Button, Box } from "@chakra-ui/react"
import { FiMenu, FiX } from "react-icons/fi"
import { useAnchorNavigation } from "@/hooks/useAnchorNavigation"

export default function HeaderMobile({ items }: { items: { href: string; label: string; }[] }) {
  const { handleClick, isActive } = useAnchorNavigation()

  return (
    <Drawer.Root placement="start">
      <Drawer.Backdrop />
      <Drawer.Trigger asChild>
        <Button variant="ghost" size="lg" colorScheme="gray" borderRadius="full" px={4} py={8}>
          <FiMenu />
        </Button>
      </Drawer.Trigger>
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.CloseTrigger asChild>
            <Button
              variant="ghost"
              size="lg"
              colorScheme="gray"
              borderRadius="full"
              px={4}
              py={8}
              aria-label="メニューを閉じる"
            >
              <FiX />
            </Button>
          </Drawer.CloseTrigger>
          <Drawer.Header>
            <Drawer.Title>Page index</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <VStack align="start" gap={4} mt={4}>
              {items.map((item) => (
                <Box key={item.href} position="relative" width="100%">
                  <Link 
                    href={item.href}
                    onClick={(e) => handleClick(e, item.href)}
                    fontSize="lg"
                    fontWeight="medium"
                    px={3}
                    py={2}
                    display="block"
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
                      left={0}
                      top="50%"
                      transform="translateY(-50%)"
                      width="3px"
                      height="80%"
                      bg="blue.400"
                      borderRadius="full"
                      css={{
                        animation: "slideIn 0.3s ease",
                        "@keyframes slideIn": {
                          from: {
                            height: "0%",
                            opacity: 0
                          },
                          to: {
                            height: "80%",
                            opacity: 1
                          }
                        }
                      }}
                    />
                  )}
                </Box>
              ))}
            </VStack>
          </Drawer.Body>
          <Drawer.Footer />
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  )
}