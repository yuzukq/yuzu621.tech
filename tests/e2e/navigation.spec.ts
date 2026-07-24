import { test, expect, type Page } from '@playwright/test';

// スムーズスクロール完了を固定waitではなく、scrollYが開始位置から動いた後
// 2フレーム連続で同値になったこと(=静止)で検知する。pollingのデフォルトは
// rafのため、returnがtrueになるのは実際に連続フレームで値が一致した時のみ
async function waitForScrollSettle(page: Page, startY: number) {
  await page.waitForFunction((initial) => {
    const w = window as unknown as { __scrollSettleY?: number };
    const current = window.scrollY;
    if (current === initial) return false;
    if (w.__scrollSettleY === current) return true;
    w.__scrollSettleY = current;
    return false;
  }, startY);
}

test.describe('ナビゲーション機能', () => {
  test('About meセクションの「ブログを読む」ボタンでブログ一覧へ遷移できる', async ({ page }) => {
    await page.goto('/profile');

    // lg以上・motion-okではこのボタンもHero→About間のアバター移動が完了する
    // 直前にフェードインする(AboutIntro.tsx)ため、スクロールしてから確認する
    await page.evaluate(() => document.getElementById('about')?.scrollIntoView({ block: 'start' }));
    const blogButton = page.getByRole('button', { name: 'ブログを読む' });
    await expect(blogButton).toBeVisible();
    await blogButton.click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();
  });

  test('ブログページのヘッダーからProfileリンクでプロフィールページに戻れる', async ({ page }) => {
    await page.goto('/');

    const portfolioLink = page.getByRole('link', { name: 'Profile' });
    await expect(portfolioLink).toBeVisible();
    await portfolioLink.click();

    await expect(page).toHaveURL('/profile');
    await expect(page.locator('#hero')).toBeVisible();
  });
});

test.describe('アンカーリンク機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('ヘッダーのナビゲーションリンクが表示される', async ({ page }) => {
    await page.goto('/profile');

    await expect(page.getByRole('link', { name: 'Yuzu' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tech Stack' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Blog' })).toBeVisible();
  });

  test('アンカーリンクをクリックすると対象セクションまでスムーズスクロールする', async ({ page }) => {
    await page.goto('/profile');

    const initialScrollY = await page.evaluate(() => window.scrollY);

    await page.getByRole('link', { name: 'About' }).click();

    // smooth スクロールの完了を待つ(即時にアサートすると移動途中の座標を拾う)
    await page.waitForTimeout(500);

    const afterScrollY = await page.evaluate(() => window.scrollY);
    expect(afterScrollY).toBeGreaterThan(initialScrollY);

    const aboutHeading = page.locator('#about').getByRole('heading').first();
    await expect(aboutHeading).toBeInViewport();
  });

  test('Productsセクションへのスクロールナビゲーション', async ({ page }) => {
    await page.goto('/profile');

    await page.getByRole('link', { name: 'Products' }).click();

    await page.waitForTimeout(500);

    const productsHeading = page.locator('#products').getByRole('heading').first();
    await expect(productsHeading).toBeInViewport();
  });

  test('Tech Stackセクションへのスクロールナビゲーション', async ({ page }) => {
    await page.goto('/profile');

    await page.getByRole('link', { name: 'Tech Stack' }).click();

    await page.waitForTimeout(500);

    const skillsHeading = page.locator('#tech-stack').getByRole('heading').first();
    await expect(skillsHeading).toBeInViewport();
  });

  test('Blogリンクはブログページへ遷移する（スムーズスクロールではない）', async ({ page }) => {
    await page.goto('/profile');

    await page.getByRole('link', { name: 'Blog' }).click();

    await expect(page).toHaveURL('/');
  });

  test('セクション間を移動するとスクロール位置が正しく変化する', async ({ page }) => {
    await page.goto('/profile');

    await page.getByRole('link', { name: 'Products' }).click();
    await page.waitForTimeout(500);
    const productsScrollY = await page.evaluate(() => window.scrollY);

    await page.getByRole('link', { name: 'Yuzu' }).click();
    await page.waitForTimeout(500);
    const heroScrollY = await page.evaluate(() => window.scrollY);

    expect(heroScrollY).toBeLessThan(productsScrollY);
  });
});

test.describe('モバイルビュー - アンカーリンク機能', () => {
  test.beforeEach(async ({ page }) => {
    // iPhone 14 サイズ
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('モバイルでハンバーガーメニューが表示される', async ({ page }) => {
    await page.goto('/profile');

    const menuButton = page.getByRole('banner').getByRole('button');
    await expect(menuButton).toBeVisible();
  });

  test('ハンバーガーメニューをクリックするとドロワーが開く', async ({ page }) => {
    await page.goto('/profile');

    await page.getByRole('banner').getByRole('button').click();

    const drawer = page.getByRole('dialog', { name: 'Page index' });
    await expect(drawer).toBeVisible();

    await expect(drawer.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'Products' })).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'Tech Stack' })).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'Blog' })).toBeVisible();
  });

  test('モバイルドロワーのリンクをクリックすると対象セクションにスクロールする', async ({ page }) => {
    await page.goto('/profile');

    const initialScrollY = await page.evaluate(() => window.scrollY);

    await page.getByRole('banner').getByRole('button').click();
    const drawer = page.getByRole('dialog', { name: 'Page index' });
    await expect(drawer).toBeVisible();

    await drawer.getByRole('link', { name: 'Products' }).click();

    // ドロワーが閉じてからスムーズスクロールが完了するまで待つ
    await waitForScrollSettle(page, initialScrollY);

    const afterScrollY = await page.evaluate(() => window.scrollY);
    expect(afterScrollY).toBeGreaterThan(initialScrollY);
  });

  test('モバイルドロワーの閉じるボタンでメニューを閉じられる', async ({ page }) => {
    await page.goto('/profile');

    await page.getByRole('banner').getByRole('button').click();
    const drawer = page.getByRole('dialog', { name: 'Page index' });
    await expect(drawer).toBeVisible();

    await page.getByRole('button', { name: 'メニューを閉じる' }).click();

    await expect(drawer).not.toBeVisible();
  });

  test('モバイルでBlogリンクはブログページへ遷移する', async ({ page }) => {
    await page.goto('/profile');

    await page.getByRole('banner').getByRole('button').click();
    const drawer = page.getByRole('dialog', { name: 'Page index' });
    await expect(drawer).toBeVisible();

    await drawer.getByRole('link', { name: 'Blog' }).click();

    await expect(page).toHaveURL('/');
  });
});
