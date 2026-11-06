import { test, expect, type APIRequestContext, type Locator } from '@playwright/test';

// #37〜#40 の改善が後の変更で元に戻ったことを検知する構造チェック。

const PAGES_WITH_FONTS = ['/', '/profile', '/blog/devenv2026'];
const MAX_FONT_PRELOADS = 3;

// 記事名を直接書かない(記事の追加・削除でテストが壊れないようにする)
async function listArticlePaths(request: APIRequestContext): Promise<string[]> {
  const body = await (await request.get('/sitemap.xml')).text();
  const paths = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(([, loc]) => new URL(loc).pathname)
    .filter((pathname) => pathname.startsWith('/blog/'));
  expect(paths.length).toBeGreaterThan(0);
  return paths;
}

// Playwright の toBeVisible は opacity:0 を「見えている」と判定するため、
// 要素と祖先の opacity を自前でたどる
async function expectOpaque(locator: Locator) {
  const transparent = await locator.evaluate((el) => {
    for (let node: Element | null = el; node; node = node.parentElement) {
      if (getComputedStyle(node).opacity === '0') return node.outerHTML.slice(0, 120);
    }
    return null;
  });
  expect(transparent, 'opacity:0 の祖先要素').toBeNull();
}

test.describe('フォントの preload(#37)', () => {

  for (const path of PAGES_WITH_FONTS) {
    test(`${path} でフォントの preload が${MAX_FONT_PRELOADS}件以下`, async ({ page }) => {
      await page.goto(path);
      const fontPreloads = await page.locator('link[rel="preload"][as="font"]').count();

      expect(fontPreloads).toBeLessThanOrEqual(MAX_FONT_PRELOADS);
    });
  }
});

test.describe('記事サムネイルの優先読み込み(#38)', () => {

  test('/blog/devenv2026 のサムネイルは fetchpriority="high" で、lazy load しない', async ({ page }) => {
    await page.goto('/blog/devenv2026');
    // 本文の Markdown にも h1 があるため、記事タイトルは先頭の h1 に限定する
    const title = await page.locator('article h1').first().innerText();
    const thumbnail = page.locator('article').getByRole('img', { name: title, exact: true });

    await expect(thumbnail).toHaveAttribute('fetchpriority', 'high');
    await expect(thumbnail).not.toHaveAttribute('loading', 'lazy');
  });
});

test.describe('Markdown 本文の画像(#39)', () => {

  test('全記事の本文画像が lazy load され、ローカル画像は /_next/image 経由で width/height を持つ', async ({
    page,
    request,
  }) => {
    for (const path of await listArticlePaths(request)) {
      await page.goto(path);
      const images = page.locator('.markdown-body img:not(.link-card-favicon)');

      for (const img of await images.all()) {
        const src = (await img.getAttribute('src')) ?? '';
        await expect(img, `${path} ${src}`).toHaveAttribute('loading', 'lazy');

        if (src.startsWith('/')) {
          expect(src, path).toMatch(/^\/_next\/image/);
          await expect(img, `${path} ${src}`).toHaveAttribute('width', /\d+/);
          await expect(img, `${path} ${src}`).toHaveAttribute('height', /\d+/);
        }
      }
    }
  });
});

test.describe('JavaScript 無しでのファーストビュー(#40)', () => {
  test.use({ javaScriptEnabled: false });

  test('/profile の h1「Yuzu」が JS 実行前から見える', async ({ page }) => {
    await page.goto('/profile');
    const heading = page.getByRole('heading', { level: 1, name: 'Yuzu' });

    await expect(heading).toBeVisible();
    await expectOpaque(heading);
  });

  test('/ の先頭の記事カードが JS 実行前から見える', async ({ page }) => {
    await page.goto('/');
    const firstCardTitle = page.locator('main h2').first();

    await expect(firstCardTitle).toBeVisible();
    await expectOpaque(firstCardTitle);
  });
});
