import { test, expect } from '@playwright/test';

test.describe('ナビゲーション機能', () => {
  test('About meセクションの「ブログを読む」ボタンでブログ一覧へ遷移できる', async ({ page }) => {
    await page.goto('/');
    
    // 「ブログを読む」ボタンを探してクリック
    const blogButton = page.getByRole('button', { name: 'ブログを読む' });
    await expect(blogButton).toBeVisible();
    await blogButton.click();
    
    // ブログページに遷移したことを確認
    await expect(page).toHaveURL('/blog');
    await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();
  });

  test('ブログページのヘッダーからProfileリンクでトップページに戻れる', async ({ page }) => {
    await page.goto('/blog');
    
    // Profileボタンをクリック
    const profileButton = page.getByRole('button', { name: 'Profile' });
    await expect(profileButton).toBeVisible();
    await profileButton.click();
    
    // トップページのAboutセクションに遷移することを確認
    await expect(page).toHaveURL('/#about');
  });
});

test.describe('アンカーリンク機能', () => {
  test.beforeEach(async ({ page }) => {
    // デスクトップビューでテスト
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('ヘッダーのナビゲーションリンクが表示される', async ({ page }) => {
    await page.goto('/');
    
    // ヘッダーのナビゲーションリンクが表示されていることを確認
    await expect(page.getByRole('link', { name: 'Top' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Skills' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Story' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Blog' })).toBeVisible();
  });

  test('アンカーリンクをクリックすると対象セクションまでスムーズスクロールする', async ({ page }) => {
    await page.goto('/');
    
    // 初期位置を記録
    const initialScrollY = await page.evaluate(() => window.scrollY);
    
    // Aboutリンクをクリック
    await page.getByRole('link', { name: 'About' }).click();
    
    // スクロールが発生したことを確認（スムーズスクロールのため少し待機）
    await page.waitForTimeout(500);
    
    // スクロール位置が変化していることを確認
    const afterScrollY = await page.evaluate(() => window.scrollY);
    expect(afterScrollY).toBeGreaterThan(initialScrollY);
    
    // Aboutセクションがビューポートに表示されていることを確認
    const aboutHeading = page.getByRole('heading', { name: 'About me' });
    await expect(aboutHeading).toBeInViewport();
  });

  test('Productsセクションへのスクロールナビゲーション', async ({ page }) => {
    await page.goto('/');
    
    // Productsリンクをクリック
    await page.getByRole('link', { name: 'Products' }).click();
    
    // スクロール完了を待機
    await page.waitForTimeout(500);
    
    // Productsセクションがビューポートに表示されていることを確認
    const productsHeading = page.getByRole('heading', { name: 'Products' });
    await expect(productsHeading).toBeInViewport();
  });

  test('Skillsセクションへのスクロールナビゲーション', async ({ page }) => {
    await page.goto('/');
    
    // Skillsリンクをクリック
    await page.getByRole('link', { name: 'Skills' }).click();
    
    // スクロール完了を待機
    await page.waitForTimeout(500);
    
    // Skillsセクションがビューポートに表示されていることを確認
    const skillsHeading = page.getByRole('heading', { name: 'Skills' });
    await expect(skillsHeading).toBeInViewport();
  });

  test('Storyセクションへのスクロールナビゲーション', async ({ page }) => {
    await page.goto('/');
    
    // Storyリンクをクリック
    await page.getByRole('link', { name: 'Story' }).click();
    
    // スクロール完了を待機
    await page.waitForTimeout(500);
    
    // Storyセクションがビューポートに表示されていることを確認
    const storyHeading = page.getByRole('heading', { name: 'My Story' });
    await expect(storyHeading).toBeInViewport();
  });

  test('Blogリンクはブログページへ遷移する（スムーズスクロールではない）', async ({ page }) => {
    await page.goto('/');
    
    // Blogリンクをクリック
    await page.getByRole('link', { name: 'Blog' }).click();
    
    // ブログページに遷移したことを確認
    await expect(page).toHaveURL('/blog');
  });

  test('セクション間を移動するとスクロール位置が正しく変化する', async ({ page }) => {
    await page.goto('/');
    
    // まずProductsセクションへ移動
    await page.getByRole('link', { name: 'Products' }).click();
    await page.waitForTimeout(500);
    const productsScrollY = await page.evaluate(() => window.scrollY);
    
    // 次にTopセクションへ戻る
    await page.getByRole('link', { name: 'Top' }).click();
    await page.waitForTimeout(500);
    const topScrollY = await page.evaluate(() => window.scrollY);
    
    // TopはProductsより上にある
    expect(topScrollY).toBeLessThan(productsScrollY);
  });
});

test.describe('モバイルビュー - アンカーリンク機能', () => {
  test.beforeEach(async ({ page }) => {
    // モバイルビューでテスト (iPhone 14サイズ)
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('モバイルでハンバーガーメニューが表示される', async ({ page }) => {
    await page.goto('/');
    
    // ハンバーガーメニューボタンが表示されていることを確認
    const menuButton = page.getByRole('banner').getByRole('button');
    await expect(menuButton).toBeVisible();
  });

  test('ハンバーガーメニューをクリックするとドロワーが開く', async ({ page }) => {
    await page.goto('/');
    
    // ハンバーガーメニューをクリック
    await page.getByRole('banner').getByRole('button').click();
    
    // ドロワーダイアログが表示されることを確認
    const drawer = page.getByRole('dialog', { name: 'Page index' });
    await expect(drawer).toBeVisible();
    
    // ナビゲーションリンクが表示されることを確認
    await expect(drawer.getByRole('link', { name: 'Top' })).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'Products' })).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'Skills' })).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'Story' })).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'Blog' })).toBeVisible();
  });

  test('モバイルドロワーのリンクをクリックすると対象セクションにスクロールする', async ({ page }) => {
    await page.goto('/');
    
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
    await page.goto('/');
    
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
    await page.goto('/');
    
    // ハンバーガーメニューを開く
    await page.getByRole('banner').getByRole('button').click();
    const drawer = page.getByRole('dialog', { name: 'Page index' });
    await expect(drawer).toBeVisible();
    
    // Blogリンクをクリック
    await drawer.getByRole('link', { name: 'Blog' }).click();
    
    // ブログページに遷移したことを確認
    await expect(page).toHaveURL('/blog');
  });
});
