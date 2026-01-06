const ASSET_BASE_URL = (import.meta.env.VITE_ASSET_BASE_URL || '').replace(/\/+$/, '');

/**
 * Build a public asset URL.
 * - If VITE_ASSET_BASE_URL is set (e.g. https://pub-xxx.r2.dev), prefix it.
 * - Otherwise return the path as-is (for local dev/static hosting).
 */
export function assetUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) return path;
  if (!ASSET_BASE_URL) return path;
  return `${ASSET_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}


