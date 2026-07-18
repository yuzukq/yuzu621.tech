import { test, expect } from '@playwright/test';

test.describe('ナビゲーション機能', () => {
  test('About meセクションの「ブログを読む」ボタンでブログ一覧へ遷移できる', async ({ page }) => {
    await page.goto('/portfolio');

    // 「ブログを読む」ボタンを探してクリック
    const blogButton = page.getByRole('button', { name: 'ブログを読む' });
    await expect(blogButton).toBeVisible();
    await blogButton.click();

    // ブログページに遷移したことを確認
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();
  });

  test('ブログページのヘッダーからPortfolioリンクでポートフォリオページに戻れる', async ({ page }) => {
    await page.goto('/');

    // Portfolioリンクをクリック
    const portfolioLink = page.getByRole('link', { name: 'Portfolio' });
    await expect(portfolioLink).toBeVisible();
    await portfolioLink.click();

    // ポートフォリオページのAboutセクションに遷移することを確認
    await expect(page).toHaveURL('/portfolio#about');
  });
});

test.describe('アンカーリンク機能', () => {
  test.beforeEach(async ({ page }) => {
    // デスクトップビューでテスト
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('ヘッダーのナビゲーションリンクが表示される', async ({ page }) => {
    await page.goto('/portfolio');

    // ヘッダーのナビゲーションリンクが表示されていることを確認
    await expect(page.getByRole('link', { name: 'Yuzu' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Skills' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Blog' })).toBeVisible();
  });

  test('アンカーリンクをクリックすると対象セクションまでスムーズスクロールする', async ({ page }) => {
    await page.goto('/portfolio');

    // 初期位置を記録
    const initialScrollY = await page.evaluate(() => window.scrollY);

    // Aboutリンクをクリック
    await page.getByRole('link', { name: 'About' }).click();

    // スクロールが発生したことを確認（スムーズスクロールのため少し待機）
    await page.waitForTimeout(500);

    // スクロール位置が変化していることを確認
    const afterScrollY = await page.evaluate(() => window.scrollY);
    expect(afterScrollY).toBeGreaterThan(initialScrollY);

    // Aboutセクションの見出しがビューポートに表示されていることを確認
    const aboutHeading = page.locator('#about').getByRole('heading').first();
    await expect(aboutHeading).toBeInViewport();
  });

  test('Productsセクションへのスクロールナビゲーション', async ({ page }) => {
    await page.goto('/portfolio');

    // Productsリンクをクリック
    await page.getByRole('link', { name: 'Products' }).click();

    // スクロール完了を待機
    await page.waitForTimeout(500);

    // Productsセクションの見出しがビューポートに表示されていることを確認
    const productsHeading = page.locator('#products').getByRole('heading').first();
    await expect(productsHeading).toBeInViewport();
  });

  test('Skillsセクションへのスクロールナビゲーション', async ({ page }) => {
    await page.goto('/portfolio');

    // Skillsリンクをクリック
    await page.getByRole('link', { name: 'Skills' }).click();

    // スクロール完了を待機
    await page.waitForTimeout(500);

    // Skillsセクションの見出しがビューポートに表示されていることを確認
    const skillsHeading = page.locator('#skills').getByRole('heading').first();
    await expect(skillsHeading).toBeInViewport();
  });

  test('Blogリンクはブログページへ遷移する（スムーズスクロールではない）', async ({ page }) => {
    await page.goto('/portfolio');

    // Blogリンクをクリック
    await page.getByRole('link', { name: 'Blog' }).click();

    // ブログページに遷移したことを確認
    await expect(page).toHaveURL('/');
  });

  test('セクション間を移動するとスクロール位置が正しく変化する', async ({ page }) => {
    await page.goto('/portfolio');

    // まずProductsセクションへ移動
    await page.getByRole('link', { name: 'Products' }).click();
    await page.waitForTimeout(500);
    const productsScrollY = await page.evaluate(() => window.scrollY);

    // 次にロゴ(Yuzu)リンクでヒーロー(Top)へ戻る
    await page.getByRole('link', { name: 'Yuzu' }).click();
    await page.waitForTimeout(500);
    const heroScrollY = await page.evaluate(() => window.scrollY);

    // ヒーローはProductsより上にある
    expect(heroScrollY).toBeLessThan(productsScrollY);
  });
});

test.describe('モバイルビュー - アンカーリンク機能', () => {
  test.beforeEach(async ({ page }) => {
    // モバイルビューでテスト (iPhone 14サイズ)
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('モバイルでハンバーガーメニューが表示される', async ({ page }) => {
    await page.goto('/portfolio');

    // ハンバーガーメニューボタンが表示されていることを確認
    const menuButton = page.getByRole('banner').getByRole('button');
    await expect(menuButton).toBeVisible();
  });

  test('ハンバーガーメニューをクリックするとドロワーが開く', async ({ page }) => {
    await page.goto('/portfolio');

    // ハンバーガーメニューをクリック
    await page.getByRole('banner').getByRole('button').click();

    // ドロワーダイアログが表示されることを確認
    const drawer = page.getByRole('dialog', { name: 'Page index' });
    await expect(drawer).toBeVisible();

    // ナビゲーションリンクが表示されることを確認
    await expect(drawer.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'Products' })).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'Skills' })).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'Blog' })).toBeVisible();
  });

  test('モバイルドロワーのリンクをクリックすると対象セクションにスクロールする', async ({ page }) => {
    await page.goto('/portfolio');

    // 初期位置を記録
    const initialScrollY = await page.evaluate(() => window.scrollY);

    // ハンバーガーメニューを開く
    await page.getByRole('banner').getByRole('button').click();
    const drawer = page.getByRole('dialog', { name: 'Page index' });
    await expect(drawer).toBeVisible();

    // Productsリンクをクリック（Aboutより下のセクションでテスト）
    await drawer.getByRole('link', { name: 'Products' }).click();

    // スクロール完了を待機（ドロワーが閉じるまで少し長めに待機）
    await page.waitForTimeout(800);

    // スクロール位置が変化していることを確認
    const afterScrollY = await page.evaluate(() => window.scrollY);
    expect(afterScrollY).toBeGreaterThan(initialScrollY);
  });

  test('モバイルドロワーの閉じるボタンでメニューを閉じられる', async ({ page }) => {
    await page.goto('/portfolio');

    // ハンバーガーメニューを開く
    await page.getByRole('banner').getByRole('button').click();
    const drawer = page.getByRole('dialog', { name: 'Page index' });
    await expect(drawer).toBeVisible();

    // 閉じるボタンをクリック
    await page.getByRole('button', { name: 'メニューを閉じる' }).click();

    // ドロワーが閉じることを確認
    await expect(drawer).not.toBeVisible();
  });

  test('モバイルでBlogリンクはブログページへ遷移する', async ({ page }) => {
    await page.goto('/portfolio');

    // ハンバーガーメニューを開く
    await page.getByRole('banner').getByRole('button').click();
    const drawer = page.getByRole('dialog', { name: 'Page index' });
    await expect(drawer).toBeVisible();

    // Blogリンクをクリック
    await drawer.getByRole('link', { name: 'Blog' }).click();

    // ブログページに遷移したことを確認
    await expect(page).toHaveURL('/');
  });
});
