import { test, expect } from '@playwright/test';

const locales = ['en', 'de', 'fr', 'ru'];
const widths = [320, 390, 768, 1440];
const local = (locale, path = '/') => (locale === 'en' ? path : `/${locale}${path}`);

async function settle(page) {
  await expect.poll(() => page.evaluate(() => document.fonts.status)).toBe('loaded');
}

async function readable(page) {
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('main h1')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(
    await page.locator('main .reveal, main p').evaluateAll((elements) =>
      elements.every((element) => {
        const style = getComputedStyle(element);
        return style.opacity !== '0' && style.visibility !== 'hidden' && style.display !== 'none';
      }),
    ),
  ).toBe(true);
}

test.beforeEach(async ({ context, page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Reading tests never fetch external content, including external embeds.
  await context.route('**/*', (route) =>
    new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort(),
  );
});

for (const locale of locales)
  for (const width of widths) {
    test(`reading routes, semantics and assets ${locale} ${width}`, async ({ page }, testInfo) => {
      test.setTimeout(90000);
      await page.setViewportSize({ width, height: 900 });
      const failures = [];
      page.on('pageerror', (error) => failures.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') failures.push(message.text());
      });
      page.on('response', (response) => {
        if (response.url().startsWith('http://127.0.0.1:4327') && response.status() >= 400)
          failures.push(response.url());
      });
      for (const path of [
        '/',
        '/notes/',
        '/notes/when-the-assistant-sleeps/',
        '/tags/',
        '/notes/archive/',
        '/about/',
        '/projects/',
        '/cv/',
        '/thesis/',
      ]) {
        expect((await page.goto(local(locale, path))).status()).toBe(200);
        await settle(page);
        await readable(page);
        await expect(page.locator('html')).toHaveAttribute('lang', locale);
        for (const current of await page.locator('#site-nav a[aria-current="page"]').all()) {
          await expect(current).toHaveAttribute('href', local(locale, path));
        }
        await expect(page.locator('.skip-link')).toHaveAttribute('href', '#main-content');
        await expect(page.locator('#main-content')).toHaveAttribute('tabindex', '-1');
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
          'href',
          `https://tomscholtes.com${local(locale, path)}`,
        );
        await expect(page.locator('link[type="application/rss+xml"]')).toHaveAttribute(
          'href',
          `https://tomscholtes.com${local(locale, '/rss.xml')}`,
        );
        if (path === '/') {
          await expect(page.locator('.notes-list > li')).toHaveCount(7);
          const firstEssay = await page
            .locator('.notes-list a.note-entry')
            .first()
            .getAttribute('href');
          await expect(page.locator('.latest-reading h2 a')).toHaveAttribute('href', firstEssay);
          for (const destination of [
            '/tags/',
            '/notes/archive/',
            '/projects/',
            '/about/',
            '/cv/',
            '/thesis/',
          ]) {
            await expect(
              page.locator(`main a[href="${local(locale, destination)}"]`).first(),
            ).toBeVisible();
          }
          expect(await page.locator('.topic-links a').count()).toBeGreaterThan(0);
          await page.screenshot({
            path: testInfo.outputPath('home.png'),
            fullPage: true,
            animations: 'disabled',
          });
        }
        if (path === '/cv/') {
          await expect(page.locator('main h2')).toHaveCount(4);
          await expect(page.locator('main')).toContainText('Alter Domus');
          await expect(page.locator('main')).toContainText('Erasmus School of Economics');
          await expect(page.locator(`main a[href="${local(locale, '/thesis/')}"]`)).toBeVisible();
          await page.screenshot({
            path: testInfo.outputPath('cv.png'),
            fullPage: true,
            animations: 'disabled',
          });
        }
      }
      expect(failures).toEqual([]);
    });
  }

