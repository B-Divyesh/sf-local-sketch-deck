import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { chromium, type Browser } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const releaseManifest = 'https://github.com/B-Divyesh/sf-local-sketch-deck/releases/latest/download/latest.json';
let browser: Browser;
let siteServer: Server;
let appServer: Server;
let siteUrl: string;
let appUrl: string;

const types: Record<string, string> = {
  '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript',
  '.json': 'application/json', '.ps1': 'text/plain', '.sh': 'text/x-shellscript', '.webp': 'image/webp'
};

async function serve(root: string): Promise<{ server: Server; url: string }> {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
      const file = resolve(root, pathname === '/' ? 'index.html' : `.${pathname}`);
      if (file !== root && !file.startsWith(`${root}${sep}`)) throw new Error('outside root');
      const data = await readFile(file);
      response.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
      response.end(data);
    } catch {
      response.writeHead(404).end('Not found');
    }
  });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  return { server, url: `http://127.0.0.1:${address.port}` };
}

function assertNoSeriousAxeViolations(violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) {
  const serious = violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
  assert.deepEqual(serious.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.length })), []);
}

before(async () => {
  ({ server: siteServer, url: siteUrl } = await serve(resolve('dist/site')));
  ({ server: appServer, url: appUrl } = await serve(resolve('dist/app')));
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  await Promise.all([
    new Promise<void>((done) => siteServer?.close(() => done())),
    new Promise<void>((done) => appServer?.close(() => done()))
  ]);
});

test('landing is responsive, accessible, private by default, and release-aware', { timeout: 30_000 }, async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const consoleErrors: string[] = [];
  const externalHosts = new Set<string>();
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin !== new URL(siteUrl).origin) externalHosts.add(url.hostname);
  });
  await page.route(releaseManifest, (route) => route.fulfill({
    contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' },
    body: JSON.stringify({ version: 'v9.9.9', platforms: { Linux: { url: 'https://example.invalid/app.AppImage' } } })
  }));

  await page.goto(siteUrl, { waitUntil: 'networkidle' });
  assert.equal(await page.title(), 'Local Sketch Deck — tiny interactive cards, kept local');
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('main').count(), 1);
  assert.equal(await page.locator('#downloadButton').textContent(), 'Download for Linux');
  assert.equal(await page.locator('#downloadButton').getAttribute('href'), 'https://example.invalid/app.AppImage');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.deepEqual([...externalHosts], ['github.com']);
  assert.deepEqual(consoleErrors, []);

  await page.locator('.skip').focus();
  const skipBox = await page.locator('.skip').boundingBox();
  assert.ok(skipBox && skipBox.y >= 0, 'skip link should become visible when keyboard-focused');
  assertNoSeriousAxeViolations((await new AxeBuilder({ page: page as never }).analyze()).violations);

  for (const path of ['/privacy.html', '/terms.html']) {
    await page.goto(`${siteUrl}${path}`);
    assert.equal(await page.locator('h1').count(), 1);
    assertNoSeriousAxeViolations((await new AxeBuilder({ page: page as never }).analyze()).violations);
  }
  await context.close();
});

test('landing keeps a usable offline fallback and reduced-motion treatment', { timeout: 30_000 }, async () => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.route(releaseManifest, (route) => route.abort('internetdisconnected'));
  await page.goto(siteUrl);
  await page.locator('#releaseNote').getByText(/Choose a release for/).waitFor();
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).scrollBehavior), 'auto');
  assert.equal(await page.locator('#downloadButton').getAttribute('href'), 'https://github.com/B-Divyesh/sf-local-sketch-deck/releases/latest');
  await context.close();
});

test('desktop editor works by keyboard at desktop and mobile sizes', { timeout: 30_000 }, async () => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 850 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto(appUrl);
  assertNoSeriousAxeViolations((await new AxeBuilder({ page: page as never }).analyze()).violations);
  await page.locator('#createSample').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#studio').isVisible(), true);
  await page.locator('#addButton').focus();
  await page.keyboard.press('Space');
  assert.equal(await page.locator('.canvas-el.selected').count(), 1);
  await page.locator('#previewProject').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#previewDialog').getAttribute('open'), '');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#previewDialog').getAttribute('open'), null);
  assertNoSeriousAxeViolations((await new AxeBuilder({ page: page as never }).analyze()).violations);

  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  const targets = await page.locator('button:visible').evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().height));
  assert.ok(targets.every((height) => height >= 38), 'compact desktop toolbar controls remain operable on mobile');
  assert.deepEqual(errors, []);
  await context.close();
});
