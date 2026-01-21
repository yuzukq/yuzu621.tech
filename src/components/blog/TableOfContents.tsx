'use client'

import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { Box, Text, VStack, IconButton, Portal } from '@chakra-ui/react'
import { useIsMobile } from '@/hooks/useIsMobile'
import type { TocItem } from '@/lib/extractToc'

export type { TocItem }

type TableOfContentsProps = {
  items: TocItem[]
  isDaily: boolean
}

// モバイル用フローティングボタンアイコン
const TocIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="15" y2="12" />
    <line x1="3" y1="18" x2="18" y2="18" />
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

// スタイルのハンドリング
const getThemeStyles = (isDaily: boolean) => ({
  // PCサイドバー
  sidebarBg: isDaily ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.65)',
  sidebarBorder: isDaily ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
  titleColor: isDaily ? 'gray.700' : 'gray.300',
  textColor: isDaily ? 'gray.500' : 'gray.500',
  activeColor: isDaily ? 'gray.900' : 'white',
  activeBg: isDaily ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
  activeIndicator: isDaily ? 'gray.800' : 'white',
  hoverBg: isDaily ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.04)',
  // モバイル ボタン・ドロワー
  fabBg: isDaily ? 'white' : 'gray.900',
  fabColor: isDaily ? 'gray.700' : 'white',
  fabShadow: isDaily
    ? '0 4px 20px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)'
    : '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
  drawerBg: isDaily ? 'white' : 'gray.900',
  overlayBg: isDaily ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.6)',
})

