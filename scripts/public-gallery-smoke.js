#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(__dirname, '..');
const BRAVE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const TARGET = process.env.PUBLIC_UI_URL || 'https://mossandtea.com/';

const chapters = [
  ['Women as Witness', 'witness', 13],
  ['Body as Landscape', 'body', 8],
  ['Earth as Element', 'earth', 9],
  ['Spaces as Afterimages', 'trace', 5],
];

async function visibleGalleryCount(page) {
  return page.locator('#gallery [data-lightbox]:visible').count();
}

async function run() {
  if (!fs.existsSync(BRAVE)) throw new Error(`Brave executable not found at ${BRAVE}`);

  const browser = await chromium.launch({
    executablePath: BRAVE,
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });

  try {
    await page.goto(`${TARGET}?smoke=${Date.now()}`, { waitUntil: 'networkidle' });
    await page.locator('#portfolio').scrollIntoViewIfNeeded();
    await page.waitForSelector('#gallery [data-lightbox]', { state: 'attached', timeout: 15000 });

    const total = await page.locator('#gallery [data-lightbox]').count();
    if (total !== 35) throw new Error(`Expected 35 archive images in homepage gallery, found ${total}`);

    for (const [label, category, expected] of chapters) {
      await page.getByRole('tab', { name: label }).click();
      await page.waitForFunction(
        ({ category, expected }) => {
          const visible = Array.from(document.querySelectorAll('#gallery [data-lightbox]'))
            .filter((item) => !item.hidden && item.dataset.category === category);
          return visible.length === expected;
        },
        { category, expected },
        { timeout: 10000 }
      );

      const visible = await visibleGalleryCount(page);
      if (visible !== expected) throw new Error(`${label}: expected ${expected} visible images, found ${visible}`);

      await page.locator('#gallery [data-lightbox]:visible').first().click();
      await page.waitForSelector('.lightbox.lightbox--open', { state: 'visible', timeout: 10000 });
      await page.waitForSelector(`.lightbox.lightbox--${category}`, { state: 'visible', timeout: 10000 });
      await page.waitForFunction(() => {
        const img = document.querySelector('.lightbox--open img');
        return img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
      }, null, { timeout: 15000 });
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Escape');
      await page.waitForSelector('.lightbox.lightbox--open', { state: 'hidden', timeout: 10000 });
    }

    fs.mkdirSync(path.join(ROOT, '.codex-artifacts'), { recursive: true });
    await page.screenshot({ path: path.join(ROOT, '.codex-artifacts/public-gallery-smoke.png'), fullPage: true });
    await browser.close();
    console.log('Public gallery smoke passed: 35 images across 4 chapters');
  } catch (err) {
    fs.mkdirSync(path.join(ROOT, '.codex-artifacts'), { recursive: true });
    await page.screenshot({ path: path.join(ROOT, '.codex-artifacts/public-gallery-smoke-failure.png'), fullPage: true }).catch(() => {});
    await browser.close();
    throw err;
  }
}

run().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
