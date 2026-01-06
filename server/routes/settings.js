import { Router } from 'express';
import { getAllSettings } from '../models/Settings.js';
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
      },
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return errorResponse(res, 'Failed to get settings', 'GET_SETTINGS_ERROR', 500);
  }
});

export default router;

