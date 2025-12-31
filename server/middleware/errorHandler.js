/**
 * 统一错误处理中间件
 */

import { errorResponse } from '../utils/response.js';

/**
 * 错误处理中间件
 * 捕获所有未处理的错误并返回统一格式
 */
export function errorHandler(err, req, res, next) {
  console.error('[Error Handler]', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // 如果是已知错误，直接返回
  if (err.statusCode) {
    return errorResponse(res, err.message, err.code, err.statusCode);
  }

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message).join(', ');
    return errorResponse(res, messages, 'VALIDATION_ERROR', 400);
  }

  // Mongoose Cast 错误（无效的 ObjectId）
  if (err.name === 'CastError') {
    return errorResponse(res, 'Invalid ID format', 'INVALID_ID', 400);
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 'INVALID_TOKEN', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', 'TOKEN_EXPIRED', 401);
  }

  // 默认服务器错误
  return errorResponse(res, err.message || 'Internal server error', 'INTERNAL_ERROR', 500);
}

/**
 * 404 处理中间件
 */
export function notFoundHandler(req, res) {
  return errorResponse(res, `Route ${req.method} ${req.path} not found`, 'NOT_FOUND', 404);
}

export default {
  errorHandler,
  notFoundHandler,
};

