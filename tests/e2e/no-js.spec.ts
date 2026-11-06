import { test, expect } from '@playwright/test';

// toBeVisible は opacity:0 を「見えている」と判定するため、フェードの包みの opacity を直接検証する
test.describe('JS無効環境でもフェード対象のコンテンツが表示される', () => {
  test.use({ javaScriptEnabled: false });

  test('プロフィールのHeroの見出しとアバター枠が表示される', async ({ page }) => {
    await page.goto('/profile');

    const heading = page.getByRole('heading', { level: 1, name: 'Yuzu' });
    await expect(heading).toBeVisible();
    await expect(page.locator('#hero [data-fade]').first()).toHaveCSS('opacity', '1');
  });

  test('プロフィールのファーストビュー外のFadeInも表示される', async ({ page }) => {
    await page.goto('/profile');

    await expect(page.locator('#products [data-fade]').first()).toHaveCSS('opacity', '1');
  });

  test('ブログ一覧の先頭と末尾の記事カードが表示される', async ({ page }) => {
    await page.goto('/');

    const cards = page.locator('[data-fade]');
    await expect(cards.first()).toHaveCSS('opacity', '1');
    await expect(cards.last()).toHaveCSS('opacity', '1');
  });
});

test.describe('ファーストビューの要素はハイドレーションを待たずにフェードインする', () => {
  test('プロフィールのHeroはSSRの時点でanimate-fade-inが付いている', async ({ request }) => {
    const html = await (await request.get('/profile')).text();
    const hero = html.slice(html.indexOf('id="hero"'), html.indexOf('</section>', html.indexOf('id="hero"')));

    expect(hero).toContain('animate-fade-in');
    expect(hero).not.toContain('opacity-0');
  });

  test('プロフィールのHeroの見出しはフェードの対象外になっている', async ({ page }) => {
    await page.goto('/profile');

    await expect(page.getByRole('heading', { level: 1, name: 'Yuzu' })).toBeVisible();
    await expect(page.locator('#hero [data-fade] h1')).toHaveCount(0);
  });

  test('ブログ一覧は先頭3枚だけがSSRの時点でanimate-fade-inになっている', async ({ request }) => {
    const html = await (await request.get('/')).text();
    const fadeClasses = [...html.matchAll(/<div data-fade="[^"]*" class="([^"]*)"/g)].map((m) => m[1]);

    expect(fadeClasses.length).toBeGreaterThan(3);
    expect(fadeClasses.slice(0, 3)).toEqual(['animate-fade-in', 'animate-fade-in', 'animate-fade-in']);
    expect(fadeClasses.slice(3).every((c) => c === 'opacity-0')).toBe(true);
  });
});
