#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(__dirname, '..');
const BRAVE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const TARGET = process.env.PUBLIC_UI_URL || 'https://mossandtea.com/';

const chapters = [
  ['The Held Gaze', 'held-gaze', 56],
  ['Body as Element', 'body-element', 31],
  ['Earth & Dream', 'earth-dream', 26],
  ['The Spiral Dance', 'spiral-dance', 11],
];

const viewports = [
  ['small-mobile', { width: 360, height: 740 }, true],
  ['mobile', { width: 390, height: 844 }, true],
  ['tablet', { width: 820, height: 1180 }, false],
  ['desktop', { width: 1440, height: 980 }, false],
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function getLayout(page) {
  return page.evaluate(() => {
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const doc = document.documentElement;
    const body = document.body;
    const gallery = document.querySelector('#gallery');
    const chapters = document.querySelector('#portfolioChapters');
    const chapterRect = chapters?.getBoundingClientRect();
    const galleryRect = gallery?.getBoundingClientRect();
    const buttons = Array.from(document.querySelectorAll('#portfolioChapters .portfolio__chapter')).map((button) => {
      const rect = button.getBoundingClientRect();
      return {
        label: button.textContent.trim(),
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      };
    });

    return {
      viewport,
      scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
      chapterRect: chapterRect && {
        left: chapterRect.left,
        right: chapterRect.right,
        top: chapterRect.top,
        bottom: chapterRect.bottom,
        width: chapterRect.width,
        height: chapterRect.height,
      },
      galleryRect: galleryRect && {
        top: galleryRect.top,
        bottom: galleryRect.bottom,
      },
      buttons,
    };
  });
}

async function run() {
  if (!fs.existsSync(BRAVE)) throw new Error(`Brave executable not found at ${BRAVE}`);

  const browser = await chromium.launch({
    executablePath: BRAVE,
    headless: true,
    args: ['--no-sandbox'],
  });

  try {
    fs.mkdirSync(path.join(ROOT, '.codex-artifacts'), { recursive: true });

    for (const [name, viewport, isMobile] of viewports) {
      const page = await browser.newPage({ viewport, isMobile });
      await page.goto(`${TARGET}?responsive-smoke=${name}-${Date.now()}`, { waitUntil: 'networkidle' });
      await page.locator('#portfolio').scrollIntoViewIfNeeded();
      await page.waitForSelector('#gallery [data-lightbox]', { state: 'attached', timeout: 15000 });
      await page.waitForTimeout(250);

      const layout = await getLayout(page);
      assert(layout.scrollWidth <= layout.viewport.width + 1, `${name}: page has horizontal overflow (${layout.scrollWidth}px > ${layout.viewport.width}px)`);
      assert(layout.chapterRect, `${name}: chapter selector missing`);
      assert(layout.galleryRect, `${name}: gallery missing`);
      assert(layout.chapterRect.bottom <= layout.galleryRect.top + 1, `${name}: chapter selector overlaps gallery`);

      for (const button of layout.buttons) {
        assert(button.left >= -1 && button.right <= layout.viewport.width + 1, `${name}: clipped chapter button "${button.label}"`);
        if (isMobile) {
          assert(button.height >= 42, `${name}: mobile chapter button "${button.label}" is too short (${button.height}px)`);
        }
      }

      for (const [label, category, expected] of chapters) {
        await page.getByRole('tab', { name: label }).click();
        await page.waitForFunction(
          ({ category, expected }) => {
            return Array.from(document.querySelectorAll('#gallery [data-lightbox]'))
              .filter((item) => !item.hidden && item.dataset.category === category)
              .length === expected;
          },
          { category, expected },
          { timeout: 10000 }
        );
      }

      await page.locator('#gallery [data-lightbox]:visible').first().click();
      await page.waitForSelector('.lightbox.lightbox--open', { state: 'visible', timeout: 10000 });
      await page.waitForFunction(() => {
        const img = document.querySelector('.lightbox--open img');
        return img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
      }, null, { timeout: 15000 });
      await page.keyboard.press('Escape');
      await page.waitForSelector('.lightbox.lightbox--open', { state: 'hidden', timeout: 10000 });
      await page.screenshot({ path: path.join(ROOT, `.codex-artifacts/public-responsive-${name}.png`), fullPage: false });
      await page.close();
    }

    await browser.close();
    console.log('Public responsive smoke passed: no overflow, no clipped chapters, gallery and lightbox work across breakpoints');
  } catch (err) {
    await browser.close();
    throw err;
  }
}

run().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