for (const locale of locales) {
  test(`keyboard menu, skip, fragment and history ${locale}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(local(locale));
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    const button = page.locator('.nav-toggle');
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await page.locator('.nav-links a').first().focus();
    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
    expect(await button.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
      'none',
    );
    await page.keyboard.press('Space');
    await page.screenshot({
      path: testInfo.outputPath('menu-keyboard.png'),
      animations: 'disabled',
    });
    await page.locator(`.nav-links a[href="${local(locale, '/notes/')}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${local(locale, '/notes/')}$`));
    await expect(page.locator('.notes-index-header:not(.editorial-masthead) h1')).toBeVisible();
    await expect(page.locator('.notes-list')).toBeVisible();
    await expect(page.locator('.nav-links a[aria-current="page"]')).toHaveAttribute(
      'href',
      local(locale, '/notes/'),
    );
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await page.goBack();
    await expect(page.locator('.editorial-masthead')).toBeVisible();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await page.locator('a[href="#essays"]').click();
    await expect(page).toHaveURL(/#essays$/);
    const headingTop = await page
      .locator('#essays')
      .evaluate((element) => element.getBoundingClientRect().top);
    const navBottom = await page
      .locator('#site-nav')
      .evaluate((element) => element.getBoundingClientRect().bottom);
    expect(headingTop).toBeGreaterThanOrEqual(navBottom);
    await page.goto(local(locale, '/notes/when-the-assistant-sleeps/'));
    const id = await page.locator('.note-article p[id]').first().getAttribute('id');
    await page.goto(`${local(locale, '/notes/when-the-assistant-sleeps/')}#${id}`);
    await expect(page.locator(`[id="${id}"]`)).toBeVisible();
    await settle(page);
    expect(
      await page.locator(`[id="${id}"]`).evaluate((element) => element.getBoundingClientRect().top),
    ).toBeGreaterThanOrEqual(68);
    await expect(page.locator('a[href^="mailto:"]').first()).toBeVisible();
    await expect(page.locator('script[src*="giscus.app"]')).toHaveCount(0);
    await page.screenshot({
      path: testInfo.outputPath('paragraph-fragment.png'),
      animations: 'disabled',
    });
  });
}

test('touch menu closes on contact, back and desktop resize', async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  await context.route('**/*', (route) =>
    new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort(),
  );
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4327/');
  await page.locator('.nav-toggle').tap();
  await expect(page.locator('.nav-toggle')).toHaveAttribute('aria-expanded', 'true');
  await page.screenshot({ path: testInfo.outputPath('menu-touch.png'), animations: 'disabled' });
  await page.locator('.nav-link-menu-only').tap();
  await expect(page).toHaveURL(/\/about\/#contact$/);
  await expect(page.locator('#contact')).toBeVisible();
  await expect(page.locator('.nav-toggle')).toHaveAttribute('aria-expanded', 'false');
  await page.goBack();
  await expect(page.locator('.editorial-masthead')).toBeVisible();
  await page.locator('.nav-toggle').tap();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('.nav-toggle')).toHaveAttribute('aria-expanded', 'false');
  await context.close();
});

for (const mode of ['no-js', 'reduced-motion', 'enhancement-failure']) {
  test(`reading survives ${mode}`, async ({ browser }, testInfo) => {
    const context = await browser.newContext({
      javaScriptEnabled: mode !== 'no-js',
      reducedMotion: mode === 'reduced-motion' ? 'reduce' : 'no-preference',
      viewport: { width: 320, height: 900 },
    });
    await context.route('**/*', (route) => {
      const request = route.request();
      if (
        new URL(request.url()).hostname !== '127.0.0.1' ||
        (mode === 'enhancement-failure' && request.resourceType() === 'script')
      )
        return route.abort();
      return route.continue();
    });
    if (mode === 'enhancement-failure')
      await context.addInitScript(() => {
        window.IntersectionObserver = class {
          constructor() {
            throw new Error('Deliberate observer failure');
          }
        };
      });
    const page = await context.newPage();
    for (const locale of locales) {
      await page.goto(`http://127.0.0.1:4327${local(locale)}`);
      await settle(page);
      await readable(page);
      await expect(page.locator('.notes-list > li')).toHaveCount(7);
      if (mode === 'no-js') await expect(page.locator('.nav-links')).toBeVisible();
      else {
        const toggle = page.locator('.nav-toggle');
        if (await toggle.isVisible()) await toggle.click();
        await expect(page.locator('.nav-links')).toBeVisible();
      }
      const destination = await page.locator('.latest-reading h2 a').getAttribute('href');
      await page.locator('.latest-reading h2 a').click();
      await expect(page).toHaveURL(new RegExp(`${destination}$`));
      await expect(page.locator('.note-article')).toBeVisible();
      await readable(page);
      await page.screenshot({
        path: testInfo.outputPath(`${locale}.png`),
        fullPage: true,
        animations: 'disabled',
      });
    }
    await context.close();
  });
}

