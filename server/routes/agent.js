import { Router } from 'express';
import Agent from '../models/Agent.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = Router();

// 获取Agent列表 (benchmark: /app/agent/list)
async function getAgentList(req, res) {
  try {
    const agents = await Agent.find({ enabled: true })
      .sort({ followers: -1, createdAt: -1 })
      .limit(50)
      .select('-photos');

    return successResponse(res, { agents });
  } catch (error) {
    console.error('Get agent list error:', error);
    return errorResponse(res, 'Failed to get agent list', 'GET_AGENT_LIST_ERROR', 500);
  }
}

// Benchmark observed: POST /app/agent/list
router.post('/list', getAgentList);
router.get('/list', getAgentList);

// 获取Agent详情 (benchmark: /app/agent/info)
router.get('/:id', async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent || !agent.enabled) {
      return errorResponse(res, 'Agent not found', 'AGENT_NOT_FOUND', 404);
    }

    return successResponse(res, { agent });
  } catch (error) {
    console.error('Get agent info error:', error);
    return errorResponse(res, 'Failed to get agent info', 'GET_AGENT_INFO_ERROR', 500);
  }
});

// 获取Agent照片 (benchmark: /app/agent/photos)
router.get('/:id/photos', async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).select('photos');
    if (!agent || !agent.enabled) {
      return errorResponse(res, 'Agent not found', 'AGENT_NOT_FOUND', 404);
    }

    return successResponse(res, { photos: agent.photos || [] });
  } catch (error) {
    console.error('Get agent photos error:', error);
    return errorResponse(res, 'Failed to get agent photos', 'GET_AGENT_PHOTOS_ERROR', 500);
  }
});

export default router;

