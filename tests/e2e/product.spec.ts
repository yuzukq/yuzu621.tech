import { test, expect } from '@playwright/test';

test('プロダクトカードをクリックするとオーバーレイが表示される', async ({ page }) => {
  await page.goto('/profile');

  const productCard = page.getByRole('heading', { name: 'Portfolio Website' }).locator('..');
  await productCard.click();
  
  await expect(page.getByText('Portfolio Website').first()).toBeVisible();
  await expect(page.getByText('スクリーンショット')).toBeVisible();
  await expect(page.getByText('主な機能')).toBeVisible();
});

test('オーバーレイを閉じるボタンで閉じられる', async ({ page }) => {
  await page.goto('/profile');
  
  const productCard = page.getByRole('heading', { name: 'Better Portal Extension' }).locator('..');
  await productCard.click();
  
  await expect(page.getByText('Recolle').first()).toBeVisible();
  await expect(page.getByText('スクリーンショット')).toBeVisible();
  
  await page.getByRole('button', { name: '閉じる' }).click();
  
  await expect(page.getByText('スクリーンショット')).not.toBeVisible();
});

test('Escapeキーでオーバーレイを閉じられる', async ({ page }) => {
  await page.goto('/profile');
  
  const productCard = page.getByRole('heading', { name: 'Recolle' }).locator('..');
  await productCard.click();
  
  await expect(page.getByText('Recolle').first()).toBeVisible();
  await expect(page.getByText('スクリーンショット')).toBeVisible();
  
  await page.keyboard.press('Escape');
  
  await expect(page.getByText('スクリーンショット')).not.toBeVisible();
});

test('オーバーレイの外側をクリックして閉じられる', async ({ page }) => {
  await page.goto('/profile');
  
  const productCard = page.getByRole('heading', { name: 'AttendanceReminder-forCIT' }).locator('..');
  await productCard.click();
  
  await expect(page.getByText('AttendanceReminder-forCIT').first()).toBeVisible();
  await expect(page.getByText('スクリーンショット')).toBeVisible();
  
  // 座標(10,10)=左上の端はオーバーレイの外側にあたる
  await page.mouse.click(10, 10);
  
  await expect(page.getByText('スクリーンショット')).not.toBeVisible();
});