for (const state of ['absent', 'malformed', 'null', 'unsupported', 'unavailable']) {
  test(`preference boundary ${state}`, async ({ page }, testInfo) => {
    const warnings = [];
    const errors = [];
    page.on('console', (message) => {
      if (message.type() === 'warning') warnings.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.addInitScript((state) => {
      if (state === 'unavailable') {
        Object.defineProperty(window, 'localStorage', {
          get() {
            throw new DOMException('Storage blocked', 'SecurityError');
          },
        });
      } else if (state === 'malformed') localStorage.setItem('ts-display-prefs', '{bad');
      else if (state === 'null') localStorage.setItem('ts-display-prefs', 'null');
      else if (state === 'unsupported')
        localStorage.setItem(
          'ts-display-prefs',
          JSON.stringify({ theme: 'pink', density: 'tiny', accent: 'red' }),
        );
    }, state);
    await page.goto('/');
    await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'terracotta');
    await expect(page.locator('html')).not.toHaveAttribute('data-density');
    await page.getByRole('button', { name: 'Display settings', exact: true }).click();
    const panel = page.getByRole('dialog', { name: 'Display settings', exact: true });
    await panel.getByRole('button', { name: 'Ink', exact: true }).click();
    await panel.getByRole('button', { name: 'Airy', exact: true }).click();
    await panel.getByRole('button', { name: 'Forest', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'ink');
    await expect(page.locator('html')).toHaveAttribute('data-density', 'airy');
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'forest');
    await expect(panel.getByRole('button', { name: 'Forest', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.screenshot({ path: testInfo.outputPath('preferences.png'), animations: 'disabled' });
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await page.locator('.nav-links a[href="/notes/"]').click();
    await expect(page).toHaveURL(/\/notes\/$/);
    await expect(page.locator('.notes-index-header:not(.editorial-masthead) h1')).toBeVisible();
    await expect(page.locator('.notes-list')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'ink');
    await readable(page);
    if (state === 'malformed' || state === 'unavailable')
      expect(warnings.some((text) => text.includes('Display preferences unavailable'))).toBe(true);
    else
      expect(warnings.filter((text) => text.includes('Display preferences unavailable'))).toEqual(
        [],
      );
    expect(errors).toEqual([]);
    await testInfo.attach('storage-diagnostics', {
      body: JSON.stringify({ state, warnings, errors }),
      contentType: 'application/json',
    });
  });
}

for (const locale of locales) {
  test(`self-hosted font use and loading evidence ${locale}`, async ({
    page,
    context,
  }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(local(locale));
    await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
    await settle(page);
    const fonts = await page.evaluate(async (locale) => {
      const results = {};
      for (const family of ['Instrument Serif', 'Inter', 'JetBrains Mono']) {
        const sample = locale === 'ru' && family !== 'Instrument Serif' ? 'Привет' : 'Reading';
        await document.fonts.load(`400 16px "${family}"`, sample);
        results[family] = document.fonts.check(`400 16px "${family}"`, sample);
      }
      return {
        results,
        resources: performance.getEntriesByType('resource').map((entry) => ({
          name: entry.name,
          transferSize: entry.transferSize,
          encodedBodySize: entry.encodedBodySize,
          duration: entry.duration,
        })),
        navigation: performance.getEntriesByType('navigation')[0].toJSON(),
      };
    }, locale);
    expect(Object.values(fonts.results)).toEqual([true, true, true]);
    expect(
      fonts.resources.every((entry) => new URL(entry.name).origin === 'http://127.0.0.1:4327'),
    ).toBe(true);
    const session = await context.newCDPSession(page);
    await session.send('DOM.enable');
    await session.send('CSS.enable');
    const { root } = await session.send('DOM.getDocument');
    const { nodeId } = await session.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: 'main .sub',
    });
    const actualFonts = await session.send('CSS.getPlatformFontsForNode', { nodeId });
    expect(
      actualFonts.fonts.some(
        (font) => font.familyName === 'Inter' && font.isCustomFont && font.glyphCount > 0,
      ),
    ).toBe(true);
    if (locale === 'ru') {
      const { nodeId: headingNode } = await session.send('DOM.querySelector', {
        nodeId: root.nodeId,
        selector: 'main h1',
      });
      const headingFonts = await session.send('CSS.getPlatformFontsForNode', {
        nodeId: headingNode,
      });
      await testInfo.attach('heading-fonts', {
        body: JSON.stringify(headingFonts),
        contentType: 'application/json',
      });
      expect(
        headingFonts.fonts.some(
          (font) =>
            font.familyName === 'Inter Light' &&
            font.postScriptName === 'Inter-Light' &&
            font.isCustomFont &&
            font.glyphCount > 0,
        ),
      ).toBe(true);
      fonts.headingFonts = headingFonts;
      await expect(page.locator('main')).toContainText(/[А-Яа-я]/u);
      expect(fonts.resources.some((entry) => entry.name.includes('inter-400-cyrl.woff2'))).toBe(
        true,
      );
    }
    await session.detach();
    await testInfo.attach('font-and-loading-evidence', {
      body: JSON.stringify({ locale, ...fonts, actualFonts }),
      contentType: 'application/json',
    });
  });
}

test('all editorial reading paths resolve to real content and fragment targets', async ({
  page,
  request,
}) => {
  for (const locale of locales) {
    await page.goto(local(locale));
    const links = await page
      .locator('main a')
      .evaluateAll((elements) => [
        ...new Set(elements.map((element) => element.getAttribute('href'))),
      ]);
    for (const href of links) {
      const url = new URL(href, `http://127.0.0.1:4327${local(locale)}`);
      const response = await request.get(url.pathname);
      expect(response.status(), href).toBe(200);
      if (url.hash) expect(await response.text(), href).toContain(`id="${url.hash.slice(1)}"`);
    }
    const topic = page.locator('.topic-links a').first();
    const destination = await topic.getAttribute('href');
    await topic.click();
    await expect(page).toHaveURL(new RegExp(`${destination}$`));
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('.notes-index-header:not(.editorial-masthead) h1')).toBeVisible();
    await expect(page.locator('.notes-list')).toBeVisible();
  }
});
