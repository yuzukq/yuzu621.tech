import { ImageResponse } from 'next/og'
import { SITE_NAME } from '@/lib/seo'

export const alt = SITE_NAME
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// サイト共通のデフォルトOG画像。記事に thumbnail が無い場合や、個別に
// images を指定していないページ全般でこれが使われる(next/og の
// file convention により、より詳細なセグメントが上書きしない限り継承される)。
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0C1214',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: -2,
            color: '#39C5BB',
          }}
        >
          yuzu621.tech
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 20,
            fontSize: 28,
            fontWeight: 400,
            color: '#96A8A7',
          }}
        >
          Portfolio & Blog
        </div>
      </div>
    ),
    { ...size }
  )
}
