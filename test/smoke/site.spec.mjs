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
