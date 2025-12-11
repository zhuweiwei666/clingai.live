import { useState, useEffect, useRef, useCallback } from 'react';
import { cacheManager, CACHE_KEYS } from '../utils/cache';

/**
 * 带缓存的异步数据加载Hook
 * @param {string} cacheKey - 缓存键名
 * @param {Function} fetchFn - 数据获取函数
 * @param {Object} options - 配置选项
 * @param {number} options.ttl - 缓存过期时间（毫秒）
 * @param {boolean} options.enableCache - 是否启用缓存
 * @param {Array} options.deps - 依赖数组，变化时重新加载
 */
export function useCache(cacheKey, fetchFn, options = {}) {
  const {
    ttl = 5 * 60 * 1000, // 默认5分钟
    enableCache = true,
    deps = [],
    immediate = true, // 是否立即加载
  } = options;

  // 优化：立即从缓存初始化数据
  const [data, setData] = useState(() => {
    if (enableCache && immediate) {
      const cached = cacheManager.get(cacheKey);
      if (cached) {
        return cached;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(() => {
    // 如果有缓存数据，不显示loading
    if (enableCache && immediate) {
      const cached = cacheManager.get(cacheKey);
      if (cached) {
        return false; // 有缓存，不显示loading
      }
    }
    return immediate;
  });
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const loadData = useCallback(async (force = false) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // 如果启用缓存且不强制刷新，先检查缓存
    if (enableCache && !force) {
      const cached = cacheManager.get(cacheKey);
      if (cached) {
        setData(cached);
        setLoading(false);
        setError(null);
        // 后台刷新数据
        loadData(true);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchFn(abortControllerRef.current.signal);
      
      // 检查是否被取消
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      setData(result);
      
      // 保存到缓存
      if (enableCache) {
        cacheManager.set(cacheKey, result, ttl);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // 请求被取消，忽略错误
        return;
      }
      console.error('加载数据失败:', err);
      setError(err);
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, [cacheKey, fetchFn, enableCache, ttl, ...deps]);

  // 刷新数据（强制重新加载）
  const refresh = useCallback(() => {
    cacheManager.delete(cacheKey);
    loadData(true);
  }, [cacheKey, loadData]);

  // 初始加载
  useEffect(() => {
    if (immediate) {
      loadData(false);
    }

    return () => {
      // 清理：取消进行中的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate]);

  return {
    data,
    loading,
    error,
    refresh,
    reload: refresh, // 别名
  };
}
