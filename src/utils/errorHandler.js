/**
 * 统一错误处理工具
 * 处理 API 错误、网络错误、加载状态、空状态等
 */

import toast from 'react-hot-toast';

/**
 * 处理 API 错误
 * @param {Error} error - 错误对象
 * @param {Object} options - 选项
 * @param {string} options.defaultMessage - 默认错误消息
 * @param {boolean} options.showToast - 是否显示 toast
 * @param {Function} options.onError - 自定义错误处理函数
 * @returns {string} 错误消息
 */
export function handleApiError(error, options = {}) {
  const {
    defaultMessage = 'An error occurred',
    showToast = true,
    onError,
  } = options;

  let errorMessage = defaultMessage;

  // 网络错误
  if (!error.response) {
    if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error.message && error.message.includes('timeout')) {
      errorMessage = 'Request timeout. Please try again.';
    } else {
      errorMessage = error.message || defaultMessage;
    }
  }
  // API 错误响应
  else if (error.response?.data) {
    const errorData = error.response.data;
    
    // 统一错误格式
    if (errorData.success === false) {
      errorMessage = errorData.error || defaultMessage;
    } else if (errorData.error) {
      errorMessage = errorData.error;
    } else if (errorData.message) {
      errorMessage = errorData.message;
    }
    
    // HTTP 状态码特定处理
    if (error.response.status === 401) {
      errorMessage = 'Please login to continue';
    } else if (error.response.status === 403) {
      errorMessage = 'Access denied';
    } else if (error.response.status === 404) {
      errorMessage = 'Resource not found';
    } else if (error.response.status === 429) {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (error.response.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    }
  }
  // 其他错误
  else if (error.message) {
    errorMessage = error.message;
  }

  // 显示 toast
  if (showToast) {
    toast.error(errorMessage);
  }

  // 自定义错误处理
  if (onError) {
    onError(error, errorMessage);
  }

  // 记录错误
  console.error('[ErrorHandler]', errorMessage, error);

  return errorMessage;
}

/**
 * 处理加载状态，防止重复请求
 * @param {Function} asyncFn - 异步函数
 * @param {Object} state - 状态对象 { loading, setLoading }
 * @param {Object} options - 选项
 * @returns {Promise} 异步函数的结果
 */
export async function withLoadingState(asyncFn, state, options = {}) {
  const { loading, setLoading } = state;
  const { preventDuplicate = true } = options;

  // 防止重复请求
  if (preventDuplicate && loading) {
    return Promise.reject(new Error('Request already in progress'));
  }

  try {
    setLoading(true);
    const result = await asyncFn();
    return result;
  } catch (error) {
    throw error;
  } finally {
    setLoading(false);
  }
}

/**
 * 处理空状态
 * @param {Array|Object} data - 数据
 * @param {Object} options - 选项
 * @returns {boolean} 是否为空
 */
export function isEmpty(data, options = {}) {
  const { allowEmptyArray = false } = options;

  if (data === null || data === undefined) {
    return true;
  }

  if (Array.isArray(data)) {
    return allowEmptyArray ? false : data.length === 0;
  }

  if (typeof data === 'object') {
    return Object.keys(data).length === 0;
  }

  return false;
}

/**
 * 重试机制
 * @param {Function} asyncFn - 异步函数
 * @param {Object} options - 选项
 * @returns {Promise} 异步函数的结果
 */
export async function retry(asyncFn, options = {}) {
  const {
    maxRetries = 3,
    delay = 1000,
    onRetry,
  } = options;

  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error;
      
      // 不重试 4xx 错误（客户端错误）
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }

      // 最后一次尝试，直接抛出错误
      if (i === maxRetries - 1) {
        throw error;
      }

      // 回调
      if (onRetry) {
        onRetry(i + 1, error);
      }

      // 延迟
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }

  throw lastError;
}

/**
 * 防抖函数
 * @param {Function} fn - 函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * 节流函数
 * @param {Function} fn - 函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(fn, delay = 300) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
}

