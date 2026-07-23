import { test, expect } from '@playwright/test';

test('ポートフォリオページが主要セクションを表示できる', async ({ page }) => {
  await page.goto('/profile');

  await expect(page).toHaveTitle('Profile | yuzu621.tech');

  await expect(page.getByRole('heading', { level: 1, name: 'Yuzu' })).toBeVisible();

  await expect(page.locator('#about').getByText('自己紹介')).toBeVisible();
  await expect(page.locator('#products').getByText('制作物')).toBeVisible();
  await expect(page.locator('#tech-stack').getByText('技術スタック', { exact: true })).toBeVisible();
});

test.describe('Tech Stack: スクロール連動ショーケース / フォールバック切り替え', () => {
  test('lg以上・motion-okならアバター演出のショーケースになり、全カテゴリの内容はDOM上に存在する', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/profile');

    const techStack = page.locator('#tech-stack');
    // ショーケースはスクロール長を確保する高さ指定divで実装されている(フォールバックのgridにはない)
    await expect(techStack.locator('div[style*="height"]')).toBeVisible();

    // 見出しはショーケース内(sticky内側)に1つだけ存在する(TechStackBody側では描画しない)
    await expect(techStack.getByRole('heading', { name: '技術スタック' })).toHaveCount(1);

    // 4カテゴリすべての見出しがabsolute配置で常時DOMに存在する(表示/非表示はopacityのみ)
    for (const label of ['FrontEnd', 'BackEnd', 'DevOps / Infra', 'XR / Hardware']) {
      await expect(techStack.getByText(label)).toHaveCount(1);
    }
  });

  test('lg未満ではフォールバックの静的グリッドになる(ショーケースの高さ指定divが無い)', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 });
    await page.goto('/profile');

    const techStack = page.locator('#tech-stack');
    await expect(techStack.getByText('FrontEnd')).toBeVisible();
    await expect(techStack.locator('div[style*="height"]')).toHaveCount(0);
    await expect(techStack.getByRole('heading', { name: '技術スタック' })).toHaveCount(1);
  });

  test('prefers-reduced-motionではlg以上でもフォールバックになる', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/profile');

    const techStack = page.locator('#tech-stack');
    await expect(techStack.getByText('FrontEnd')).toBeVisible();
    await expect(techStack.locator('div[style*="height"]')).toHaveCount(0);
    await expect(techStack.getByRole('heading', { name: '技術スタック' })).toHaveCount(1);
  });

  test('ショーケースのpin区間の途中までスクロールしても見出しが表示され続ける', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/profile');

    const techStack = page.locator('#tech-stack');
    const showcase = techStack.locator('div[style*="height"]');

    // scroll-behavior: smooth の影響を受けないよう、pin区間30%地点までinstantでスクロールする
    const targetY = await showcase.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top + window.scrollY + rect.height * 0.3;
    });
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), targetY);

    await expect(techStack.getByRole('heading', { name: '技術スタック' })).toBeVisible();
  });
});
