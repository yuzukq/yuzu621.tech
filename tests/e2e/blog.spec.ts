import { test, expect } from '@playwright/test';

test('ブログ一覧ページが正しく表示される', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('yuzu621.tech');

  await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();

  // カテゴリタブも /?category= へのリンクのため、クエリ付きhrefを除外して記事カードだけ数える
  const blogLinks = page.locator('a[href^="/blog/"]:not([href*="?"])');
  const count = await blogLinks.count();
  expect(count).toBeGreaterThan(0);
});

test('ブログ一覧から詳細ページへ遷移できる', async ({ page }) => {
  await page.goto('/');

  const firstBlogLink = page.locator('a[href^="/blog/"]:not([href*="?"])').first();
  await expect(firstBlogLink).toBeVisible();

  const href = await firstBlogLink.getAttribute('href');
  await firstBlogLink.click();

  await expect(page).toHaveURL(href!);

  await expect(page.locator('h1').first()).toBeVisible();
});

test('ブログ詳細ページから一覧に戻れる', async ({ page }) => {
  await page.goto('/blog/vr-seminar');

  const backButton = page.getByRole('button', { name: '一覧に戻る' });
  await expect(backButton).toBeVisible();
  await backButton.click();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();
});

// カテゴリフィルタリング機能のテスト
test('カテゴリタブが表示される', async ({ page }) => {
  await page.goto('/');

  const techTab = page.getByRole('link', { name: '技術関連' });
  const dailyTab = page.getByRole('link', { name: '日常' });

  await expect(techTab).toBeVisible();
  await expect(dailyTab).toBeVisible();
});

test('カテゴリタブをクリックするとURLパラメータが変更される', async ({ page }) => {
  await page.goto('/');

  const dailyTab = page.getByRole('link', { name: '日常' });
  await dailyTab.click();

  await expect(page).toHaveURL('/?category=daily');

  const techTab = page.getByRole('link', { name: '技術関連' });
  await techTab.click();

  await expect(page).toHaveURL('/?category=tech');
});

test('category=techパラメータで技術記事がフィルタリングされる', async ({ page }) => {
  await page.goto('/?category=tech');

  await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();

  const blogLinks = page.locator('a[href^="/blog/"]');
  const count = await blogLinks.count();
  expect(count).toBeGreaterThan(0);

  await expect(page.locator('a[href="/blog/Vket2025"]')).not.toBeVisible();
});

test('category=dailyパラメータで日常記事がフィルタリングされる', async ({ page }) => {
  await page.goto('/?category=daily');

  await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();

  await expect(page.locator('a[href="/blog/Vket2025"]')).toBeVisible();

  await expect(page.locator('a[href="/blog/cognitive-debt"]')).not.toBeVisible();
});

test('無効なカテゴリパラメータでデフォルト（tech）にフォールバックする', async ({ page }) => {
  await page.goto('/?category=invalid');

  await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();

  const techArticle = page.locator('a[href="/blog/cognitive-debt"]');
  await expect(techArticle).toBeVisible();

  await expect(page.locator('a[href="/blog/Vket2025"]')).not.toBeVisible();
});

// 世界観(data-world)切り替えのテスト
test('daily カテゴリ表示時に <html data-world="daily"> になる', async ({ page }) => {
  await page.goto('/?category=daily');

  // Vket2025 は daily カテゴリの既知記事
  await expect(page.locator('a[href="/blog/Vket2025"]')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-world', 'daily');
});

test('tech カテゴリ表示時は <html data-world="tech"> のままになる', async ({ page }) => {
  await page.goto('/?category=tech');

  await expect(page.locator('a[href="/blog/cognitive-debt"]')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-world', 'tech');
});

// 記事本文の描画テスト
test('記事ページで Markdown 本文(.markdown-body)が描画される', async ({ page }) => {
  await page.goto('/blog/vr-seminar');

  const body = page.locator('.markdown-body');
  await expect(body).toBeVisible();
  // Markdownがプレーンテキストのまま出力されず、HTMLとして解釈されていることの確認
  await expect(body.locator('p, h2, h3').first()).toBeVisible();
});

// 目次(TOC)のテスト。xl(root 18pxでは実質1440px)以上でのみ表示されるため
// ビューポートを広めに固定する。
test.describe('目次(TOC)', () => {
  test.use({ viewport: { width: 1600, height: 900 } });

  test('記事ページの右側に目次が表示され、見出しへのアンカーリンクを含む', async ({ page }) => {
    await page.goto('/blog/devenv2026');

    const toc = page.getByRole('navigation', { name: '目次' });
    await expect(toc).toBeVisible();

    const links = toc.getByRole('link');
    expect(await links.count()).toBeGreaterThan(0);
    await expect(links.first()).toHaveAttribute('href', /^#/);
  });

  test('kキーで次の見出しへスクロールし、アクティブ項目が1つ表示される', async ({ page }) => {
    await page.goto('/blog/devenv2026');

    const before = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('k');
    await page.waitForFunction((y) => window.scrollY > y, before);

    await expect(page.getByRole('navigation', { name: '目次' }).locator('[aria-current="true"]')).toHaveCount(1);
  });

  test('狭いビューポートでは目次が表示されない', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 800 });
    await page.goto('/blog/devenv2026');

    await expect(page.getByRole('navigation', { name: '目次' })).toBeHidden();
  });
});
