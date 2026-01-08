import { Router } from 'express';
import { getAllSettings, getSetting } from '../models/Settings.js';
import Template from '../models/Template.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = Router();

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
// Benchmark bootstrap aliases (observed)
// ------------------------

// POST /app/get_ad
router.post('/get_ad', async (req, res) => {
  try {
    const adConfig =
      (await getSetting('adConfig')) || ({ enabled: false, interval: 5, type: 'interstitial', banners: [], interstitials: [] });

    return successResponse(res, {
      ad: {
        enabled: adConfig.enabled !== false,
        interval: adConfig.interval || 5,
        type: adConfig.type || 'interstitial',
        assets: [
          ...(adConfig.banners || []).map((b) => b.url || b),
          ...(adConfig.interstitials || []).map((i) => i.url || i),
        ],
      },
    });
  } catch (error) {
    console.error('Get ad (compat) error:', error);
    return errorResponse(res, 'Failed to get ad', 'GET_AD_ERROR', 500);
  }
});

// GET /app/get_coins_prices
router.get('/get_coins_prices', async (req, res) => {
  try {
    const coinPackages = await getSetting('coinPackages');
    return successResponse(res, { packages: coinPackages || [] });
  } catch (error) {
    console.error('Get coins prices (compat) error:', error);
    return errorResponse(res, 'Failed to get coins prices', 'GET_COINS_PRICES_ERROR', 500);
  }
});

// GET /app/get_vip_price
router.get('/get_vip_price', async (req, res) => {
  try {
    const subscriptionPlans = await getSetting('subscriptionPlans');
    return successResponse(res, { plans: subscriptionPlans || [] });
  } catch (error) {
    console.error('Get vip price (compat) error:', error);
    return errorResponse(res, 'Failed to get vip price', 'GET_VIP_PRICE_ERROR', 500);
  }
});

// POST /api/get_vip_price & /api/app/get_vip_price (前端使用 POST 请求)
const getVipPriceHandler = async (req, res) => {
  try {
    const subscriptionPlans = await getSetting('subscriptionPlans');
    // 返回默认订阅计划（如果数据库中没有配置）
    const defaultPlans = [
      { id: 'super', name: 'SUPER', period: 'Yearly access', fullPrice: 59.99, price: 1.15, priceUnit: 'per week', gradient: true },
      { id: 'monthly', name: 'MONTHLY ACCESS', period: 'just $19.99 per month', fullPrice: 19.99, price: 0.60, priceUnit: 'per day', gradient: false },
    ];
    return successResponse(res, { plans: subscriptionPlans?.length ? subscriptionPlans : defaultPlans });
  } catch (error) {
    console.error('Get vip price (compat POST) error:', error);
    return errorResponse(res, 'Failed to get vip price', 'GET_VIP_PRICE_ERROR', 500);
  }
};
router.post('/get_vip_price', getVipPriceHandler);
router.post('/app/get_vip_price', getVipPriceHandler); // 前端调用 /api/app/get_vip_price

// GET /app/coins_price (kept as alias for parity; returns same packs)
router.get('/coins_price', async (req, res) => {
  try {
    const coinPackages = await getSetting('coinPackages');
    return successResponse(res, { packages: coinPackages || [] });
  } catch (error) {
    console.error('Coins price (compat) error:', error);
    return errorResponse(res, 'Failed to get coins price', 'GET_COINS_PRICE_ERROR', 500);
  }
});

// GET /app/settings/get (already exists at /api/settings/get; keep convenience alias)
router.get('/settings/get', async (req, res) => {
  try {
    const settings = await getAllSettings();
    return successResponse(res, {
      settings: {
        maintenance: settings.maintenance || false,
        announcement: settings.announcement || '',
        featureCosts: settings.featureCosts || {},
        coinPackages: settings.coinPackages || [],
        subscriptionPlans: settings.subscriptionPlans || [],
        tools: settings.tools || {},
        ad: settings.adConfig || { enabled: false, banners: [], interstitials: [] },
        change_clothes_tips: settings.change_clothes_tips || '',
      },
    });
  } catch (error) {
    console.error('Settings get (compat) error:', error);
    return errorResponse(res, 'Failed to get settings', 'GET_SETTINGS_ERROR', 500);
  }
});

// GET /app/change_clothes_tips
router.get('/change_clothes_tips', async (req, res) => {
  try {
    const tips = await getSetting('change_clothes_tips');
    return successResponse(res, { tips: tips || [] });
  } catch (error) {
    console.error('Change clothes tips (compat) error:', error);
    return errorResponse(res, 'Failed to get tips', 'GET_TIPS_ERROR', 500);
  }
});

// GET /app/order/my_subscribe (observed to return 200 even when logged-out)
router.get('/order/my_subscribe', async (req, res) => {
  try {
    const token = getBearerToken(req);
    const user = await getUserFromToken(token);

    if (!user) {
      return successResponse(res, { plan: 'free', planExpireAt: null, isActive: false, orderId: null });
    }

    const activeOrder = await Order.findOne({
      userId: user._id,
      type: 'subscription',
      status: 'paid',
    }).sort({ createdAt: -1 });

    return successResponse(res, {
      plan: user.plan || 'free',
      planExpireAt: user.planExpireAt || null,
      isActive: user.plan && user.plan !== 'free' && (!user.planExpireAt || user.planExpireAt > new Date()),
      orderId: activeOrder?.orderId || null,
    });
  } catch (error) {
    console.error('My subscribe (compat) error:', error);
    return errorResponse(res, 'Failed to get subscription', 'GET_SUBSCRIPTION_ERROR', 500);
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

    return successResponse(res, { templates });
  } catch (error) {
    console.error('Tools get (compat) error:', error);
    return errorResponse(res, 'Failed to get tools', 'GET_TOOLS_ERROR', 500);
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

    return successResponse(res, { templates });
  } catch (error) {
    console.error('Tools get_by_file_type (compat) error:', error);
    return errorResponse(res, 'Failed to get tools', 'GET_TOOLS_BY_FILE_TYPE_ERROR', 500);
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
    return successResponse(res, { templates });
  } catch (error) {
    console.error('Change clothes setting (compat) error:', error);
    return errorResponse(res, 'Failed to get settings', 'GET_CHANGE_CLOTHES_SETTING_ERROR', 500);
  }
});

// POST /app/tools/undress/get (logged-out returns empty)
router.post('/tools/undress/get', async (req, res) => {
  try {
    const token = getBearerToken(req);
    const user = await getUserFromToken(token);
    if (!user) return successResponse(res, { works: [] });

    const Work = (await import('../models/Work.js')).default;
    const works = await Work.find({ userId: user._id, isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(50);

    return successResponse(res, { works });
  } catch (error) {
    console.error('Undress get (compat) error:', error);
    return errorResponse(res, 'Failed to get works', 'GET_UNDRESS_WORKS_ERROR', 500);
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
    return successResponse(res, { photos });
  } catch (error) {
    console.error('Photos (compat) error:', error);
    return errorResponse(res, 'Failed to get photos', 'GET_PHOTOS_ERROR', 500);
  }
});

export default router;


