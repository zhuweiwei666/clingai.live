import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import mongoose from 'mongoose';
import { setSetting } from '../models/Settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ORIGIN = 'https://onlycrush.app';
const OUT_DIR = path.join(__dirname, '../data/onlycrush');

async function fetchJson(url, { method = 'GET', body } = {}) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (ClingAI Sync Bot)',
    Accept: 'application/json,text/plain,*/*',
  };
  const res = await fetch(url, {
    method,
    headers: body ? { ...headers, 'Content-Type': 'application/json' } : headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response from ${url}: ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${url}: ${text.slice(0, 200)}`);
  }
  return json;
}

async function writeJsonSnapshot(fileName, data) {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const p = path.join(OUT_DIR, fileName);
  await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf-8');
  return p;
}

async function main() {
  console.log('[onlycrush-sync] Starting data sync...');
  const fetchedAt = new Date().toISOString();

  // Core endpoints needed for 1:1 UI copy/price/title parity
  const endpoints = [
    { key: 'settings_get', method: 'GET', path: '/app/settings/get' },
    { key: 'tools_get', method: 'GET', path: '/app/tools/get' },
    { key: 'vip_price', method: 'GET', path: '/app/get_vip_price' },
    { key: 'coins_prices', method: 'GET', path: '/app/get_coins_prices' },
    { key: 'coins_price', method: 'GET', path: '/app/coins_price' },

    // Used by some pages; keep best-effort (may 404 depending on region/account)
    { key: 'change_clothes_tips', method: 'GET', path: '/app/change_clothes_tips' },
    { key: 'ad', method: 'POST', path: '/app/get_ad', body: {} },
    { key: 'photos', method: 'POST', path: '/app/photos', body: {} },
    { key: 'change_clothes_setting', method: 'GET', path: '/app/tools/change_clothes_setting?page=1&size=200' },
  ];

  const upstream = {
    origin: ORIGIN,
    fetchedAt,
    data: {},
    errors: {},
  };

  for (const ep of endpoints) {
    const url = ORIGIN + ep.path;
    try {
      console.log(`[onlycrush-sync] Fetch ${ep.method} ${ep.path}`);
      upstream.data[ep.key] = await fetchJson(url, { method: ep.method, body: ep.body });
    } catch (err) {
      upstream.errors[ep.key] = String(err?.message || err);
      console.warn(`[onlycrush-sync] WARN ${ep.key}: ${upstream.errors[ep.key]}`);
    }
  }

  const snapshotPath = await writeJsonSnapshot('upstream.json', upstream);
  await writeJsonSnapshot(`upstream-${Date.now()}.json`, upstream);

  // Best-effort DB write (server has MongoDB; local dev may not)
  try {
    console.log('[onlycrush-sync] Connecting DB...');
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clingai';
    await mongoose.connect(uri);

    // Store raw upstream payload for API parity endpoints.
    await setSetting('onlycrush_upstream', upstream);
    console.log('[onlycrush-sync] DB write: OK');
  } catch (err) {
    console.warn('[onlycrush-sync] WARN DB unavailable, skipped DB write:', String(err?.message || err));
  }

  console.log('[onlycrush-sync] ✅ Done');
  console.log('[onlycrush-sync] Snapshot:', snapshotPath);
  if (Object.keys(upstream.errors).length) {
    console.log('[onlycrush-sync] Completed with warnings:', upstream.errors);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('[onlycrush-sync] ❌ Failed:', err);
  process.exit(1);
});

