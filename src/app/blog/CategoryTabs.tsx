// カテゴリ切り替えタブ（クライアントコンポーネント）
"use client"

import { HStack, Button } from '@chakra-ui/react'
import NextLink from 'next/link'
import type { BlogCategory } from '@/lib/posts'

interface CategoryTabsProps {
  currentCategory: BlogCategory
}

export default function CategoryTabs({ currentCategory }: CategoryTabsProps) {
  const isDaily = currentCategory === 'daily'

  return (
    <HStack gap={2}>
      <NextLink href="/blog?category=tech" scroll={false}>
        <Button
          variant={currentCategory === 'tech' ? 'solid' : 'outline'}
          colorPalette={currentCategory === 'tech' ? (isDaily ? 'gray' : 'cyan') : undefined}
          size="sm"
          borderRadius="full"
          color={currentCategory === 'tech' ? 'white' : (isDaily ? 'gray.700' : 'gray.300')}
          borderColor={isDaily ? 'gray.400' : 'gray.600'}
          bg={currentCategory === 'tech' ? undefined : 'transparent'}
          _hover={currentCategory === 'tech' ? undefined : {
            bg: isDaily ? 'gray.200' : 'whiteAlpha.200',
            color: isDaily ? 'gray.900' : 'white'
          }}
        >
          技術関連
        </Button>
      </NextLink>
      <NextLink href="/blog?category=daily" scroll={false}>
        <Button
          variant={currentCategory === 'daily' ? 'solid' : 'outline'}
          colorPalette={currentCategory === 'daily' ? (isDaily ? 'cyan' : 'gray') : undefined}
          size="sm"
          borderRadius="full"
          color={currentCategory === 'daily' ? 'white' : (isDaily ? 'gray.700' : 'gray.300')}
          borderColor={isDaily ? 'gray.400' : 'gray.600'}
          bg={currentCategory === 'daily' ? undefined : 'transparent'}
          _hover={currentCategory === 'daily' ? undefined : {
            bg: isDaily ? 'gray.200' : 'whiteAlpha.200',
            color: isDaily ? 'gray.900' : 'white'
          }}
        >
          日常
        </Button>
      </NextLink>
    </HStack>
  )
}
