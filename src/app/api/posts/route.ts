// カテゴリーフィルタのエンドポイント
import { NextRequest, NextResponse } from 'next/server'
import { getAllPostsMeta, type BlogCategory } from '@/lib/posts'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get('category') as BlogCategory | null
  
  const posts = getAllPostsMeta(category || undefined)
  
  return NextResponse.json(posts)
}
