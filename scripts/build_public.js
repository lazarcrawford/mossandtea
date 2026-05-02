#!/usr/bin/env node
/*
 * Build deployable static assets into ./public.
 *
 * Cloudflare Workers serves only this generated directory. Source files,
 * Supabase migrations, scripts, and local artifacts stay out of the public
 * asset root.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

const FILES = [
  'index.html',
];

const DIRS = [
  'admin',
  'css',
  'hermitage',
  'images',
  'js',
  'portal',
  'telegram-console',
];

function copyFile(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

function copyDir(src, dst) {
  fs.rmSync(dst, { recursive: true, force: true });
  fs.cpSync(src, dst, {
    recursive: true,
    filter: (candidate) => {
      const name = path.basename(candidate);
      return name !== '__pycache__' && name !== '.DS_Store';
    },
  });
}

function main() {
  fs.rmSync(PUBLIC, { recursive: true, force: true });
  fs.mkdirSync(PUBLIC, { recursive: true });

  for (const fileName of FILES) {
    copyFile(path.join(ROOT, fileName), path.join(PUBLIC, fileName));
  }

  for (const dirName of DIRS) {
    copyDir(path.join(ROOT, dirName), path.join(PUBLIC, dirName));
  }

  console.log(`Built public assets in ${PUBLIC}`);
}

main();
