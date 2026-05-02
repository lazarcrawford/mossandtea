#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(__dirname, '..');
const BRAVE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const TARGET = process.env.ADMIN_UI_URL || 'https://mossandtea.com/admin/';
const TEST_EMAIL = process.env.ADMIN_TEST_EMAIL || 'codex-admin-ui@mossandtea.test';
const TEST_PASSWORD = process.env.ADMIN_TEST_PASSWORD || 'CodexAdminUiTest!2026';
const SETUP_USER = process.env.ADMIN_SMOKE_SETUP_USER === '1';

function readEnv() {
  const env = {};
  const text = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) env[match[1]] = match[2].replace(/^"|"$/g, '');
  }
  return env;
}

async function supabaseFetch(url, options = {}) {
  const env = readEnv();
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const resp = await fetch(`${env.SUPABASE_URL}${url}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...(options.headers || {}),
    },
  });
  const text = await resp.text();
  let body = text;
  try { body = text ? JSON.parse(text) : null; } catch {}
  if (!resp.ok) {
    throw new Error(`Supabase ${options.method || 'GET'} ${url} failed (${resp.status}): ${text}`);
  }
  return body;
}

async function ensureAdminUser() {
  const users = await supabaseFetch('/auth/v1/admin/users?per_page=100&page=1');
  const existing = users.users?.find((u) => u.email === TEST_EMAIL);
  const payload = {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { name: 'Codex Admin UI Test' },
  };

  if (existing) {
    await supabaseFetch(`/auth/v1/admin/users/${existing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } else {
    await supabaseFetch('/auth/v1/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  await supabaseFetch('/rest/v1/admins?on_conflict=email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      email: TEST_EMAIL,
      name: 'Codex Admin UI Test',
      role: 'admin',
    }),
  });
}

async function expectVisible(page, selector, label, timeout = 15000) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: 'visible', timeout });
  return locator;
}

async function expectCountAtLeast(page, selector, min, label) {
  await page.waitForFunction(
    ({ selector, min }) => document.querySelectorAll(selector).length >= min,
    { selector, min },
    { timeout: 20000 }
  );
  const count = await page.locator(selector).count();
  if (count < min) throw new Error(`${label}: expected at least ${min}, got ${count}`);
  return count;
}

async function clickText(page, text) {
  const locator = page.getByText(text, { exact: true }).first();
  await locator.waitFor({ state: 'visible', timeout: 15000 });
  await locator.click();
}

async function openProjectByTitle(page, title) {
  const exactTitle = new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
  const row = page.locator('tbody tr').filter({
    has: page.locator('td strong').filter({ hasText: exactTitle }),
  });
  const button = row.locator('button').first();
  await button.waitFor({ state: 'visible', timeout: 15000 });
  await button.click();
}

async function run() {
  if (!fs.existsSync(BRAVE)) throw new Error(`Brave executable not found at ${BRAVE}`);
  if (SETUP_USER) await ensureAdminUser();

  const browser = await chromium.launch({
    executablePath: BRAVE,
    headless: true,
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 980 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));

  try {
    await page.goto(`${TARGET}?smoke=${Date.now()}`, { waitUntil: 'domcontentloaded' });
    await expectVisible(page, '.login-card', 'login card');
    await page.locator('.login-card input[type="email"]').fill(TEST_EMAIL);
    await page.locator('.login-card input[type="password"]').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expectVisible(page, '.admin-layout', 'admin layout');
    await expectVisible(page, '.sample-banner', 'archive sample banner');

    await clickText(page, 'Projects');
    await openProjectByTitle(page, 'CENIT');
    await expectVisible(page, '.project-workspace h3:text("CENIT")', 'CENIT project workspace');
    const cenitCount = await expectCountAtLeast(page, '.file-grid .file-item--clickable', 4, 'CENIT project files');
    await page.waitForFunction(() => {
      const img = document.querySelector('.file-grid .file-item--clickable img');
      return img && img.getAttribute('src') && img.getAttribute('src').startsWith('http');
    }, null, { timeout: 20000 });

    await page.locator('.file-grid .file-item--clickable').first().evaluate((el) => el.click());
    await expectVisible(page, '.lightbox.lightbox--open', 'CENIT lightbox');
    await page.waitForFunction(() => {
      const img = document.querySelector('.lightbox--open img');
      return img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
    }, null, { timeout: 20000 });
    await page.locator('.lightbox__nav--next').click();
    await page.keyboard.press('Escape');
    await page.waitForSelector('.lightbox.lightbox--open', { state: 'hidden', timeout: 10000 });

    await clickText(page, 'File Gallery');
    const allCount = await expectCountAtLeast(page, '.file-grid .file-item--clickable', 35, 'all gallery files');
    await page.waitForFunction(() => {
      const images = Array.from(document.querySelectorAll('.file-grid .file-item--clickable img'));
      return images.filter((img) => img.getAttribute('src')?.startsWith('http')).length >= 2;
    }, null, { timeout: 20000 });
    await page.locator('.file-grid .file-item--clickable').nth(1).evaluate((el) => el.click());
    await expectVisible(page, '.lightbox.lightbox--open', 'all gallery lightbox');
    await page.keyboard.press('Escape');

    await clickText(page, 'Contracts');
    await expectVisible(page, 'td:text("Sample CENIT Agreement (Draft)")', 'CENIT contract row');
    await clickText(page, 'Payments');
    await expectVisible(page, 'td:text("SAMPLE DATA - CENIT invoice draft only; no payment recorded")', 'CENIT payment row');

    fs.mkdirSync(path.join(ROOT, '.codex-artifacts'), { recursive: true });
    await page.screenshot({ path: path.join(ROOT, '.codex-artifacts/admin-ui-smoke.png'), fullPage: true });
    await browser.close();

    const actionableConsoleErrors = consoleErrors.filter((msg) =>
      !/favicon|Failed to load resource: the server responded with a status of 404/.test(msg)
    );
    if (pageErrors.length || actionableConsoleErrors.length) {
      throw new Error([
        pageErrors.length ? `Page errors:\n${pageErrors.join('\n')}` : '',
        actionableConsoleErrors.length ? `Console errors:\n${actionableConsoleErrors.join('\n')}` : '',
      ].filter(Boolean).join('\n'));
    }

    console.log(`Admin UI smoke passed: CENIT files=${cenitCount}, all files=${allCount}`);
  } catch (err) {
    fs.mkdirSync(path.join(ROOT, '.codex-artifacts'), { recursive: true });
    await page.screenshot({ path: path.join(ROOT, '.codex-artifacts/admin-ui-smoke-failure.png'), fullPage: true }).catch(() => {});
    await browser.close();
    if (pageErrors.length) console.error(`Page errors before failure:\n${pageErrors.join('\n')}`);
    if (consoleErrors.length) console.error(`Console errors before failure:\n${consoleErrors.join('\n')}`);
    throw err;
  }
}

run().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
