import { test, expect } from '@playwright/test';

test('ポートフォリオページが主要セクションを表示できる', async ({ page }) => {
  await page.goto('/profile');

  // ページタイトルの確認
  await expect(page).toHaveTitle('Profile | yuzu621.tech');

  // ヒーローセクションの名前(ディスプレイタイポ)を確認
  await expect(page.getByRole('heading', { level: 1, name: 'Yuzu' })).toBeVisible();

  // 主要セクション(英大文字ラベル + 和文タイトルの2段見出し)を確認
  await expect(page.locator('#about').getByText('自己紹介')).toBeVisible();
  await expect(page.locator('#products').getByText('制作物')).toBeVisible();
  await expect(page.locator('#tech-stack').getByText('技術スタック', { exact: true })).toBeVisible();
});
