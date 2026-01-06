import { Router } from 'express';
import { getSetting } from '../models/Settings.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = Router();

// 获取广告资源 (benchmark: /app/ad/get_files)
router.get('/get_files', async (req, res) => {
  try {
    // TODO: Implement ad file storage and management
    // For now, return empty array
    return successResponse(res, { files: [] });
  } catch (error) {
    console.error('Get ad files error:', error);
    return errorResponse(res, 'Failed to get ad files', 'GET_AD_FILES_ERROR', 500);
  }
});

// 获取广告配置 (benchmark: /app/get_ad)
router.get('/get', async (req, res) => {
  try {
    const adConfig = await getSetting('adConfig') || {
      enabled: false,
      banners: [],
      interstitials: [],
    };

    return successResponse(res, { ad: adConfig });
  } catch (error) {
    console.error('Get ad config error:', error);
    return errorResponse(res, 'Failed to get ad config', 'GET_AD_CONFIG_ERROR', 500);
  }
});

export default router;

