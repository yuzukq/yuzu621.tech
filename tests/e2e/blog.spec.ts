import { test, expect } from '@playwright/test';

test('ブログ一覧ページが正しく表示される', async ({ page }) => {
  await page.goto('/blog');
  
  // ページタイトルの確認
  await expect(page).toHaveTitle('Yuzu portfolio');
  
  // ブログ一覧の見出しを確認
  await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();
  
  // ブログ記事カードが存在することを確認（カテゴリタブを除外）
  const blogLinks = page.locator('a[href^="/blog/"]:not([href*="?"])');
  const count = await blogLinks.count();
  expect(count).toBeGreaterThan(0);
});

test('ブログ一覧から詳細ページへ遷移できる', async ({ page }) => {
  await page.goto('/blog');

  // 最初のブログ記事リンクを取得（カテゴリタブではなく記事カードのリンク）
  // 記事カードは /blog/ 以降にスラグが続くパターン（クエリパラメータを除外）
  const firstBlogLink = page.locator('a[href^="/blog/"]:not([href*="?"])').first();
  await expect(firstBlogLink).toBeVisible();
  
  const href = await firstBlogLink.getAttribute('href');
  await firstBlogLink.click();
  
  // 詳細ページに遷移したことを確認
  await expect(page).toHaveURL(href!);
  
  // 記事のタイトル（h2）が表示されることを確認
  await expect(page.locator('h2').first()).toBeVisible();
});

test('ブログ詳細ページから一覧に戻れる', async ({ page }) => {
  // 既知のブログ記事ページに直接アクセス
  await page.goto('/blog/vr-seminar');
  
  // 「一覧に戻る」ボタンを探してクリック
  const backButton = page.getByRole('button', { name: '一覧に戻る' });
  await expect(backButton).toBeVisible();
  await backButton.click();
  
  // ブログ一覧ページに戻ったことを確認
  await expect(page).toHaveURL('/blog');
  await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();
});

// カテゴリフィルタリング機能のテスト
test('カテゴリタブが表示される', async ({ page }) => {
  await page.goto('/blog');
  
  // 技術関連タブと日常タブが表示されることを確認
  const techTab = page.getByRole('link', { name: '技術関連' });
  const dailyTab = page.getByRole('link', { name: '日常' });
  
  await expect(techTab).toBeVisible();
  await expect(dailyTab).toBeVisible();
});

test('カテゴリタブをクリックするとURLパラメータが変更される', async ({ page }) => {
  await page.goto('/blog');
  
  // 日常タブをクリック
  const dailyTab = page.getByRole('link', { name: '日常' });
  await dailyTab.click();
  
  // URLが ?category=daily に変更されることを確認
  await expect(page).toHaveURL('/blog?category=daily');
  
  // 技術関連タブをクリック
  const techTab = page.getByRole('link', { name: '技術関連' });
  await techTab.click();
  
  // URLが ?category=tech に変更されることを確認
  await expect(page).toHaveURL('/blog?category=tech');
});

test('category=techパラメータで技術記事がフィルタリングされる', async ({ page }) => {
  await page.goto('/blog?category=tech');
  
  // ページタイトルの確認
  await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();
  
  // 技術記事が表示されることを確認（技術系の記事リンクが存在する）
  const blogLinks = page.locator('a[href^="/blog/"]');
  const count = await blogLinks.count();
  expect(count).toBeGreaterThan(0);
  
  // 日常記事（Vket）が表示されていないことを確認
  await expect(page.locator('a[href="/blog/Vket2025"]')).not.toBeVisible();
});

test('category=dailyパラメータで日常記事がフィルタリングされる', async ({ page }) => {
  await page.goto('/blog?category=daily');
  
  // ページタイトルの確認
  await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();
  
  // 日常記事が表示されることを確認（Vket記事が存在する）
  await expect(page.locator('a[href="/blog/Vket2025"]')).toBeVisible();
  
  // 技術記事が表示されていないことを確認
  await expect(page.locator('a[href="/blog/cognitive-debt"]')).not.toBeVisible();
});

test('無効なカテゴリパラメータでデフォルト（tech）にフォールバックする', async ({ page }) => {
  await page.goto('/blog?category=invalid');
  
  // ページが正常に表示されることを確認
  await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();
  
  // 技術記事が表示されることを確認（デフォルトでtechになる）
  const techArticle = page.locator('a[href="/blog/cognitive-debt"]');
  await expect(techArticle).toBeVisible();
  
  // 日常記事が表示されていないことを確認
  await expect(page.locator('a[href="/blog/Vket2025"]')).not.toBeVisible();
});
