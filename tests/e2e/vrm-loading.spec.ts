import { test, expect, type Page } from '@playwright/test';

const VRM_ASSET_RE = /\/models\/.+\.vrma?$/;
// GPU の無い CI では、モデルのパースと WebGL の初期化が完了するまで数秒以上かかる
const VRM_LOAD_TIMEOUT_MS = 30_000;
const LOAD_DELAY_MS = 3_000;

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

  test('モバイルでは three 一式のチャンクを load の後まで取得しない', async ({ page }) => {
    // フォントの preload だけで既定の上限(250件)が埋まり、JS のエントリが記録されなくなる
    await page.addInitScript(() => performance.setResourceTimingBufferSize(2000));
    // ローカルではハイドレーションより先に load が来てしまい、チャンクを早く取得していても
    // 検出できない。応答の遅い画像を置いて、遅い回線と同じく load をハイドレーションより後にする
    await page.route('**/__delay-load.png', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, LOAD_DELAY_MS));
      await route.fulfill({ status: 204 });
    });
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        const img = document.createElement('img');
        img.src = '/__delay-load.png';
        img.hidden = true;
        document.body.appendChild(img);
      });
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/profile');
    await waitForIdleAfterLoad(page);

    // チャンク名はビルドごとのハッシュなので、three-vrm の glTF 拡張名を中身から探して特定する
    const VRM_CHUNK_MARKER = 'VRMC_vrm';
    const listScripts = () =>
      page.evaluate(() => {
        const { loadEventStart } = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return performance
          .getEntriesByType('resource')
          .filter((entry) => new URL(entry.name).pathname.endsWith('.js'))
          .map((entry) => ({ url: entry.name, beforeLoad: entry.startTime < loadEventStart }));
      });
    const listVrmChunks = async () => {
      const chunks = [];
      for (const script of await listScripts()) {
        if ((await (await page.request.get(script.url)).text()).includes(VRM_CHUNK_MARKER)) chunks.push(script);
      }
      return chunks;
    };

    // 取得されるまで待ってから時刻を見る(マーカーが外れていてテストが素通りするのを防ぐ)
    await expect
      .poll(async () => (await listVrmChunks()).length, { timeout: VRM_LOAD_TIMEOUT_MS })
      .toBeGreaterThan(0);
    expect((await listVrmChunks()).filter((chunk) => chunk.beforeLoad)).toEqual([]);
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
