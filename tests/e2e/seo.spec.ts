import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

// _posts/*.md(.mdx) からスラグ一覧を取得する。
// アプリ本体(src/lib/posts.ts)の getAllPostSlugs と同じ規則(拡張子 md/mdx のみ対象)を
// テスト側でも独立して再現し、sitemap が実際の記事を漏れなく含んでいるか検証する。
const POSTS_DIR = path.join(process.cwd(), '_posts');

function getPostSlugs(): string[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
    .map((file) => file.replace(/\.(md|mdx)$/i, ''));
}

test.describe('SEO', () => {
  test('/sitemap.xml が200で返り、全記事のURLを含む', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('xml');

    const body = await res.text();

    // トップ(ブログ一覧)とポートフォリオも含まれること
    expect(body).toContain('https://yuzu621.tech');
    expect(body).toContain('/portfolio');

    const slugs = getPostSlugs();
    expect(slugs.length).toBeGreaterThan(0);
    for (const slug of slugs) {
      expect(body).toContain(`/blog/${slug}`);
    }
  });

  test('/robots.txt が200で返り、sitemapを指す', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);

    const body = await res.text();
    expect(body).toContain('Sitemap: https://yuzu621.tech/sitemap.xml');
    expect(body).toMatch(/Allow:\s*\//);
  });

  test('記事ページに canonical と BlogPosting JSON-LD がある', async ({ page }) => {
    const [slug] = getPostSlugs();
    await page.goto(`/blog/${slug}`);

    // canonical は記事自身のURLを指す(metadataBaseにより絶対URLへ解決される)
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', new RegExp(`/blog/${slug}$`));

    // JSON-LDはページ内に複数存在しうる(ルートのWebSite + 記事のBlogPosting)ため、
    // すべてパースして @type: BlogPosting のものを探す
    const rawScripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    expect(rawScripts.length).toBeGreaterThan(0);

    const parsed = rawScripts.map((raw) => JSON.parse(raw) as Record<string, unknown>);
    const blogPosting = parsed.find((data) => data['@type'] === 'BlogPosting');

    expect(blogPosting).toBeTruthy();
    expect(typeof blogPosting?.headline).toBe('string');
    expect(blogPosting?.headline).not.toHaveLength(0);
    expect(typeof blogPosting?.datePublished).toBe('string');
    expect(blogPosting?.mainEntityOfPage).toBeTruthy();
  });
});
