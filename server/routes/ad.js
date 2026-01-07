import { Router } from 'express';
import { getSetting } from '../models/Settings.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = Router();

// 获取广告资源 (benchmark: /app/ad/get_files)
router.get('/get_files', async (req, res) => {
  try {
    const adConfig = await getSetting('adConfig') || {
      enabled: false,
      banners: [],
      interstitials: [],
    };

    // Combine banner and interstitial files
    const files = [
      ...(adConfig.banners || []).map(banner => ({ 
        id: banner.id || banner.url, 
        type: 'banner', 
        url: banner.url || banner 
      })),
      ...(adConfig.interstitials || []).map(interstitial => ({ 
        id: interstitial.id || interstitial.url, 
        type: 'interstitial', 
        url: interstitial.url || interstitial 
      })),
    ];

    return successResponse(res, { files });
  } catch (error) {
    console.error('Get ad files error:', error);
    return errorResponse(res, 'Failed to get ad files', 'GET_AD_FILES_ERROR', 500);
  }
});

// 获取广告配置 (benchmark: /app/get_ad)
router.get('/get', async (req, res) => {
  try {
    const adConfig = await getSetting('adConfig') || {
      enabled: true,
      interval: 5,
      type: 'interstitial',
      banners: [],
      interstitials: [],
    };

    // Ensure all required fields
    const ad = {
      enabled: adConfig.enabled !== false,
      interval: adConfig.interval || 5,
      type: adConfig.type || 'interstitial',
      assets: [
        ...(adConfig.banners || []).map(b => b.url || b),
        ...(adConfig.interstitials || []).map(i => i.url || i),
      ],
    };

    return successResponse(res, { ad });
  } catch (error) {
    console.error('Get ad config error:', error);
    return errorResponse(res, 'Failed to get ad config', 'GET_AD_CONFIG_ERROR', 500);
  }
});

export default router;

