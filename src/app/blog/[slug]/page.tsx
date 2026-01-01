// ブログ記事本文ページ
import { getAllPostSlugs, getPostBySlug } from '@/lib/posts'
import { Box, Heading, HStack, Tag, Text, Separator } from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrismPlus from 'rehype-prism-plus'
import Image from 'next/image'
import ShareRow from './ShareRow'
import remarkLatexBreaks from '@/lib/remark-latex-breaks'

export const dynamic = 'error' // SSG

export async function generateStaticParams() {
  const slugs = getAllPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Not found' }
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: post.thumbnail ? [{ url: post.thumbnail }] : undefined,
    },
  }
}

// カテゴリに応じたスタイル設定
const getThemeStyles = (isDaily: boolean) => ({
  bg: isDaily ? 'gray.50' : 'black',
  headingColor: isDaily ? 'gray.800' : 'white',
  textColor: isDaily ? 'gray.600' : 'gray.400',
  tagColorPalette: 'gray',
  separatorColor: isDaily ? 'gray.200' : 'gray.700',
})

// Markdownのテーマスタイル
const getMarkdownStyles = (isDaily: boolean) => ({
  // Headings
  '& h1': { fontSize: '2rem', fontWeight: 800, marginTop: '2.5rem', marginBottom: '1rem', color: isDaily ? '#1a202c' : 'inherit' },
  '& h2': { fontSize: '1.75rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', color: isDaily ? '#1a202c' : 'inherit' },
  '& h3': { fontSize: '1.5rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.5rem', color: isDaily ? '#2d3748' : 'inherit' },
  '& h4': { fontSize: '1.25rem', fontWeight: 600, marginTop: '1.25rem', marginBottom: '0.5rem', color: isDaily ? '#2d3748' : 'inherit' },
  // Paragraphs
  '& p': { marginBottom: '1rem', lineHeight: 1.8, color: isDaily ? '#4a5568' : 'inherit' },
  // Lists
  '& ul': { listStyleType: 'disc', paddingInlineStart: '1.5rem', marginBottom: '1rem', color: isDaily ? '#4a5568' : 'inherit' },
  '& ol': { listStyleType: 'decimal', paddingInlineStart: '1.5rem', marginBottom: '1rem', color: isDaily ? '#4a5568' : 'inherit' },
  '& li': { marginBottom: '0.25rem' },
  // Links
  '& a': { color: '#3b82f6', textDecoration: 'underline', transition: 'color 0.2s ease' },
  '& a:hover': { color: '#2563eb' },
  '& h1 > a, & h2 > a, & h3 > a, & h4 > a': { color: 'inherit', textDecoration: 'none' },
  '& h1 > a:hover, & h2 > a:hover, & h3 > a:hover, & h4 > a:hover': { color: 'inherit' },
  // Code blocks
  '& pre': { marginBottom: '1.5rem', backgroundColor: isDaily ? '#f7fafc' : '#1a202c', padding: '1rem', borderRadius: '8px', overflowX: 'auto', border: isDaily ? '1px solid #e2e8f0' : 'none' },
  '& :not(pre) > code': { backgroundColor: isDaily ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.3)', padding: '0.15rem 0.35rem', borderRadius: '4px', color: isDaily ? '#d63384' : 'inherit' },
  '& pre code': { backgroundColor: 'transparent', padding: 0, borderRadius: 0, color: isDaily ? '#1a202c' : 'inherit' },
  // Images
  '& img': { borderRadius: 8, margin: '1rem 0' },
  // Blockquotes
  '& blockquote': { borderLeft: isDaily ? '4px solid #3182ce' : '4px solid #4a5568', paddingLeft: '1rem', margin: '1rem 0', color: isDaily ? '#4a5568' : '#a0aec0' },
  // Tables
  '& table': { borderCollapse: 'collapse', width: '100%', marginBottom: '1rem' },
  '& th, & td': { border: isDaily ? '1px solid #e2e8f0' : '1px solid #4a5568', padding: '0.5rem', color: isDaily ? '#4a5568' : 'inherit' },
  '& th': { backgroundColor: isDaily ? '#f7fafc' : '#2d3748' },
})

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) {
    return <Box maxW="900px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 10, md: 16 }}><Heading>Not Found</Heading></Box>
  }

  const isDaily = post.category === 'daily'
  const theme = getThemeStyles(isDaily)
  const markdownStyles = getMarkdownStyles(isDaily)

  return (
    <Box 
      minH="100vh"
      bg={theme.bg}
      transition="background-color 0.3s ease"
    >
      <Box maxW="900px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 10, md: 16 }}>
        <Heading size="2xl" mb={4} color={theme.headingColor}>{post.title}</Heading>
        <HStack gap={3} color={theme.textColor} mb={6} flexWrap="wrap">
          <Text>作成日時: {new Date(post.date).toLocaleDateString('ja-JP')}</Text>
          {post.tags?.map((tag) => (
            <Tag.Root key={tag} variant="solid" colorPalette={theme.tagColorPalette}><Tag.Label>#{tag}</Tag.Label></Tag.Root>
          ))}
        </HStack>
        {post.thumbnail && (
          <Box position="relative" w="100%" h={{ base: '220px', md: '360px' }} mb={8}>
            <Image src={post.thumbnail} alt={post.title} fill sizes="100vw" style={{ objectFit: 'cover', borderRadius: 12 }} />
          </Box>
        )}
        <Separator my={8} borderColor={theme.separatorColor} />
        <Box className="markdown-body" css={markdownStyles}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkLatexBreaks]}
            rehypePlugins={[
              rehypeRaw,
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: 'wrap' }],
              rehypePrismPlus,
            ]}
            components={{
              img: ({ src, alt }) => {
                if (!src || typeof src !== 'string') return null
                return <Image src={src} alt={alt || ''} width={1200} height={630} style={{ height: 'auto', width: '100%' }} />
              },
            }}
          >
            {post.content}
          </ReactMarkdown>
        </Box>

        {/* 一覧へ戻る + 共有ボタン行 */}
        <ShareRow title={post.title} />
      </Box>
    </Box>
  )
}
