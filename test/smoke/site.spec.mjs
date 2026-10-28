import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const baseline = JSON.parse(readFileSync(new URL('./paragraphs.json', import.meta.url), 'utf8'));

test('existing publication serves content and locale routes', async ({ page }) => {
  for (const path of ['/', '/de/', '/fr/', '/ru/', '/notes/', '/about/', '/cv/', '/projects/']) {
    const response = await page.goto(path);
    expect(response.status(), path).toBe(200);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('body')).toContainText('Tom Scholtes');
  }
});

test('every existing paragraph citation still resolves in served article bytes', async ({
  request,
}) => {
  for (const [path, ids] of Object.entries(baseline)) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    const body = await response.text();
    for (const id of ids) expect(body, `${path}#${id}`).toContain(`id="${id}"`);
  }
});

const prose = JSON.parse(readFileSync(new URL('./prose.json', import.meta.url), 'utf8'));

test('existing published paragraph text and inline spacing match the baseline', async ({
  page,
  request,
}) => {
  for (const [path, expected] of Object.entries(prose)) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    const actual = await page.evaluate(
      ({ body, ids }) => {
        const document = new DOMParser().parseFromString(body, 'text/html');
        return Object.fromEntries(
          ids.map((id) => {
            const paragraph = document.getElementById(id);
            if (!paragraph) return [id, null];
            for (const anchor of paragraph.querySelectorAll('a.para-anchor')) anchor.remove();
            return [id, paragraph.textContent.replace(/\s+/g, ' ').trim()];
          }),
        );
      },
      { body: await response.text(), ids: Object.keys(expected) },
    );
    expect(actual, path).toEqual(expected);
  }
});

test('retained graph examples emit valid existing data rather than literal template expressions', async ({
  page,
}) => {
  for (const path of [
    '/lab/v3/',
    ...[1, 2, 3, 4, 5].map((number) => `/lab/r2/nodegraph-${number}/`),
  ]) {
    const errors = [];
    const listener = (error) => errors.push(error.message);
    page.on('pageerror', listener);
    const response = await page.goto(path);
    expect(response.status(), path).toBe(200);
    const payloads = await page.locator('script[type="application/json"]').allTextContents();
    expect(payloads.length, path).toBeGreaterThan(0);
    for (const body of payloads) expect(() => JSON.parse(body), path).not.toThrow();
    const data = payloads.map((body) => JSON.parse(body)).find((item) => item.nodes && item.edges);
    expect(data, path).toBeTruthy();
    expect(Object.keys(data.nodes).length, path).toBeGreaterThan(0);
    expect(data.edges.length, path).toBeGreaterThan(0);
    expect(errors, path).toEqual([]);
    page.off('pageerror', listener);
  }
});

for (const locale of ['en', 'ru']) {
  test(`existing fonts, Cyrillic and display preferences survive upgrade (${locale})`, async ({
    page,
    context,
  }, testInfo) => {
    const home = locale === 'en' ? '/' : '/ru/';
    const notes = locale === 'en' ? '/notes/' : '/ru/notes/';
    await page.setViewportSize({ width: locale === 'en' ? 1440 : 390, height: 900 });
    const assetFailures = [];
    page.on('response', (response) => {
      if (new URL(response.url()).origin === 'http://127.0.0.1:4327' && response.status() >= 400)
        assetFailures.push(response.url());
    });
    await page.goto(home);
    await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
    const main = page.locator('main');
    await expect(main).toBeVisible();
    if (locale === 'ru') expect(await main.innerText()).toMatch(/[А-Яа-я]/u);
    const fonts = await page.evaluate(
      async (sample) => {
        await document.fonts.ready;
        const available = {};
        for (const family of ['Inter', 'Instrument Serif', 'JetBrains Mono']) {
          await document.fonts.load(
            `400 16px "${family}"`,
            family === 'Instrument Serif' ? 'Reading' : sample,
          );
          available[family] = document.fonts.check(
            `400 16px "${family}"`,
            family === 'Instrument Serif' ? 'Reading' : sample,
          );
        }
        return {
          available,
          resources: performance
            .getEntriesByType('resource')
            .map((item) => item.name)
            .filter((name) => name.includes('/fonts/')),
        };
      },
      locale === 'ru' ? 'Привет' : 'Reading',
    );
    expect(Object.values(fonts.available)).toEqual([true, true, true]);
    if (locale === 'ru')
      expect(fonts.resources.some((url) => url.includes('inter-400-cyrl.woff2'))).toBe(true);
    const session = await context.newCDPSession(page);
    await session.send('DOM.enable');
    await session.send('CSS.enable');
    const { root } = await session.send('DOM.getDocument');
    const { nodeId } = await session.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: 'main .sub',
    });
    const usedFonts = await session.send('CSS.getPlatformFontsForNode', { nodeId });
    expect(
      usedFonts.fonts.some(
        (font) => font.familyName === 'Inter' && font.isCustomFont && font.glyphCount > 0,
      ),
    ).toBe(true);
    await session.detach();
    await testInfo.attach(`fonts-${locale}`, {
      body: JSON.stringify({ ...fonts, usedFonts }),
      contentType: 'application/json',
    });

    for (const [theme, density, themeLabel, densityLabel] of [
      ['dark', 'compact', 'Dark', 'Compact'],
      ['ink', 'airy', 'Ink', 'Airy'],
      ['light', 'default', 'Light', 'Default'],
    ]) {
      await page.getByRole('button', { name: 'Display settings', exact: true }).click();
      const panel = page.getByRole('dialog', { name: 'Display settings', exact: true });
      await panel.getByRole('button', { name: themeLabel, exact: true }).click();
      await panel.getByRole('button', { name: densityLabel, exact: true }).click();
      const assertPreferences = async () => {
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        if (density === 'default')
          await expect(page.locator('html')).not.toHaveAttribute('data-density');
        else await expect(page.locator('html')).toHaveAttribute('data-density', density);
      };
      await assertPreferences();
      await expect
        .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('ts-display-prefs'))))
        .toMatchObject({ theme, density });
      await page.keyboard.press('Escape');
      if (locale === 'ru') await page.locator('.nav-toggle').click();
      await page.locator(`.nav-links a[href="${notes}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${notes.replace(/\/$/, '')}/?$`));
      await assertPreferences();
      await page.reload();
      await assertPreferences();
      await page.locator('a.brand').click();
      await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
      await assertPreferences();
    }
    expect(assetFailures).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath(`compatibility-${locale}.png`),
      fullPage: true,
    });
  });
}
