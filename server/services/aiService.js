/**
 * AI Service - 调用第三方 AI API
 * 
 * 支持的 AI 功能:
 * 1. photo2video - 图片生成视频
 * 2. faceSwapImage - 图片换脸
 * 3. faceSwapVideo - 视频换脸
 * 4. dressUp - AI换装
 * 5. hdUpscale - 高清放大
 * 6. removeBackground - 去背景
 * 7. generateImage - AI文生图
 * 
 * TODO: 用户提供 API Key 后，在 .env 文件中配置:
 *   AI_API_KEY=your-api-key
 *   AI_API_BASE=https://api.example.com
 */

import fetch from 'node-fetch';

// API 配置
const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_API_BASE = process.env.AI_API_BASE || '';

// 是否启用 AI 服务
const AI_ENABLED = !!(AI_API_KEY && AI_API_BASE);

/**
 * 通用 API 请求
 */
async function callAIApi(endpoint, data) {
  if (!AI_ENABLED) {
    console.warn('[AI] AI Service not configured, using mock response');
    return mockResponse();
  }

  try {
    const response = await fetch(`${AI_API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${response.status} - ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[AI] API call failed:', error);
    throw error;
  }
}

/**
 * 模拟响应（测试用）
 */
function mockResponse() {
  return {
    taskId: `mock_${Date.now()}`,
    status: 'processing',
  };
}

/**
 * 模拟状态检查（测试用）
 */
function mockStatusCheck() {
  // 随机模拟完成状态
  const random = Math.random();
  if (random > 0.7) {
    return {
      status: 'completed',
      resultUrl: 'https://img-pub.onlycrush.app/azdxmcivnbunpmlqowaedr/undress/76749034-a751-436c-a465-1823724a27a1/e3368866-7b0e-4376-8e00-6c7d6e786856.mp4',
      thumbnailUrl: 'https://img-pub.onlycrush.app/azdxmcivnbunpmlqowaedr/undress/76749034-a751-436c-a465-1823724a27a1/oCO6Z7kFexW3IjmDpau1ly.jpeg',
    };
  }
  return { status: 'processing' };
}

/**
 * 图生视频 (Photo to Video)
 * @param {string} sourceImage - 源图片 URL 或 base64
 * @param {object} params - 额外参数 { templateParams, motion, duration }
 */
export async function photo2video(sourceImage, params = {}) {
  console.log('[AI] photo2video called');
  
  if (!AI_ENABLED) return mockResponse();

  return callAIApi('/v1/photo2video', {
    image: sourceImage,
    template: params.templateParams,
    motion: params.motion || 'default',
    duration: params.duration || 5,
  });
}

/**
 * 查询 AI 任务状态
 * @param {string} externalTaskId - AI 服务返回的任务 ID
 */
export async function checkTaskStatus(externalTaskId) {
  console.log('[AI] checkTaskStatus called:', externalTaskId);
  
  if (!AI_ENABLED) return mockStatusCheck();

  return callAIApi('/v1/task/status', { taskId: externalTaskId });
}

/**
 * 图片换脸 (Face Swap - Image)
 * @param {string} sourceImage - 源脸图片
 * @param {string} targetImage - 目标图片
 */
export async function faceSwapImage(sourceImage, targetImage, params = {}) {
  console.log('[AI] faceSwapImage called');
  
  if (!AI_ENABLED) return mockResponse();

  return callAIApi('/v1/faceswap/image', {
    sourceImage,
    targetImage,
    ...params,
  });
}

/**
 * 视频换脸 (Face Swap - Video)
 * @param {string} sourceImage - 源脸图片
 * @param {string} targetVideo - 目标视频
 */
export async function faceSwapVideo(sourceImage, targetVideo, params = {}) {
  console.log('[AI] faceSwapVideo called');
  
  if (!AI_ENABLED) return mockResponse();

  return callAIApi('/v1/faceswap/video', {
    sourceImage,
    targetVideo,
    ...params,
  });
}

/**
 * AI 换装 (Dress Up)
 * @param {string} sourceImage - 人物图片
 * @param {string} targetClothing - 目标服装图片或描述
 */
export async function dressUp(sourceImage, targetClothing, params = {}) {
  console.log('[AI] dressUp called');
  
  if (!AI_ENABLED) return mockResponse();

  return callAIApi('/v1/dressup', {
    sourceImage,
    targetClothing,
    ...params,
  });
}

/**
 * 高清放大 (HD Upscale)
 * @param {string} sourceImage - 源图片
 * @param {number} scale - 放大倍数 (2x, 4x)
 */
export async function hdUpscale(sourceImage, scale = 2) {
  console.log('[AI] hdUpscale called, scale:', scale);
  
  if (!AI_ENABLED) return mockResponse();

  return callAIApi('/v1/upscale', {
    image: sourceImage,
    scale,
  });
}

/**
 * 去背景 (Remove Background)
 * @param {string} sourceImage - 源图片
 */
export async function removeBackground(sourceImage) {
  console.log('[AI] removeBackground called');
  
  if (!AI_ENABLED) return mockResponse();

  return callAIApi('/v1/remove-bg', {
    image: sourceImage,
  });
}

/**
 * AI 文生图 (Text to Image)
 * @param {string} prompt - 提示词
 * @param {object} params - 参数 { width, height, style, negativePrompt }
 */
export async function generateImage(prompt, params = {}) {
  console.log('[AI] generateImage called:', prompt.substring(0, 50));
  
  if (!AI_ENABLED) return mockResponse();

  return callAIApi('/v1/text2image', {
    prompt,
    width: params.width || 512,
    height: params.height || 768,
    style: params.style || 'realistic',
    negative_prompt: params.negativePrompt || '',
  });
}

/**
 * 获取 AI 服务状态
 */
export function getServiceStatus() {
  return {
    enabled: AI_ENABLED,
    apiBase: AI_API_BASE ? AI_API_BASE.substring(0, 30) + '...' : 'Not configured',
  };
}

export default {
  photo2video,
  checkTaskStatus,
  faceSwapImage,
  faceSwapVideo,
  dressUp,
  hdUpscale,
  removeBackground,
  generateImage,
  getServiceStatus,
};
