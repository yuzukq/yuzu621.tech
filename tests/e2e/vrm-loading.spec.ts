import { test, expect, type Page } from '@playwright/test';

const VRM_ASSET_RE = /\/models\/.+\.vrma?$/;
// GPU の無い CI では、モデルのパースと WebGL の初期化が完了するまで数秒以上かかる
const VRM_LOAD_TIMEOUT_MS = 30_000;

function recordVrmRequests(page: Page) {
  const urls: string[] = [];
  page.on('request', (request) => {
    const { pathname } = new URL(request.url());
    if (VRM_ASSET_RE.test(pathname)) urls.push(pathname);
  });
  return urls;
}

// runWhenIdleAfterLoad の待機(load → requestIdleCallback)が終わるまで待つ
async function waitForIdleAfterLoad(page: Page) {
  await page.waitForLoadState('load');
  await page.evaluate(
    () => new Promise<void>((resolve) => requestIdleCallback(() => resolve(), { timeout: 3000 })),
  );
}

// Chromium は同じ URL への同時リクエストを HTTP キャッシュでまとめることがあり、
// request イベントの数では二重取得を検出できない。そのため fetch() の呼び出しを記録する。
// 開始時刻も Resource Timing ではなくここで取る(エントリはダウンロード完了まで追加されない)
async function recordAvatarFetches(page: Page) {
  await page.addInitScript(() => {
    const startTimes: number[] = [];
    (window as unknown as { __avatarFetchStartTimes: number[] }).__avatarFetchStartTimes = startTimes;
    const originalFetch = window.fetch;
    window.fetch = (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (url.endsWith('/models/avatar.vrm')) startTimes.push(performance.now());
      return originalFetch(input, init);
    };
  });
  return () =>
    page.evaluate(() => (window as unknown as { __avatarFetchStartTimes: number[] }).__avatarFetchStartTimes);
}

async function hasWebGL(page: Page) {
  return page.evaluate(() => !!document.createElement('canvas').getContext('webgl2'));
}

test.describe('VRM の読み込み', () => {
  test('データセーバー有効時は 3D を読み込まず、静的な表示になる', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'connection', {
        configurable: true,
        get: () => ({ saveData: true, effectiveType: '4g' }),
      });
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    const vrmRequests = recordVrmRequests(page);
    await page.goto('/profile');
    await waitForIdleAfterLoad(page);

    await expect(page.locator('#about').getByRole('img', { name: 'Profile Icon' })).toBeVisible();
    await expect(page.locator('#hero canvas')).toHaveCount(0);
    // FloatingAvatar のラッパー(showcase 時だけ描画される)
    await expect(page.locator('div.fixed.origin-top-left[aria-hidden="true"]')).toHaveCount(0);
    // Tech Stack はショーケースの高さ指定 div ではなく、静的グリッドになる
    await expect(page.locator('#tech-stack').getByText('FrontEnd')).toBeVisible();
    await expect(page.locator('#tech-stack div[style*="height"]')).toHaveCount(0);

    await page.evaluate(() =>
      document.getElementById('tech-stack')?.scrollIntoView({ block: 'start', behavior: 'instant' }),
    );
    await page.waitForTimeout(500);
    expect(vrmRequests).toEqual([]);
  });

  test('lg以上では load 後に avatar.vrm を取得し、Tech Stack 用の VRMA はスクロールするまで取得しない', async ({ page }) => {
    test.setTimeout(VRM_LOAD_TIMEOUT_MS * 3);
    await page.setViewportSize({ width: 1440, height: 900 });
    const vrmRequests = recordVrmRequests(page);
    const avatarFetchStartTimes = await recordAvatarFetches(page);
    await page.goto('/profile');
    test.skip(!(await hasWebGL(page)), 'WebGL が使えない環境では createVrmScene が取得前に失敗する');
    await waitForIdleAfterLoad(page);

    await expect
      .poll(async () => (await avatarFetchStartTimes()).length, { timeout: VRM_LOAD_TIMEOUT_MS })
      .toBe(1);
    const loadEventEnd = await page.evaluate(
      () => (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).loadEventEnd,
    );
    expect((await avatarFetchStartTimes())[0]).toBeGreaterThanOrEqual(loadEventEnd);
    expect(vrmRequests).not.toContain('/models/tech-idle.vrma');
    expect(vrmRequests).not.toContain('/models/present-card.vrma');

    const showcase = page.locator('#tech-stack div[style*="height"]');
    const targetY = await showcase.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), targetY);

    await expect
      .poll(() => vrmRequests, { timeout: VRM_LOAD_TIMEOUT_MS })
      .toContain('/models/present-card.vrma');
    expect(vrmRequests).toContain('/models/tech-idle.vrma');
    expect(await avatarFetchStartTimes()).toHaveLength(1);
  });
});
