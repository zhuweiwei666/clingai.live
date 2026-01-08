import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const OUT_ROOT = path.join(__dirname, '../../public/onlycrush');
const SNAPSHOT_PATH = path.join(__dirname, '../data/onlycrush/upstream.json');

function safeExtFromUrl(url) {
  try {
    const u = new URL(url);
    const p = u.pathname.toLowerCase();
    const known = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.svg'];
    for (const ext of known) if (p.endsWith(ext)) return ext;
    return path.extname(p) || '';
  } catch {
    return '';
  }
}

function hashUrl(url) {
  return crypto.createHash('sha1').update(url).digest('hex').slice(0, 16);
}

function buildDestPath(kind, url) {
  const ext = safeExtFromUrl(url) || '.bin';
  const name = `${hashUrl(url)}${ext}`;
  return path.join(OUT_ROOT, kind, name);
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function downloadTo(url, destPath) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (ClingAI Asset Mirror)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, buf);
  return buf.length;
}

function collectAssetUrls(upstream) {
  const urls = new Set();

  const settings = upstream?.data?.settings_get?.data;
  if (settings?.logo) urls.add(settings.logo);

  const tools = upstream?.data?.tools_get?.data || [];
  for (const t of tools) {
    if (t?.cover_image) urls.add(t.cover_image);
    if (t?.cover_video) urls.add(t.cover_video);
    if (t?.cover_gif) urls.add(t.cover_gif);
  }

  const coinsPrices = upstream?.data?.coins_prices?.data;
  if (coinsPrices?.list?.length) {
    for (const p of coinsPrices.list) {
      if (p?.icon) urls.add(p.icon);
    }
  }

  return Array.from(urls);
}

function classifyKind(url) {
  const lower = String(url || '').toLowerCase();
  if (lower.endsWith('.mp4') || lower.endsWith('.webm')) return 'videos';
  if (lower.endsWith('.gif')) return 'gifs';
  if (lower.endsWith('.svg')) return 'icons';
  return 'images';
}

async function main() {
  console.log('[onlycrush-assets] Starting asset mirror...');

  const raw = await fs.readFile(SNAPSHOT_PATH, 'utf-8');
  const upstream = JSON.parse(raw);
  const urls = collectAssetUrls(upstream);

  console.log(`[onlycrush-assets] Found ${urls.length} assets`);

  const mapping = {
    generatedAt: new Date().toISOString(),
    outRoot: '/onlycrush',
    items: {},
    stats: { downloaded: 0, skipped: 0, failed: 0 },
    errors: {},
  };

  // Keep it conservative to avoid huge downloads in one run.
  // You can increase via ONLYCRUSH_ASSET_LIMIT env.
  const limit = Number(process.env.ONLYCRUSH_ASSET_LIMIT || 120);
  const slice = urls.slice(0, limit);

  for (const url of slice) {
    const kind = classifyKind(url);
    const dest = buildDestPath(kind, url);
    const publicPath = `/onlycrush/${kind}/${path.basename(dest)}`;

    try {
      if (await fileExists(dest)) {
        mapping.items[url] = publicPath;
        mapping.stats.skipped += 1;
        continue;
      }
      const size = await downloadTo(url, dest);
      mapping.items[url] = publicPath;
      mapping.stats.downloaded += 1;
      if (mapping.stats.downloaded % 20 === 0) {
        console.log(`[onlycrush-assets] downloaded ${mapping.stats.downloaded}/${slice.length}...`);
      }
      // Avoid hammering origin
      await new Promise((r) => setTimeout(r, 120));
    } catch (err) {
      mapping.stats.failed += 1;
      mapping.errors[url] = String(err?.message || err);
      console.warn('[onlycrush-assets] WARN failed:', url, mapping.errors[url]);
    }
  }

  await fs.mkdir(path.join(__dirname, '../data/onlycrush'), { recursive: true });
  const outMapPath = path.join(__dirname, '../data/onlycrush/assets-map.json');
  await fs.writeFile(outMapPath, JSON.stringify(mapping, null, 2), 'utf-8');

  console.log('[onlycrush-assets] ✅ Done');
  console.log('[onlycrush-assets] Map:', outMapPath);
  console.log('[onlycrush-assets] Stats:', mapping.stats);
  process.exit(0);
}

main().catch((err) => {
  console.error('[onlycrush-assets] ❌ Failed:', err);
  process.exit(1);
});

