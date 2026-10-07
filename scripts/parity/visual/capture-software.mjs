/* eslint-disable no-await-in-loop -- Serial captures preserve rendering conditions; serial diffs bound full-page image memory. */
import { chromium } from 'playwright';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const [baseURL, output, revision = 'unspecified'] = process.argv.slice(2);
if (!baseURL || !output) throw new Error('Usage: node capture.mjs BASE_URL OUTPUT REVISION');
const pages = [
  ['home', '/'], ['posts', '/posts/'], ['tags', '/tags/'], ['archives', '/archives/'],
  ['about', '/about/'], ['search', '/search/'],
  ['article', '/posts/adding-new-posts-in-astropaper-theme/'],
  ['search-results', '/search/?q=theme'], ['mobile-menu', '/'],
];
const viewports = { desktop: { width: 1280, height: 900 }, mobile: { width: 390, height: 844 } };
await mkdir(output);
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--disable-gpu'] });
const manifest = { baseURL, revision, capturedAt: new Date().toISOString(), browser: browser.version(), settings: { browserArgs: ['--disable-gpu'], deviceScaleFactor: 1, locale: 'en-US', timezoneId: 'Europe/Berlin', animations: 'disabled', fullPage: true, clock: 'real', masks: [] }, captures: [] };
try {
  for (const [viewportName, viewport] of Object.entries(viewports)) {
    for (const theme of ['light', 'dark']) {
      for (const [name, route] of pages) {
        if (name === 'mobile-menu' && viewportName !== 'mobile') continue;
        const context = await browser.newContext({ viewport, deviceScaleFactor: 1, colorScheme: theme, locale: 'en-US', timezoneId: 'Europe/Berlin' });
        await context.addInitScript(selectedTheme => localStorage.setItem('theme', selectedTheme), theme);
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const response = await page.goto(new URL(route, baseURL).href, { waitUntil: 'networkidle' });
        if (response.status() !== 200) throw new Error(`${route} returned ${response.status()}`);
        if (name.startsWith('search')) await page.getByPlaceholder('Search').waitFor();
        if (name === 'search-results') await page.locator('.pagefind-ui__result').first().waitFor();
        if (name === 'mobile-menu') await page.getByRole('button', { name: 'Open menu', exact: true }).click();
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all(Array.from(document.images, image => image.decode().catch(() => undefined)));
        });
        const file = `${viewportName}-${theme}-${name}.png`;
        await page.screenshot({ path: path.join(output, file), fullPage: true, animations: 'disabled' });
        const details = await page.evaluate(() => ({ title: document.title, text: document.body.innerText, fonts: Array.from(document.fonts, font => ({ family: font.family, status: font.status })), theme: document.documentElement.dataset.theme, width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight }));
        const bytes = await readFile(path.join(output, file));
        manifest.captures.push({ file, name, route, viewport, theme, sha256: createHash('sha256').update(bytes).digest('hex'), ...details, errors });
        await writeFile(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
        console.log(file);
        await context.close();
      }
    }
  }
} finally { await browser.close(); }
process.exitCode = manifest.captures.some(capture => capture.errors.length > 0) ? 1 : 0;
