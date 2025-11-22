import { getAllPostsMeta } from '@/lib/posts'
import { Box, Heading, SimpleGrid, Image as ChakraImage, Text, HStack, VStack, Card, Tag } from '@chakra-ui/react'
import NextImage from 'next/image'
import NextLink from 'next/link'

export const dynamic = 'error' // ensure SSG

export default function BlogIndexPage() {
  const posts = getAllPostsMeta()

  return (
    <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 10, md: 16 }}>
      <Heading size="2xl" mb={8}>Blog</Heading>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={8}>
        {posts.map((post) => (
          <Card.Root key={post.slug} overflow="hidden" _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }} transition="all 0.2s ease">
            <NextLink href={`/blog/${post.slug}`}>
              <Box>
                <Box position="relative" w="100%" h={{ base: '180px', md: '200px' }} bg="gray.800">
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
                <Card.Body>
                  <VStack align="start" gap={3}>
                    <Heading size="md">{post.title}</Heading>
                    {post.description && <Text color="gray.400" lineClamp={3}>{post.description}</Text>}
                    {post.tags && post.tags.length > 0 && (
                      <HStack wrap="wrap">
                        {post.tags.map((tag) => (
                          <Tag.Root key={tag} variant="subtle" colorPalette="gray">
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
        ))}
      </SimpleGrid>
    </Box>
  )
}
