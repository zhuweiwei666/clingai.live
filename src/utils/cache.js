// 全局缓存工具
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 默认5分钟
  }

  // 设置缓存
  set(key, data, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, {
      data,
      expiry,
      timestamp: Date.now(),
    });
    
    // 同时保存到localStorage（持久化）
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        expiry,
        timestamp: Date.now(),
      }));
    } catch (e) {
      console.warn('保存缓存到localStorage失败:', e);
    }
  }

  // 获取缓存
  get(key) {
    // 先从内存获取
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    
    // 内存中没有或过期，尝试从localStorage获取
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() < parsed.expiry) {
          // 恢复到内存缓存
          this.cache.set(key, parsed);
          return parsed.data;
        } else {
          // 过期，删除
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (e) {
      console.warn('从localStorage读取缓存失败:', e);
    }
    
    return null;
  }

  // 检查缓存是否存在且有效
  has(key) {
    return this.get(key) !== null;
  }

  // 删除缓存
  delete(key) {
    this.cache.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (e) {
      console.warn('删除localStorage缓存失败:', e);
    }
  }

  // 清除所有缓存
  clear() {
    this.cache.clear();
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('清除localStorage缓存失败:', e);
    }
  }

  // 清除特定前缀的缓存
  clearByPrefix(prefix) {
    this.cache.forEach((value, key) => {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    });
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(`cache_${prefix}`)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('清除前缀缓存失败:', e);
    }
  }

  // 获取缓存信息（用于调试）
  getInfo(key) {
    const cached = this.cache.get(key);
    if (cached) {
      return {
        exists: true,
        expired: Date.now() >= cached.expiry,
        age: Date.now() - cached.timestamp,
        ttl: cached.expiry - Date.now(),
      };
    }
    return { exists: false };
  }
}

// 导出单例
export const cacheManager = new CacheManager();

// 缓存键名常量
export const CACHE_KEYS = {
  AGENTS_LIST: 'agents_list',
  MESSAGES_LIST: 'messages_list',
  AGENT_DETAIL: (id) => `agent_detail_${id}`,
  CHAT_HISTORY: (id) => `chat_history_${id}`,
};
