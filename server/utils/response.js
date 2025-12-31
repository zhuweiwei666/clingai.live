/**
 * 统一响应格式工具
 */

/**
 * 成功响应
 * @param {Object} res - Express response object
 * @param {*} data - 响应数据
 * @param {string} message - 可选消息
 * @param {number} statusCode - HTTP 状态码，默认 200
 */
export function successResponse(res, data, message = null, statusCode = 200) {
  const response = {
    success: true,
    data,
  };
  
  if (message) {
    response.message = message;
  }
  
  return res.status(statusCode).json(response);
}

/**
 * 错误响应
 * @param {Object} res - Express response object
 * @param {string} error - 错误消息
 * @param {string} code - 可选错误代码
 * @param {number} statusCode - HTTP 状态码，默认 400
 */
export function errorResponse(res, error, code = null, statusCode = 400) {
  const response = {
    success: false,
    error,
  };
  
  if (code) {
    response.code = code;
  }
  
  return res.status(statusCode).json(response);
}

export default {
  successResponse,
  errorResponse,
};

