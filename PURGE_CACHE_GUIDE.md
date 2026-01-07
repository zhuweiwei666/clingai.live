# Cloudflare 缓存清除指南

## 问题描述

访问 `https://clingai.live` 显示的是 **GentleMind** 网站内容，而不是我们部署的 OnlyCrush 克隆。

**原因**: Cloudflare CDN 缓存了旧内容。

## 解决方案

### 方法 1: 通过 Cloudflare 控制台手动清除（推荐，最简单）

1. **登录 Cloudflare 控制台**
   - 访问: https://dash.cloudflare.com
   - 使用您的 Cloudflare 账户登录

2. **选择域名**
   - 在域名列表中找到并点击 `clingai.live`

3. **清除缓存**
   - 左侧菜单: **缓存** (Caching)
   - 点击 **"清除缓存"** (Purge Cache) 或 **"清除所有内容"** (Purge Everything)
   - 确认清除操作

4. **等待生效**
   - 通常 1-2 分钟内生效
   - 可以多次刷新页面验证

### 方法 2: 使用 API 脚本自动清除

如果您有 Cloudflare API Token 或 API Key：

```bash
# 使用 API Token（推荐）
CF_API_TOKEN='your-api-token' ./purge-cloudflare-cache.sh

# 或使用 API Key + Email
CF_API_KEY='your-api-key' CF_EMAIL='your-email' ./purge-cloudflare-cache.sh
```

**获取 API Token**:
1. Cloudflare 控制台 → My Profile → API Tokens
2. 创建 Token，权限选择: `Zone.Cache Purge:Edit`
3. 复制生成的 Token

### 方法 3: 设置缓存规则（长期解决方案）

在 Cloudflare 控制台中设置缓存规则，对 HTML 文件绕过缓存：

1. **缓存** (Caching) → **配置** (Configuration)
2. **页面规则** (Page Rules) 或 **缓存规则** (Cache Rules)
3. 创建规则:
   - URL 匹配: `clingai.live/*`
   - 设置: **缓存级别** → **绕过** (Bypass) 或 **标准** (Standard)
   - 或者: **边缘缓存 TTL** → **尊重现有标头** (Respect Existing Headers)

### 方法 4: 临时绕过缓存（测试用）

在浏览器中访问时添加查询参数：
- `https://clingai.live/?v=1`
- `https://clingai.live/?nocache=1`

或使用开发者工具：
- 打开浏览器开发者工具 (F12)
- 网络 (Network) 标签
- 勾选 **"禁用缓存"** (Disable cache)
- 刷新页面

## 验证

清除缓存后，验证网站内容：

```bash
# 检查响应头
curl -sI https://clingai.live | head -10

# 检查页面内容
curl -s https://clingai.live | grep -i "Hot AI Video\|OnlyCrush" | head -5
```

应该看到 "Hot AI Video - Powerful AI Generator" 而不是 "GentleMind"。

## 当前状态

- ✅ 服务器端文件正确（已验证）
- ✅ Nginx 配置正确
- ⚠️ Cloudflare CDN 缓存需要清除

## 快速操作

**立即执行**（如果您有 Cloudflare 账户访问权限）:

1. 访问: https://dash.cloudflare.com
2. 选择 `clingai.live`
3. 缓存 → 清除所有内容
4. 等待 1-2 分钟
5. 访问 https://clingai.live 验证