export function TableOfContents({ items, isDaily }: TableOfContentsProps) {
  const isMobile = useIsMobile()
  const [activeId, setActiveId] = useState<string>('')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const theme = useMemo(() => getThemeStyles(isDaily), [isDaily])

  // ドロワーのアニメーション制御
  useEffect(() => {
    if (isDrawerOpen) {
      setIsDrawerVisible(true)
    }
  }, [isDrawerOpen])

  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false)
    // アニメーション後に非表示
    setTimeout(() => {
      setIsDrawerVisible(false)
    }, 300)
  }, [])

  // スクロール追従でアクティブなセクションを検出
  useEffect(() => {
    if (items.length === 0) return

    const handleScroll = () => {
      
      setIsScrolling(true)
      
      const headings = items
        .map((item) => document.getElementById(item.id))
        .filter((el): el is HTMLElement => el !== null)

      if (headings.length === 0) return

      // 画面上部から少し下の位置で判定
      const scrollTop = window.scrollY + 120

      let currentActive = items[0]?.id || ''

      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i]
        if (heading.offsetTop <= scrollTop) {
          currentActive = heading.id
          break
        }
      }

      setActiveId(currentActive)
    }

    // スクロール終了を検出
    let scrollTimeout: NodeJS.Timeout
    const handleScrollEnd = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
    }

    const combinedHandler = () => {
      handleScroll()
      handleScrollEnd()
    }

    window.addEventListener('scroll', combinedHandler, { passive: true })
    handleScroll() // 初期位置を設定

    return () => {
      window.removeEventListener('scroll', combinedHandler)
      clearTimeout(scrollTimeout)
    }
  }, [items])

  const handleClick = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top: y, behavior: 'smooth' })
      setActiveId(id)
      if (isDrawerOpen) {
        handleDrawerClose()
      }
    }
  }, [isDrawerOpen, handleDrawerClose])

  // 目次アイテムがない場合は何も表示しない
  if (items.length === 0) return null

  // PC用サイドバー
  if (!isMobile) {
    return (
      <Box
        as="nav"
        position="fixed"
        top="120px"
        right={{ base: '16px', lg: '24px', xl: 'calc((100vw - 900px) / 2 - 280px)' }}
        width="240px"
        maxH="calc(100vh - 160px)"
        overflowY="auto"
        display={{ base: 'none', lg: 'block' }}
        p={4}
        borderRadius="12px"
        bg={theme.sidebarBg}
        border="1px solid"
        borderColor={theme.sidebarBorder}
        backdropFilter="blur(12px)"
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: isDaily ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)',
            borderRadius: '4px',
          },
        }}
      >
        <Text
          fontSize="11px"
          fontWeight="700"
          textTransform="uppercase"
          letterSpacing="0.1em"
          color={theme.titleColor}
          mb={3}
          pl={3}
        >
          目次
        </Text>
        <VStack align="stretch" gap={0}>
          {items.map((item) => {
            const isActive = activeId === item.id
            const indent = (item.level - 1) * 12
            
            return (
              <Box
                key={item.id}
                as="button"
                onClick={() => handleClick(item.id)}
                position="relative"
                textAlign="left"
                py={2}
                pl={`${12 + indent}px`}
                pr={3}
                borderRadius="6px"
                bg={isActive ? theme.activeBg : 'transparent'}
                color={isActive ? theme.activeColor : theme.textColor}
                fontSize={item.level === 1 ? '13px' : '12px'}
                fontWeight={isActive ? 600 : 400}
                lineHeight="1.5"
                transition="all 0.2s ease"
                cursor="pointer"
                _hover={{
                  bg: isActive ? theme.activeBg : theme.hoverBg,
                  color: isActive ? theme.activeColor : (isDaily ? 'gray.700' : 'gray.300'),
                }}
                css={{
                  '&::before': isActive ? {
                    content: '""',
                    position: 'absolute',
                    left: '0',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px',
                    height: '16px',
                    backgroundColor: isDaily ? '#1a202c' : 'white',
                    borderRadius: '2px',
                  } : {},
                }}
              >
                <Text
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {item.text}
                </Text>
              </Box>
            )
          })}
        </VStack>
      </Box>
    )
  }

  // モバイル用フローティングボタン + ドロワー
  return (
    <>
      {/* フローティングボタン */}
      <Box
        position="fixed"
        bottom="24px"
        right="20px"
        zIndex={1000}
        opacity={isScrolling ? 0.5 : 1}
        transform="scale(1)"
        transition="opacity 0.2s ease, transform 0.2s ease"
        css={{
          '@keyframes fadeInScale': {
            from: { opacity: 0, transform: 'scale(0.8)' },
            to: { opacity: 1, transform: 'scale(1)' },
          },
          animation: 'fadeInScale 0.3s ease forwards',
        }}
      >
        <IconButton
          aria-label="目次を開く"
          onClick={() => setIsDrawerOpen(true)}
          size="lg"
          borderRadius="full"
          bg={theme.fabBg}
          color={theme.fabColor}
          boxShadow={theme.fabShadow}
          _hover={{
            transform: 'scale(1.05)',
          }}
          _active={{
            transform: 'scale(0.95)',
          }}
          transition="all 0.2s ease"
        >
          <TocIcon />
        </IconButton>
      </Box>

      {/* ドロワーオーバーレイ */}
      {isDrawerVisible && (
        <Portal>
          {/* バックドロップ */}
          <Box
            position="fixed"
            inset={0}
            bg={theme.overlayBg}
            zIndex={1100}
            opacity={isDrawerOpen ? 1 : 0}
            transition="opacity 0.25s ease"
            onClick={handleDrawerClose}
          />
          {/* ドロワー本体 */}
          <Box
            ref={drawerRef}
            position="fixed"
            bottom={0}
            left={0}
            right={0}
            zIndex={1101}
            bg={isDaily ? 'white' : 'gray.900'}
            borderTopRadius="20px"
            maxH="70vh"
            overflow="hidden"
            transform={isDrawerOpen ? 'translateY(0)' : 'translateY(100%)'}
            transition="transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)"
          >
            {/* ドロワーハンドル */}
            <Box
              py={3}
              display="flex"
              justifyContent="center"
            >
              <Box
                w="40px"
                h="4px"
                bg={isDaily ? 'gray.300' : 'gray.600'}
                borderRadius="full"
              />
            </Box>
            
            {/* ヘッダー */}
            <Box
              px={5}
              pb={3}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              borderBottom="1px solid"
              borderColor={isDaily ? 'gray.100' : 'gray.800'}
            >
              <Text
                fontSize="15px"
                fontWeight="700"
                color={isDaily ? 'gray.800' : 'white'}
              >
                目次
              </Text>
              <IconButton
                aria-label="閉じる"
                onClick={handleDrawerClose}
                size="sm"
                variant="ghost"
                borderRadius="full"
                color={isDaily ? 'gray.500' : 'gray.400'}
                _hover={{
                  bg: isDaily ? 'gray.100' : 'gray.800',
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* 目次リスト */}
            <Box
              px={4}
              py={4}
              overflowY="auto"
              maxH="calc(70vh - 100px)"
              css={{
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: isDaily ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)',
                  borderRadius: '4px',
                },
              }}
            >
              <VStack align="stretch" gap={0}>
                {items.map((item) => {
                  const isActive = activeId === item.id
                  const indent = (item.level - 1) * 16
                  
                  return (
                    <Box
                      key={item.id}
                      as="button"
                      onClick={() => handleClick(item.id)}
                      position="relative"
                      textAlign="left"
                      py={3}
                      pl={`${16 + indent}px`}
                      pr={4}
                      borderRadius="8px"
                      bg={isActive ? theme.activeBg : 'transparent'}
                      color={isActive ? theme.activeColor : theme.textColor}
                      fontSize="14px"
                      fontWeight={isActive ? 600 : 400}
                      lineHeight="1.5"
                      transition="all 0.15s ease"
                      cursor="pointer"
                      _active={{
                        bg: theme.activeBg,
                      }}
                      css={{
                        '&::before': isActive ? {
                          content: '""',
                          position: 'absolute',
                          left: '0',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '3px',
                          height: '20px',
                          backgroundColor: isDaily ? '#1a202c' : 'white',
                          borderRadius: '2px',
                        } : {},
                      }}
                    >
                      <Text
                        overflow="hidden"
                        textOverflow="ellipsis"
                        display="-webkit-box"
                        css={{
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {item.text}
                      </Text>
                    </Box>
                  )
                })}
              </VStack>
            </Box>
          </Box>
        </Portal>
      )}
    </>
  )
}
