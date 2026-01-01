// ブログカード（クライアントコンポーネント - アニメーション用）
"use client"

import { Box, Heading, Image as ChakraImage, Text, HStack, VStack, Card, Tag } from '@chakra-ui/react'
import NextImage from 'next/image'
import NextLink from 'next/link'
import type { PostMeta, BlogCategory } from '@/lib/posts'
import { useInView } from '@/hooks/useInView'

interface BlogCardProps {
  post: PostMeta
  index: number
  category: BlogCategory
}

export default function BlogCard({ post, index, category }: BlogCardProps) {
  const { ref, isInView } = useInView({ threshold: 0.1 })
  const isDaily = category === 'daily'

  return (
    <Box
      ref={ref}
      opacity={0}
      animation={isInView ? `fade-in 0.6s ease-in-out ${index * 0.1}s forwards` : undefined}
    >
      <Card.Root 
        overflow="hidden" 
        _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }} 
        transition="all 0.2s ease"
        bg={isDaily ? 'white' : 'gray.900'}
        borderColor={isDaily ? 'gray.200' : 'gray.800'}
      >
        <NextLink href={`/blog/${post.slug}`}>
          <Box>
            <Box position="relative" w="100%" h={{ base: '180px', md: '200px' }} bg={isDaily ? 'gray.100' : 'gray.900'}>
              {post.thumbnail ? (
                <NextImage
                  src={post.thumbnail}
                  alt={post.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <ChakraImage src="/images/blog/placeholder.svg" alt="thumbnail" w="100%" h="100%" objectFit="cover" />
              )}
            </Box>
            <Card.Body bg={isDaily ? 'white' : 'gray.900'}>
              <VStack align="start" gap={3}>
                <Heading size="md" color={isDaily ? 'gray.800' : 'white'}>{post.title}</Heading>
                {post.description && (
                  <Text color={isDaily ? 'gray.600' : 'gray.400'} lineClamp={3}>
                    {post.description}
                  </Text>
                )}
                {post.tags && post.tags.length > 0 && (
                  <HStack wrap="wrap">
                    {post.tags.map((tag) => (
                      <Tag.Root 
                        key={tag} 
                        variant="subtle" 
                        colorPalette="gray"
                      >
                        <Tag.Label>{tag}</Tag.Label>
                      </Tag.Root>
                    ))}
                  </HStack>
                )}
                <Text fontSize="sm" color="gray.500">
                  作成日時: {new Date(post.date).toLocaleDateString('ja-JP', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </VStack>
            </Card.Body>
          </Box>
        </NextLink>
      </Card.Root>
    </Box>
  )
}
