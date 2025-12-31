// カテゴリーフィルタのエンドポイント
import { NextRequest, NextResponse } from 'next/server'
import { getAllPostsMeta, type BlogCategory } from '@/lib/posts'

const VALID_CATEGORIES: BlogCategory[] = ['tech', 'daily']

function isValidCategory(value: string | null): value is BlogCategory {
  return value !== null && VALID_CATEGORIES.includes(value as BlogCategory)
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoryParam = searchParams.get('category')
    
    // カテゴリのバリデーション
    const category: BlogCategory | undefined = isValidCategory(categoryParam) 
      ? categoryParam 
      : undefined
    
    const posts = getAllPostsMeta(category)
    
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}
