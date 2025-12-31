// 記事一覧ページ
"use client"

import { useEffect, useState } from 'react'
import { Box, Heading, SimpleGrid, Image as ChakraImage, Text, HStack, VStack, Card, Tag, Button, Flex } from '@chakra-ui/react'
import NextImage from 'next/image'
import NextLink from 'next/link'
import type { PostMeta, BlogCategory } from '@/lib/posts'
import { useInView } from '@/hooks/useInView'

// カード用コンポーネント
function BlogCard({ post, index, category }: { post: PostMeta; index: number; category: BlogCategory }) {
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

export default function BlogIndexPage() {
  const [category, setCategory] = useState<BlogCategory>('tech')
  const [posts, setPosts] = useState<PostMeta[]>([])
  const [loading, setLoading] = useState(true)

  const isDaily = category === 'daily'

  // クライアントサイドでデータを取得
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/posts?category=${category}`)
        const data = await res.json()
        setPosts(data)
      } catch (error) {
        console.error('Failed to fetch posts:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [category])

  return (
    <Box 
      minH="100vh"
      bg={isDaily ? 'gray.50' : 'black'}
      transition="background-color 0.5s ease-in-out"
    >
      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 10, md: 16 }}>
        {/* ヘッダーとカテゴリ切り替え */}
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'start', md: 'center' }}
          mb={8}
          gap={4}
        >
          <Heading size="2xl" color={isDaily ? 'gray.800' : 'white'}>
            Blog
          </Heading>
          
          {/* カテゴリ切り替えボタン */}
          <HStack gap={2}>
            <Button
              variant={category === 'tech' ? 'solid' : 'outline'}
              colorPalette={category === 'tech' ? (isDaily ? 'gray' : 'cyan') : undefined}
              onClick={() => setCategory('tech')}
              size="sm"
              borderRadius="full"
              color={category === 'tech' ? 'white' : (isDaily ? 'gray.700' : 'gray.300')}
              borderColor={isDaily ? 'gray.400' : 'gray.600'}
              bg={category === 'tech' ? undefined : 'transparent'}
              _hover={category === 'tech' ? undefined : {
                bg: isDaily ? 'gray.200' : 'whiteAlpha.200',
                color: isDaily ? 'gray.900' : 'white'
              }}
            >
              技術関連
            </Button>
            <Button
              variant={category === 'daily' ? 'solid' : 'outline'}
              colorPalette={category === 'daily' ? (isDaily ? 'cyan' : 'gray') : undefined}
              onClick={() => setCategory('daily')}
              size="sm"
              borderRadius="full"
              color={category === 'daily' ? 'white' : (isDaily ? 'gray.700' : 'gray.300')}
              borderColor={isDaily ? 'gray.400' : 'gray.600'}
              bg={category === 'daily' ? undefined : 'transparent'}
              _hover={category === 'daily' ? undefined : {
                bg: isDaily ? 'gray.200' : 'whiteAlpha.200',
                color: isDaily ? 'gray.900' : 'white'
              }}
            >
              日常
            </Button>
          </HStack>
        </Flex>

        {/* 記事一覧 */}
        {loading ? (
          <Text color={isDaily ? 'gray.600' : 'gray.400'}>読み込み中...</Text>
        ) : posts.length === 0 ? (
          <Text color={isDaily ? 'gray.600' : 'gray.400'}>
            {category === 'tech' ? '技術記事' : '日常記事'}はまだありません。
          </Text>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={8}>
            {posts.map((post, index) => (
              <BlogCard key={post.slug} post={post} index={index} category={category} />
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  )
}
