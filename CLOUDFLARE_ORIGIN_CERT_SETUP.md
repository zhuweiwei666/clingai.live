# Cloudflare Origin Certificate 完整设置指南

## 问题：526 错误

526 错误表示 Cloudflare 无法验证源服务器的 SSL 证书。

## 解决方案：在 Cloudflare 中配置源服务器证书

### 步骤 1：获取证书内容

证书已安装在服务器上，内容如下：

```
-----BEGIN CERTIFICATE-----
MIIEFTCCAv2gAwIBAgIUKx7FYzPkmFp4lZQOn0kvZhBlNPkwDQYJKoZIhvcNAQEL
BQAwgagxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQH
Ew1TYW4gRnJhbmNpc2NvMRkwFwYDVQQKExBDbG91ZGZsYXJlLCBJbmMuMRswGQYD
VQQLExJ3d3cuY2xvdWRmbGFyZS5jb20xNDAyBgNVBAMTK01hbmFnZWQgQ0EgMThm
MjkyY2E0YTg4NjA0NmI2YThhZDBiM2ZhMzE2YTAwHhcNMjYwMTA2MDkyOTAwWhcN
MzYwMTA0MDkyOTAwWjAiMQswCQYDVQQGEwJVUzETMBEGA1UEAxMKQ2xvdWRmbGFy
ZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKbokFD7h/KuR8MI4HiU
AOvUQ/+BPiJFWZ/dqHYPbhDU5VBoPAgMrDOWKNwBsv7HWfc5BerYaGOVoU0sJbjI
VQgXvhHxGmc534tsUpzO8hO4ACzCyxUCEtiZHeNzk76sqRCVuPyta7mEjYasBtzd
ngxi5qUAs16L+H/DMBG40tDxlFF+cMCtNTsqueUGQYW3V4X02IO/Eidr9IbJYYiP
KKgxLubB8u3LYvTRTvCFlP00OK+hvC/9mugfspmt+f5u/lG/Te+ceRRPlkJAdDCB
ZAi0DtOYYoA48yjAU0YJKqw2Q5tvQY9Zp358DmYnDpqNWAEc3z+MROYcc5HAwvSB
2usCAwEAAaOBuzCBuDATBgNVHSUEDDAKBggrBgEFBQcDAjAMBgNVHRMBAf8EAjAA
MB0GA1UdDgQWBBSG9eEyzvPV7tFGZeckGb/puSrgzDAfBgNVHSMEGDAWgBQNYYh+
r01e8kVCxl+h5WGcTOSGhjBTBgNVHR8ETDBKMEigRqBEhkJodHRwOi8vY3JsLmNs
b3VkZmxhcmUuY29tL2ViMmI0MWIzLWVhMGYtNGU5ZS05Nzc4LWVhZTJjMDYzMTY1
My5jcmwwDQYJKoZIhvcNAQELBQADggEBAHzNa8Sw/V9xyqK95+42DsM7Kxq/Xv4T
XDPX2KKqFCvITMuCw48uUQcmuEIBlR2cNhkirHZqe6FwnUOH5z/uCD6Kguoc7Sy6
A9pvseXGFcIuWhHWNqxvTNHd47nWEgQSNvEC3VGDEFtS5rWV25ZC7CfOUPfMn2k1
fkeTVFN9rSy3yUn8YVcs+kaO6niQZ5UAS3LhhcIMXEi0uAPyt7aQ6a3WmzBp91ml
xTHYfo7NA0VdgnYsmjnOb8hqVqqCwTNgDGWZNOctGv/0hp/cN2P+6sjyC7EcMBjO
tpc+IGCUkhiS+m5ZiOKiXdjRaL6T0Y7RKJXvT6V8PVKd4W8bwPb4WA0=
-----END CERTIFICATE-----
```

### 步骤 2：在 Cloudflare 控制台配置

1. **登录 Cloudflare 控制台**
   - 访问：https://dash.cloudflare.com
   - 选择域名 `clingai.live`

2. **进入源服务器设置**
   - 左侧菜单：**SSL/TLS** → **源服务器** (Origin Server)
   - 或者直接访问：`https://dash.cloudflare.com/[你的账户ID]/clingai.live/ssl-tls/origin`

3. **创建源服务器证书**
   - 点击 **"创建证书"** (Create Certificate)
   - 或者如果已有证书，点击 **"上传证书"** (Upload Certificate)

4. **上传证书**
   - **证书**：粘贴上面的证书内容（包括 BEGIN 和 END 行）
   - **私钥**：**不要上传私钥到 Cloudflare**（私钥只在服务器上）
   - 点击 **"创建"** 或 **"保存"**

5. **验证设置**
   - 确保显示 "已安装源服务器证书"
   - SSL/TLS 模式应设置为 **"Full (strict)"**

### 步骤 3：等待生效

- 等待 2-5 分钟让 Cloudflare 更新配置
- 清除浏览器缓存
- 访问 https://clingai.live

## 重要提示

⚠️ **私钥安全**：
- **永远不要**将私钥上传到 Cloudflare
- 私钥只应该存在于服务器上
- Cloudflare 只需要证书（公钥）

## 如果仍然出现 526 错误

### 选项 A：临时使用 Full 模式（不严格）

1. Cloudflare 控制台 → SSL/TLS → 概述
2. 将模式改为 **"完全 (Full)"**（不是 "完全 (严格)"）
3. 保存并等待 2-5 分钟

### 选项 B：检查证书有效性

确保证书：
- ✅ 未过期
- ✅ 由 Cloudflare Managed CA 签发
- ✅ 与私钥匹配（已确认 ✅）

### 选项 C：清除 Cloudflare 缓存

1. Cloudflare 控制台 → **缓存** (Caching)
2. 点击 **"清除所有内容"** (Purge Everything)
3. 等待 1-2 分钟

## 验证步骤

1. **检查服务器端**（已完成 ✅）
   ```bash
   curl -k -I https://clingai.live
   # 应该返回 200 OK
   ```

2. **检查 Cloudflare 设置**
   - SSL/TLS 模式：Full (strict)
   - 源服务器证书：已安装

3. **测试访问**
   - https://clingai.live
   - 应该显示安全锁图标

## 当前状态

✅ 服务器端 SSL 配置完成
✅ 证书和私钥匹配
✅ HTTPS 服务正常运行
⏳ 需要在 Cloudflare 控制台配置源服务器证书

