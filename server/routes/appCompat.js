import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllSettings, getSetting } from '../models/Settings.js';
import Template from '../models/Template.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sendUpstream(res, payload) {
  // Target site returns { code, msg, data, ... } with HTTP 200.
  return res.status(200).json(payload);
}

function sendOk(res, data) {
  return res.status(200).json({ code: 100, msg: 'OK', data });
}

function sendErr(res, msg = 'ERROR', code = 0, data = null) {
  return res.status(200).json({ code, msg, data });
}

let upstreamCache = null;
let upstreamCacheAt = 0;
async function loadOnlycrushUpstream() {
  // Cache for 30s to avoid hammering DB/fs
  if (upstreamCache && Date.now() - upstreamCacheAt < 30_000) return upstreamCache;

  // Prefer DB (server)
  const fromDb = await getSetting('onlycrush_upstream');
  if (fromDb && typeof fromDb === 'object' && fromDb.data) {
    upstreamCache = fromDb;
    upstreamCacheAt = Date.now();
    return upstreamCache;
  }

  // Fallback to local snapshot file (dev)
  try {
    const p = path.join(__dirname, '../data/onlycrush/upstream.json');
    const raw = await fs.readFile(p, 'utf-8');
    const json = JSON.parse(raw);
    upstreamCache = json;
    upstreamCacheAt = Date.now();
    return upstreamCache;
  } catch {
    upstreamCache = null;
    upstreamCacheAt = Date.now();
    return null;
  }
}

function getBearerToken(req) {
  return req.headers.authorization?.replace('Bearer ', '') || '';
}

async function getUserFromToken(token) {
  if (!token) return null;
  try {
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    return user || null;
  } catch {
    return null;
  }
}

// ------------------------
// OnlyCrush upstream passthrough (1:1 copy)
// ------------------------

async function passthrough(key, res) {
  const upstream = await loadOnlycrushUpstream();
  const payload = upstream?.data?.[key];
  if (payload) return sendUpstream(res, payload);
  return sendErr(res, 'UPSTREAM_NOT_READY', 404, null);
}

// /app/settings/get
router.get('/app/settings/get', async (req, res) => passthrough('settings_get', res));
router.get('/settings/get', async (req, res) => passthrough('settings_get', res));

// /app/tools/get
router.get('/app/tools/get', async (req, res) => passthrough('tools_get', res));
router.post('/app/tools/get', async (req, res) => passthrough('tools_get', res));

// /app/get_vip_price
router.get('/app/get_vip_price', async (req, res) => passthrough('vip_price', res));
router.post('/app/get_vip_price', async (req, res) => passthrough('vip_price', res)); // keep compat during transition
router.get('/get_vip_price', async (req, res) => passthrough('vip_price', res));

// /app/get_coins_prices + /app/coins_price
router.get('/app/get_coins_prices', async (req, res) => passthrough('coins_prices', res));
router.post('/app/get_coins_prices', async (req, res) => passthrough('coins_prices', res)); // keep compat during transition
router.get('/get_coins_prices', async (req, res) => passthrough('coins_prices', res));

router.get('/app/coins_price', async (req, res) => passthrough('coins_price', res));
router.post('/app/coins_price', async (req, res) => passthrough('coins_price', res)); // keep compat during transition
router.get('/coins_price', async (req, res) => passthrough('coins_price', res));

// /app/get_ad
router.post('/app/get_ad', async (req, res) => passthrough('ad', res));
router.post('/get_ad', async (req, res) => passthrough('ad', res));

// /app/change_clothes_tips
router.get('/app/change_clothes_tips', async (req, res) => passthrough('change_clothes_tips', res));
router.get('/change_clothes_tips', async (req, res) => passthrough('change_clothes_tips', res));

// /app/photos
router.post('/app/photos', async (req, res) => passthrough('photos', res));
router.post('/photos', async (req, res) => passthrough('photos', res));

// /app/tools/change_clothes_setting
router.get('/app/tools/change_clothes_setting', async (req, res) => passthrough('change_clothes_setting', res));

