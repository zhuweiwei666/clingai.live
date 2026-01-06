import { Router } from 'express';
import { getAllSettings, getSetting } from '../models/Settings.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = Router();

// 获取全局设置 (benchmark: /app/settings/get)
router.get('/get', async (req, res) => {
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
    console.error('Get settings error:', error);
    return errorResponse(res, 'Failed to get settings', 'GET_SETTINGS_ERROR', 500);
  }
});

// 获取所有设置（兼容旧API）
router.get('/', async (req, res) => {
  try {
    const settings = await getAllSettings();
    return successResponse(res, { settings });
  } catch (error) {
    console.error('Get settings error:', error);
    return errorResponse(res, 'Failed to get settings', 'GET_SETTINGS_ERROR', 500);
  }
});

// 获取单个设置
router.get('/:key', async (req, res) => {
  try {
    const value = await getSetting(req.params.key);
    return successResponse(res, { key: req.params.key, value });
  } catch (error) {
    console.error('Get setting error:', error);
    return errorResponse(res, 'Failed to get setting', 'GET_SETTING_ERROR', 500);
  }
});

// 更新设置
router.put('/:key', async (req, res) => {
  try {
    const { value } = req.body;
    const { setSetting } = await import('../models/Settings.js');
    await setSetting(req.params.key, value);
    return successResponse(res, { message: 'Setting updated' });
  } catch (error) {
    console.error('Update setting error:', error);
    return errorResponse(res, 'Failed to update setting', 'UPDATE_SETTING_ERROR', 500);
  }
});

export default router;

