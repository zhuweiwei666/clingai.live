/**
 * A2E AI Service - 集成 A2E.ai API
 * 
 * A2E (Avatars to Everyone) 提供经济实惠的 AI Avatar 解决方案
 * 文档: https://api.a2e.ai/
 * 
 * 支持的功能:
 * 1. Image to Video - 图片生成视频
 * 2. Face Swap - 换脸（图片/视频）
 * 3. Virtual Try-On - 虚拟试穿（换装）
 * 4. Text to Image - 文生图
 * 5. Caption Removal - 字幕/水印移除
 * 6. HD Upscale - 高清放大（通过 Video to Video）
 * 
 * 环境变量配置:
 *   A2E_API_TOKEN=your-api-token
 *   A2E_BASE_URL=https://video.a2e.ai (或 https://video.a2e.com.cn 中国用户)
 *   A2E_USER_ID=your-user-id
 */

import fetch from 'node-fetch';

// API 配置
const A2E_API_TOKEN = process.env.A2E_API_TOKEN || '';
const A2E_BASE_URL = process.env.A2E_BASE_URL || 'https://video.a2e.ai';
const A2E_USER_ID = process.env.A2E_USER_ID || '';

/**
 * 从 JWT Token 中提取用户 ID（如果 token 是 JWT 格式）
 */
function extractUserIdFromToken(token) {
  if (!token) return null;
  
  try {
    // 移除可能的 'sk_' 前缀
    const cleanToken = token.startsWith('sk_') ? token.substring(3) : token;
    
    // JWT 格式：header.payload.signature
    const parts = cleanToken.split('.');
    if (parts.length !== 3) return null;
    
    // 解码 payload (base64)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    
    // 尝试从 payload 中提取用户 ID
    return payload._id || payload.id || payload.userId || payload.user_id || null;
  } catch (error) {
    console.warn('[A2E] Failed to extract user ID from token:', error.message);
    return null;
  }
}

// 尝试从 token 中自动提取用户 ID
const extractedUserId = extractUserIdFromToken(A2E_API_TOKEN);
const finalUserId = A2E_USER_ID || extractedUserId;

// 是否启用 A2E 服务（只需要 token，user ID 可以从 token 中提取）
const A2E_ENABLED = !!A2E_API_TOKEN;

/**
 * 通用 A2E API 请求
 */