// ------------------------
// App-owned endpoints (auth-dependent, not pure upstream)
// Keep these for functionality; can be 1:1 adjusted later if needed.
// ------------------------

// GET /app/order/my_subscribe (observed to return 200 even when logged-out)
router.get('/order/my_subscribe', async (req, res) => {
  try {
    const token = getBearerToken(req);
    const user = await getUserFromToken(token);

    if (!user) {
      return sendOk(res, { plan: 'free', planExpireAt: null, isActive: false, orderId: null });
    }

    const activeOrder = await Order.findOne({
      userId: user._id,
      type: 'subscription',
      status: 'paid',
    }).sort({ createdAt: -1 });

    return sendOk(res, {
      plan: user.plan || 'free',
      planExpireAt: user.planExpireAt || null,
      isActive: user.plan && user.plan !== 'free' && (!user.planExpireAt || user.planExpireAt > new Date()),
      orderId: activeOrder?.orderId || null,
    });
  } catch (error) {
    console.error('My subscribe (compat) error:', error);
    return sendErr(res, 'Failed to get subscription', 500, null);
  }
});

// ------------------------
// Tools aliases (observed)
// ------------------------

// POST /app/tools/get
router.post('/tools/get', async (req, res) => {
  try {
    // Lightweight “tools” response: return enabled templates (no aiParams)
    const templates = await Template.find({ enabled: true })
      .sort({ sortOrder: -1, createdAt: -1 })
      .limit(200)
      .select('-aiParams');

    return sendOk(res, { templates });
  } catch (error) {
    console.error('Tools get (compat) error:', error);
    return sendErr(res, 'Failed to get tools', 500, null);
  }
});

// POST /app/tools/get_by_file_type
router.post('/tools/get_by_file_type', async (req, res) => {
  try {
    const { type, page = 1, size = 99 } = req.body || {};
    const query = { enabled: true };
    if (type === 'image' || type === 'video') query.type = type;

    const templates = await Template.find(query)
      .sort({ sortOrder: -1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(size))
      .limit(Number(size))
      .select('-aiParams');

    return sendOk(res, { templates });
  } catch (error) {
    console.error('Tools get_by_file_type (compat) error:', error);
    return sendErr(res, 'Failed to get tools', 500, null);
  }
});

// GET /app/tools/change_clothes_setting?page=1&size=99
router.get('/tools/change_clothes_setting', async (req, res) => {
  try {
    const { page = 1, size = 99 } = req.query;
    const templates = await Template.find({ enabled: true, $or: [{ category: 'dressup' }, { tags: { $in: ['cosplay', 'charm'] } }] })
      .sort({ sortOrder: -1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(size))
      .limit(Number(size))
      .select('-aiParams');
    return sendOk(res, { templates });
  } catch (error) {
    console.error('Change clothes setting (compat) error:', error);
    return sendErr(res, 'Failed to get settings', 500, null);
  }
});

// POST /app/tools/undress/get (logged-out returns empty)
router.post('/tools/undress/get', async (req, res) => {
  try {
    const token = getBearerToken(req);
    const user = await getUserFromToken(token);
    if (!user) return sendOk(res, { works: [] });

    const Work = (await import('../models/Work.js')).default;
    const works = await Work.find({ userId: user._id, isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(50);

    return sendOk(res, { works });
  } catch (error) {
    console.error('Undress get (compat) error:', error);
    return sendErr(res, 'Failed to get works', 500, null);
  }
});

// POST /app/photos (used by makeover/takeoff pages even when logged-out)
router.post('/photos', async (req, res) => {
  try {
    // For parity: return a small set of “try one of these” images derived from templates.
    const templates = await Template.find({ enabled: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .select('thumbnail');
    const photos = templates.map((t) => ({ url: t.thumbnail }));
    return sendOk(res, { photos });
  } catch (error) {
    console.error('Photos (compat) error:', error);
    return sendErr(res, 'Failed to get photos', 500, null);
  }
});

export default router;


