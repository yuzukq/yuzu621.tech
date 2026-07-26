import { test, expect, type Page } from '@playwright/test';

// プロダクトカードは #products 内の <button>。特定のプロダクト名に依存すると
// コンテンツ(_products/*.md)を編集するたびにテストが壊れるため、先頭カードで
// 開閉挙動だけを検証する。オーバーレイは常に「スクリーンショット」見出しと
// .markdown-body(本文)を持つので、これを開閉判定のマーカーにする。
async function openFirstProduct(page: Page) {
  await page.goto('/profile');
  await page.locator('#products button').first().click();
  await expect(page.getByText('スクリーンショット')).toBeVisible();
  await expect(page.locator('.markdown-body')).toBeVisible();
}

test('プロダクトカードをクリックするとオーバーレイが表示される', async ({ page }) => {
  await openFirstProduct(page);
});

test('オーバーレイを閉じるボタンで閉じられる', async ({ page }) => {
  await openFirstProduct(page);

  await page.getByRole('button', { name: '閉じる' }).click();

  await expect(page.getByText('スクリーンショット')).not.toBeVisible();
});

test('Escapeキーでオーバーレイを閉じられる', async ({ page }) => {
  await openFirstProduct(page);

  await page.keyboard.press('Escape');

  await expect(page.getByText('スクリーンショット')).not.toBeVisible();
});

test('オーバーレイの外側をクリックして閉じられる', async ({ page }) => {
  await openFirstProduct(page);

  // 座標(10,10)=左上の端はオーバーレイの外側(バックドロップ)にあたる
  await page.mouse.click(10, 10);

  await expect(page.getByText('スクリーンショット')).not.toBeVisible();
});
