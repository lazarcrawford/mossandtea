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
const SELECTED_ARCHIVE_SOURCE = path.join(ROOT, 'assets', 'Moss and Tea Website');
const selectedArchiveFiles = fs.existsSync(SELECTED_ARCHIVE_SOURCE)
  ? new Set(fs.readdirSync(SELECTED_ARCHIVE_SOURCE))
  : new Set();

const FILES = [
  'index.html',
];

const DIRS = [
  'admin',
  'css',
  'data',
  'hermitage',
  'images',
  'js',
  'portal',
  'preview',
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
      const rel = path.relative(ROOT, candidate).split(path.sep).join('/');
      const selectedRawIrinaFile = rel.startsWith('images/irina/')
        && !rel.startsWith('images/irina/archive/')
        && selectedArchiveFiles.has(name);
      return name !== '__pycache__' && name !== '.DS_Store' && !selectedRawIrinaFile;
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
