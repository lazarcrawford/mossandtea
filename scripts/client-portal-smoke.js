#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(__dirname, '..');
const TARGET = process.env.CLIENT_PORTAL_URL || `file://${path.join(ROOT, 'hermitage', 'index.html')}?demo=1`;
const BROWSER_CANDIDATES = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
  chromium.executablePath(),
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
].filter(Boolean);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function staticChecks() {
  const html = fs.readFileSync(path.join(ROOT, 'hermitage', 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(ROOT, 'hermitage', 'css', 'hermitage.css'), 'utf8');
  const js = fs.readFileSync(path.join(ROOT, 'hermitage', 'js', 'hermitage.js'), 'utf8');
  const redirect = fs.readFileSync(path.join(ROOT, 'portal', 'index.html'), 'utf8');

  assert(html.includes('Hermitage'), 'Hermitage HTML should include brand');
  assert(html.includes('data-login-form'), 'Hermitage should include invite login form');
  assert(html.includes('data-gallery'), 'Hermitage should include gallery surface');
  assert(html.includes('data-documents'), 'Hermitage should include documents surface');
  assert(html.includes('data-invoices'), 'Hermitage should include billing surface');
  assert(css.includes('@media (max-width: 720px)'), 'Hermitage CSS should include mobile breakpoint');
  assert(css.includes('--bronze') && css.includes('--wine') && css.includes('--moss'), 'Hermitage CSS should include full palette');
  assert(js.includes('signInWithOtp'), 'Hermitage JS should use magic-link auth');
  assert(js.includes('createSignedUrl'), 'Hermitage JS should use signed Storage URLs');
  assert(js.includes('client_file_selections'), 'Hermitage JS should persist selections');
  assert(js.includes('demoMode'), 'Hermitage JS should include local demo mode');
  assert(redirect.includes('/hermitage/'), 'Portal compatibility page should redirect to Hermitage');
}

async function run() {
  const executablePath = BROWSER_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  staticChecks();
  if (!executablePath) {
    console.warn('Client portal static smoke passed; browser smoke skipped because no Chromium-compatible executable was found');
    return;
  }

  let browser;
  try {
    browser = await chromium.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox'],
    });
  } catch (error) {
    console.warn(`Client portal static smoke passed; browser smoke skipped because Chromium could not launch: ${error.message.split('\n')[0]}`);
    return;
  }

  try {
    for (const [name, viewport, isMobile] of [
      ['mobile', { width: 390, height: 844 }, true],
      ['desktop', { width: 1440, height: 980 }, false],
    ]) {
      const page = await browser.newPage({ viewport, isMobile });
      await page.goto(TARGET, { waitUntil: 'load' });
      await page.waitForSelector('[data-app]', { timeout: 10000 });

      const layout = await page.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        const hero = document.querySelector('.hero');
        return {
          scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
          viewportWidth: window.innerWidth,
          heroHeight: hero?.getBoundingClientRect().height || 0,
        };
      });

      assert(layout.scrollWidth <= layout.viewportWidth + 1, `${name}: horizontal overflow (${layout.scrollWidth}px > ${layout.viewportWidth}px)`);
      assert(layout.heroHeight > 260, `${name}: hero is unexpectedly short`);
      await page.waitForSelector('[data-workspace]:not([hidden])', { timeout: 10000 });
      await page.locator('[data-view-button="gallery"]').click();
      await page.waitForSelector('.gallery-grid .image-card', { timeout: 10000 });
      await page.locator('[data-select-file]').first().click();
      await page.waitForFunction(() => document.querySelector('[data-selection-count]')?.textContent.includes('1 selected'), null, { timeout: 10000 });
      await page.locator('[data-open-image]').first().click();
      await page.waitForSelector('.lightbox:not([hidden]) img[src]', { timeout: 10000 });
      await page.locator('[data-lightbox-next]').evaluate((el) => el.click());
      await page.keyboard.press('Escape');
      await page.waitForSelector('.lightbox', { state: 'hidden', timeout: 10000 });
      await page.close();
    }

    await browser.close();
    console.log('Hermitage smoke passed: layout, invite form, and static client surfaces work on mobile and desktop');
  } catch (error) {
    await browser.close();
    throw error;
  }
}

run().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
