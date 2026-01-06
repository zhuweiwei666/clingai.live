import { Router } from 'express';
import { successResponse, errorResponse } from '../utils/response.js';

const router = Router();

// 获取Agent列表 (benchmark: /app/agent/list)
router.get('/list', async (req, res) => {
  try {
    // TODO: Implement Agent model and database storage
    // For now, return empty array
    return successResponse(res, { agents: [] });
  } catch (error) {
    console.error('Get agent list error:', error);
    return errorResponse(res, 'Failed to get agent list', 'GET_AGENT_LIST_ERROR', 500);
  }
});

// 获取Agent详情 (benchmark: /app/agent/info)
router.get('/:id', async (req, res) => {
  try {
    // TODO: Implement Agent model and database storage
    return errorResponse(res, 'Agent not found', 'AGENT_NOT_FOUND', 404);
  } catch (error) {
    console.error('Get agent info error:', error);
    return errorResponse(res, 'Failed to get agent info', 'GET_AGENT_INFO_ERROR', 500);
  }
});

// 获取Agent照片 (benchmark: /app/agent/photos)
router.get('/:id/photos', async (req, res) => {
  try {
    // TODO: Implement Agent model and database storage
    return successResponse(res, { photos: [] });
  } catch (error) {
    console.error('Get agent photos error:', error);
    return errorResponse(res, 'Failed to get agent photos', 'GET_AGENT_PHOTOS_ERROR', 500);
  }
});

export default router;

