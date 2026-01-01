// 記事一覧ページ（サーバーコンポーネント）
import { getAllPostsMeta, type BlogCategory } from '@/lib/posts'
import { Box, Heading, SimpleGrid, Text, Flex } from '@chakra-ui/react'
import CategoryTabs from './CategoryTabs'
import BlogCard from './BlogCard'

// カテゴリのバリデーション
const VALID_CATEGORIES: BlogCategory[] = ['tech', 'daily']
function isValidCategory(value: string | null | undefined): value is BlogCategory {
  return value !== null && value !== undefined && VALID_CATEGORIES.includes(value as BlogCategory)
}

interface BlogIndexPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const params = await searchParams
  const category: BlogCategory = isValidCategory(params.category) ? params.category : 'tech'
  const posts = getAllPostsMeta(category)
  
  const isDaily = category === 'daily'

  return (
    <Box 
      minH="100vh"
      bg={isDaily ? 'gray.50' : 'black'}
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
          <CategoryTabs currentCategory={category} />
        </Flex>

        {/* 記事一覧 */}
        {posts.length === 0 ? (
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
