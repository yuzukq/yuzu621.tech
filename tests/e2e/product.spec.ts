import { test, expect } from '@playwright/test';

test('プロダクトカードをクリックするとオーバーレイが表示される', async ({ page }) => {
  await page.goto('/profile');

  // Portfolio Websiteのカードをクリック
  const productCard = page.getByRole('heading', { name: 'Portfolio Website' }).locator('..');
  await productCard.click();
  
  // オーバーレイが表示されることを確認
  await expect(page.getByText('Portfolio Website').first()).toBeVisible();
  await expect(page.getByText('スクリーンショット')).toBeVisible();
  await expect(page.getByText('概要')).toBeVisible();
});

test('オーバーレイを閉じるボタンで閉じられる', async ({ page }) => {
  await page.goto('/profile');
  
  // プロダクトカードをクリックしてオーバーレイを開く
  const productCard = page.getByRole('heading', { name: 'Better Portal Extension' }).locator('..');
  await productCard.click();
  
  // オーバーレイが表示されることを確認
  await expect(page.getByText('Recolle').first()).toBeVisible();
  await expect(page.getByText('スクリーンショット')).toBeVisible();
  
  // 閉じるボタンをクリック
  await page.getByRole('button', { name: '閉じる' }).click();
  
  // オーバーレイが閉じられたことを確認
  await expect(page.getByText('スクリーンショット')).not.toBeVisible();
});

test('Escapeキーでオーバーレイを閉じられる', async ({ page }) => {
  await page.goto('/profile');
  
  // プロダクトカードをクリックしてオーバーレイを開く
  const productCard = page.getByRole('heading', { name: 'Recolle' }).locator('..');
  await productCard.click();
  
  // オーバーレイが表示されることを確認
  await expect(page.getByText('Recolle').first()).toBeVisible();
  await expect(page.getByText('スクリーンショット')).toBeVisible();
  
  // Escapeキーを押す
  await page.keyboard.press('Escape');
  
  // オーバーレイが閉じられたことを確認
  await expect(page.getByText('スクリーンショット')).not.toBeVisible();
});

test('オーバーレイの外側をクリックして閉じられる', async ({ page }) => {
  await page.goto('/profile');
  
  // プロダクトカードをクリックしてオーバーレイを開く
  const productCard = page.getByRole('heading', { name: 'AttendanceReminder-forCIT' }).locator('..');
  await productCard.click();
  
  // オーバーレイが表示されることを確認
  await expect(page.getByText('AttendanceReminder-forCIT').first()).toBeVisible();
  await expect(page.getByText('スクリーンショット')).toBeVisible();
  
  // オーバーレイの外側の背景をクリック（左上の端をクリック）
  await page.mouse.click(10, 10);
  
  // オーバーレイが閉じられたことを確認
  await expect(page.getByText('スクリーンショット')).not.toBeVisible();
});
