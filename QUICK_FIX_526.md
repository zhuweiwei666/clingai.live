# 快速修复 Cloudflare 526 错误

## ✅ 服务器端已修复

Nginx 配置已更新，服务器 HTTP 服务正常运行。

## 🔧 需要在 Cloudflare 控制台操作

**526 错误的原因是：Cloudflare 尝试使用 HTTPS 连接源站，但源站没有 SSL 证书。**

### 立即修复步骤（2分钟）：

1. **登录 Cloudflare 控制台**
   - 访问：https://dash.cloudflare.com
   - 登录你的账户

2. **选择域名**
   - 点击域名 `clingai.live`

3. **进入 SSL/TLS 设置**
   - 左侧菜单点击 **"SSL/TLS"**

4. **修改加密模式**
   - 找到 **"SSL/TLS 加密模式"**
   - 将模式从 **"Full"** 或 **"Full (strict)"** 改为 **"Flexible"（灵活模式）**
   - 点击 **"保存"**

5. **等待生效**
   - 通常 1-2 分钟内生效
   - 刷新浏览器缓存后访问 https://clingai.live

## 📋 三种 SSL 模式说明

### Flexible（灵活模式）- 推荐用于当前情况
- ✅ 用户 ↔ Cloudflare：HTTPS（加密）
- ⚠️ Cloudflare ↔ 源站：HTTP（不需要 SSL 证书）
- **优点**：不需要配置 SSL 证书，立即可用
- **缺点**：Cloudflare 到源站未加密（但通常足够安全）

### Full（完全模式）
- ✅ 用户 ↔ Cloudflare：HTTPS（加密）
- ✅ Cloudflare ↔ 源站：HTTPS（需要 SSL 证书）
- **要求**：源站必须配置 SSL 证书

### Full (strict)（严格模式）
- ✅ 用户 ↔ Cloudflare：HTTPS（加密）
- ✅ Cloudflare ↔ 源站：HTTPS（需要有效 SSL 证书）
- **要求**：源站必须配置有效的、受信任的 SSL 证书

## 🔒 长期方案：配置 SSL 证书（可选）

如果需要端到端加密，可以配置 Let's Encrypt 免费 SSL 证书：

```bash
# SSH 连接到服务器
ssh root@173.255.193.131

# 安装 Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx -y

# 获取 SSL 证书（自动配置 Nginx）
sudo certbot --nginx -d clingai.live -d www.clingai.live

# 设置自动续期
sudo certbot renew --dry-run
```

配置 SSL 证书后，可以将 Cloudflare SSL 模式改为 **"Full"** 或 **"Full (strict)"**。

## ✅ 验证修复

修复后，访问以下地址应该可以正常访问：
- ✅ https://clingai.live
- ✅ http://clingai.live（会重定向到 HTTPS）
- ✅ http://173.255.193.131

## 📞 如果仍有问题

1. **清除浏览器缓存**
2. **等待 2-5 分钟**（DNS 和 SSL 设置需要时间传播）
3. **检查 Cloudflare 状态**：确保域名在 Cloudflare 中处于 "Active" 状态
4. **检查 DNS 记录**：确保 A 记录指向 `173.255.193.131`

