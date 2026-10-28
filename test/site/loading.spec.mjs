import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`equivalent cold loading observation ${width}`, async ({ page, context }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
    await context.route('**/*', (route) =>
      new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort(),
    );
    await page.goto('/');
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
    await page.evaluate(() => document.fonts.ready);
    // This is an initial document load, not a client-navigation completion check.
    await page.waitForLoadState('networkidle');
    const observation = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource').map((entry) => ({
        path: new URL(entry.name).pathname,
        type: entry.initiatorType,
        transfer: entry.transferSize,
        bytes: entry.encodedBodySize,
        duration: entry.duration,
      }));
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        width: innerWidth,
        height: innerHeight,
        resources,
        requests: resources.length,
        transfer: resources.reduce((sum, item) => sum + item.transfer, navigation.transferSize),
        encodedBytes: resources.reduce((sum, item) => sum + item.bytes, navigation.encodedBodySize),
        documentBytes: navigation.encodedBodySize,
        domContentLoaded: navigation.domContentLoadedEventEnd,
        load: navigation.loadEventEnd,
      };
    });
    await testInfo.attach('cold-loading', {
      body: JSON.stringify(observation),
      contentType: 'application/json',
    });
    await page.screenshot({
      path: testInfo.outputPath('settled-home.png'),
      fullPage: true,
      animations: 'disabled',
    });
  });
}
