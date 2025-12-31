# Google登录调试指南

## 当前状态

Google登录功能遇到问题，Console显示"Cross-Origin-Opener-Policy"警告，并且登录失败。

## COOP警告说明

**重要**：`Cross-Origin-Opener-Policy policy would block the window.closed call` 这个警告是 `@react-oauth/google` 库内部的警告，**不一定意味着功能完全失败**。

这个警告出现是因为：
1. 库使用 `window.closed` 来检查OAuth弹窗是否关闭
2. 浏览器的COOP策略可能阻止这个调用
3. 但OAuth流程本身可能仍然正常工作

## 调试步骤

### 1. 检查Network标签

打开浏览器开发者工具，切换到 **Network** 标签，然后：

1. **清除所有请求**（点击清除按钮）
2. **点击"Sign in with Google"按钮**
3. **在Google OAuth弹窗中授权**
4. **查看Network标签中的请求**：

   - 查找 `/api/auth/google` 请求
   - 检查请求状态码：
     - `200` = 成功
     - `400` = 客户端错误（可能是参数问题）
     - `401` = 未授权
     - `500` = 服务器错误
   - 查看请求的 **Response** 标签，查看后端返回的实际数据
   - 查看请求的 **Headers** 标签，确认请求格式正确

### 2. 检查Console日志

在Console标签中，应该看到以下日志（按顺序）：

```
[Login] Google OAuth token received
[Login] Google user info: { sub: '...', email: '...', name: '...' }
[Login] Sending Google user info to backend: { googleId: '...', email: '...', name: '...' }
[AuthService] Google login request: { googleId: '...', email: '...', ... }
[AuthService] Google login response: { token: '...', user: {...} }
[Login] Backend response: { token: '...', user: {...} }
```

**如果某个日志没有出现，说明问题出在那个步骤。**

### 3. 常见问题排查

#### 问题1: 没有看到 `[Login] Google OAuth token received`
- **原因**: Google OAuth弹窗没有成功打开或授权失败
- **解决**: 
  - 检查浏览器是否阻止了弹窗
  - 检查Google Client ID是否正确配置
  - 检查Google Cloud Console中的OAuth配置

#### 问题2: 看到 `[Login] Google OAuth token received` 但没有看到 `[Login] Google user info`
- **原因**: 无法从Google获取用户信息
- **解决**: 
  - 检查网络连接
  - 检查Google API是否可访问
  - 检查access_token是否有效

#### 问题3: 看到 `[Login] Sending Google user info to backend` 但没有看到 `[AuthService] Google login response`
- **原因**: 后端API请求失败
- **解决**: 
  - 查看Network标签中的 `/api/auth/google` 请求
  - 检查请求状态码和响应内容
  - 检查后端服务器是否正常运行

#### 问题4: 看到 `[AuthService] Google login response` 但登录仍然失败
- **原因**: 响应格式处理问题
- **解决**: 
  - 查看 `[Login] Backend response` 日志
  - 检查响应格式是否符合预期
  - 查看 `[Login] Invalid response format` 或 `[Login] No token in response` 错误

### 4. 检查Google Cloud Console配置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择正确的项目
3. 导航到 **APIs & Services** > **Credentials**
4. 找到你的OAuth 2.0客户端ID
5. 检查以下配置：
   - **Authorized JavaScript origins** 应该包含：
     - `https://clingai.live`
     - `http://clingai.live` (如果需要)
   - **Authorized redirect URIs** 应该包含：
     - `https://clingai.live`
     - `http://clingai.live` (如果需要)

### 5. 检查环境变量

确保 `.env` 文件（或服务器上的环境变量）中包含：

```bash
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

### 6. 清除缓存并重试

1. 清除浏览器缓存
2. 硬刷新页面（Ctrl+Shift+R 或 Cmd+Shift+R）
3. 重新尝试登录

## 如果问题仍然存在

请提供以下信息：

1. **Network标签截图**：
   - 显示 `/api/auth/google` 请求的详细信息
   - 包括请求状态码、请求体、响应内容

2. **Console完整日志**：
   - 从点击"Sign in with Google"按钮开始的所有日志
   - 包括所有错误信息

3. **错误信息**：
   - Toast提示的具体错误消息
   - Console中的任何红色错误

4. **环境信息**：
   - 浏览器类型和版本
   - 操作系统
   - 是否使用了VPN或代理

---

**最后更新**: 2025-12-31