async function callA2EApi(endpoint, method = 'GET', data = null) {
  if (!A2E_ENABLED) {
    console.warn('[A2E] A2E Service not configured, using mock response');
    return mockResponse();
  }

  try {
    const url = `${A2E_BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${A2E_API_TOKEN}`,
        ...(finalUserId && { 'X-User-Id': finalUserId }),
      },
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`A2E API error: ${response.status} - ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[A2E] API call failed:', error);
    throw error;
  }
}

/**
 * 模拟响应（测试用）
 */
function mockResponse() {
  return {
    task_id: `mock_${Date.now()}`,
    status: 'processing',
  };
}

/**
 * 图生视频 (Image to Video)
 * @param {string} imageUrl - 源图片 URL
 * @param {object} params - 参数 { duration, fps, motion }
 */
export async function imageToVideo(imageUrl, params = {}) {
  console.log('[A2E] imageToVideo called');
  
  if (!A2E_ENABLED) return mockResponse();

  const requestData = {
    image_url: imageUrl,
    duration: params.duration || 5,
    fps: params.fps || 25,
    motion: params.motion || 'default',
  };

  const result = await callA2EApi('/api/v1/image-to-video/start', 'POST', requestData);
  return {
    taskId: result.task_id || result.id,
    status: result.status || 'processing',
  };
}

/**
 * 换脸 (Face Swap)
 * @param {string} sourceImage - 源脸图片 URL
 * @param {string} targetImage - 目标图片 URL（图片换脸）
 * @param {string} targetVideo - 目标视频 URL（视频换脸，可选）
 */
export async function faceSwap(sourceImage, targetImage, targetVideo = null) {
  console.log('[A2E] faceSwap called');
  
  if (!A2E_ENABLED) return mockResponse();

  // 先添加源脸图片到 Face Swap 资源
  const addFaceResponse = await callA2EApi('/api/v1/face-swap/add-face', 'POST', {
    image_url: sourceImage,
  });

  const faceId = addFaceResponse.face_id || addFaceResponse.id;

  // 启动换脸任务
  const requestData = {
    face_id: faceId,
  };

  if (targetVideo) {
    // 视频换脸
    requestData.video_url = targetVideo;
    const result = await callA2EApi('/api/v1/face-swap/start', 'POST', requestData);
    return {
      taskId: result.task_id || result.id,
      status: result.status || 'processing',
    };
  } else {
    // 图片换脸
    requestData.image_url = targetImage;
    const result = await callA2EApi('/api/v1/face-swap/start', 'POST', requestData);
    return {
      taskId: result.task_id || result.id,
      status: result.status || 'processing',
    };
  }
}

/**
 * 虚拟试穿 (Virtual Try-On) - 对应 dressUp
 * @param {string} personImage - 人物图片 URL
 * @param {string} clothingImage - 服装图片 URL
 */
export async function virtualTryOn(personImage, clothingImage) {
  console.log('[A2E] virtualTryOn called');
  
  if (!A2E_ENABLED) return mockResponse();

  const requestData = {
    person_image_url: personImage,
    clothing_image_url: clothingImage,
  };

  const result = await callA2EApi('/api/v1/virtual-try-on/start', 'POST', requestData);
  return {
    taskId: result.task_id || result.id,
    status: result.status || 'processing',
  };
}

/**
 * 文生图 (Text to Image)
 * @param {string} prompt - 提示词
 * @param {object} params - 参数 { width, height, style }
 */
export async function textToImage(prompt, params = {}) {
  console.log('[A2E] textToImage called');
  
  if (!A2E_ENABLED) return mockResponse();

  const requestData = {
    prompt,
    width: params.width || 512,
    height: params.height || 768,
    style: params.style || 'realistic',
    negative_prompt: params.negativePrompt || '',
  };

  const result = await callA2EApi('/api/v1/text-to-image/start', 'POST', requestData);
  return {
    taskId: result.task_id || result.id,
    status: result.status || 'processing',
  };
}

/**
 * 字幕移除 (Caption Removal) - 对应 remove watermark
 * @param {string} videoUrl - 视频 URL
 */
export async function captionRemoval(videoUrl) {
  console.log('[A2E] captionRemoval called');
  
  if (!A2E_ENABLED) return mockResponse();

  const requestData = {
    video_url: videoUrl,
  };

  const result = await callA2EApi('/api/v1/caption-removal/start', 'POST', requestData);
  return {
    taskId: result.task_id || result.id,
    status: result.status || 'processing',
  };
}

/**
 * 视频转视频 (Video to Video) - 可用于高清放大
 * @param {string} videoUrl - 源视频 URL
 * @param {object} params - 参数 { scale, quality }
 */
export async function videoToVideo(videoUrl, params = {}) {
  console.log('[A2E] videoToVideo called');
  
  if (!A2E_ENABLED) return mockResponse();

  const requestData = {
    video_url: videoUrl,
    scale: params.scale || 2,
    quality: params.quality || 'high',
  };

  const result = await callA2EApi('/api/v1/video-to-video/start', 'POST', requestData);
  return {
    taskId: result.task_id || result.id,
    status: result.status || 'processing',
  };
}

/**
 * 查询任务状态
 * @param {string} taskId - A2E 任务 ID
 * @param {string} taskType - 任务类型 (image-to-video, face-swap, etc.)
 */
export async function checkTaskStatus(taskId, taskType = 'image-to-video') {
  console.log('[A2E] checkTaskStatus called:', taskId);
  
  if (!A2E_ENABLED) {
    // 模拟状态检查
    const random = Math.random();
    if (random > 0.7) {
      return {
        status: 'completed',
        resultUrl: 'https://sample-videos.com/video123.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      };
    }
    return { status: 'processing' };
  }

  try {
    // 根据任务类型选择不同的查询端点
    let endpoint;
    switch (taskType) {
      case 'image-to-video':
        endpoint = `/api/v1/image-to-video/status/${taskId}`;
        break;
      case 'face-swap':
        endpoint = `/api/v1/face-swap/status/${taskId}`;
        break;
      case 'virtual-try-on':
        endpoint = `/api/v1/virtual-try-on/status/${taskId}`;
        break;
      case 'text-to-image':
        endpoint = `/api/v1/text-to-image/status/${taskId}`;
        break;
      case 'caption-removal':
        endpoint = `/api/v1/caption-removal/status/${taskId}`;
        break;
      case 'video-to-video':
        endpoint = `/api/v1/video-to-video/status/${taskId}`;
        break;
      default:
        endpoint = `/api/v1/image-to-video/status/${taskId}`;
    }

    const result = await callA2EApi(endpoint, 'GET');
    
    return {
      status: result.status || 'processing',
      resultUrl: result.video_url || result.image_url || result.result_url,
      thumbnailUrl: result.thumbnail_url || result.video_url || result.image_url,
      progress: result.progress || 0,
      error: result.error || null,
    };
  } catch (error) {
    console.error('[A2E] Status check failed:', error);
    return { status: 'processing' };
  }
}

/**
 * 获取用户剩余积分
 */
export async function getUserCredits() {
  if (!A2E_ENABLED || !finalUserId) return { credits: 0 };
  
  try {
    const result = await callA2EApi(`/api/v1/user/${finalUserId}/credits`, 'GET');
    return {
      credits: result.credits || result.remaining_credits || 0,
    };
  } catch (error) {
    console.error('[A2E] Get credits failed:', error);
    return { credits: 0 };
  }
}

/**
 * 获取服务状态
 */
export function getServiceStatus() {
  return {
    enabled: A2E_ENABLED,
    baseUrl: A2E_BASE_URL,
    hasToken: !!A2E_API_TOKEN,
    userId: finalUserId || 'Not set (will be extracted from token if available)',
    userIdSource: A2E_USER_ID ? 'env' : (extractedUserId ? 'token' : 'none'),
  };
}

export default {
  imageToVideo,
  faceSwap,
  virtualTryOn,
  textToImage,
  captionRemoval,
  videoToVideo,
  checkTaskStatus,
  getUserCredits,
  getServiceStatus,
};

