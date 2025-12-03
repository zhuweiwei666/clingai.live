# 🔧 修复 Nginx 显示默认页面问题

## 问题描述

访问 http://173.255.193.131 时显示 Nginx 默认欢迎页面，而不是你的网站。

## 可能的原因

1. **网站文件未上传** - `dist` 目录的文件没有上传到服务器
2. **Nginx 配置未正确设置** - 默认站点还在启用
3. **文件权限问题** - Nginx 无法读取文件
4. **配置未生效** - Nginx 配置已更新但未重载

## 🚀 快速修复方法

### 方法一：运行修复脚本（推荐）

```bash
# 下载修复脚本
curl -O https://raw.githubusercontent.com/zhuweiwei666/clingai.live/main/fix-nginx.sh
chmod +x fix-nginx.sh
./fix-nginx.sh
```

### 方法二：运行完整部署脚本

如果文件未上传，运行完整部署：

```bash
./Clingai-deploy-from-github.sh
```

### 方法三：手动修复

#### 1. SSH 连接到服务器

```bash
ssh root@173.255.193.131
# 密码: Zww199976.@1
```

#### 2. 检查部署目录

```bash
ls -la /var/www/honeyai
```

如果目录为空或不存在，需要先上传文件。

#### 3. 创建 Nginx 配置

```bash
cat > /etc/nginx/sites-available/honeyai << 'EOF'
server {
    listen 80;
    server_name _;
    root /var/www/honeyai;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
```

#### 4. 启用站点并删除默认站点

```bash
# 启用站点
ln -sf /etc/nginx/sites-available/honeyai /etc/nginx/sites-enabled/

# 删除默认站点
rm -f /etc/nginx/sites-enabled/default

# 测试配置
nginx -t

# 重载 Nginx
systemctl reload nginx
```

#### 5. 检查文件权限

```bash
# 确保 Nginx 可以读取文件
chmod -R 755 /var/www/honeyai
chown -R www-data:www-data /var/www/honeyai
```

## 🔍 诊断步骤

### 1. 检查文件是否存在

```bash
ssh root@173.255.193.131 "ls -la /var/www/honeyai"
```

应该看到 `index.html` 和其他文件。

### 2. 检查 Nginx 配置

```bash
ssh root@173.255.193.131 "cat /etc/nginx/sites-enabled/honeyai"
```

应该看到 `root /var/www/honeyai;`

### 3. 检查 Nginx 状态

```bash
ssh root@173.255.193.131 "systemctl status nginx"
```

### 4. 查看 Nginx 错误日志

```bash
ssh root@173.255.193.131 "tail -20 /var/log/nginx/error.log"
```

## ✅ 验证修复

修复后：

1. **清除浏览器缓存** 或使用无痕模式
2. **访问网站**: http://173.255.193.131
3. **应该看到你的网站**，而不是 Nginx 默认页面

## 📝 完整部署流程

如果文件未上传，按以下步骤操作：

```bash
# 1. 在本地构建项目
npm run build

# 2. 上传文件到服务器
scp -r dist/* root@173.255.193.131:/var/www/honeyai/

# 3. 配置 Nginx（使用上面的方法三）
```

或者直接运行完整部署脚本：

```bash
./Clingai-deploy-from-github.sh
```

## 🆘 仍然无法访问？

1. **检查防火墙**
   ```bash
   ssh root@173.255.193.131 "ufw status"
   ```

2. **检查端口是否开放**
   ```bash
   nc -zv 173.255.193.131 80
   ```

3. **检查 Nginx 是否运行**
   ```bash
   ssh root@173.255.193.131 "systemctl status nginx"
   ```

4. **查看详细日志**
   ```bash
   ssh root@173.255.193.131 "tail -f /var/log/nginx/error.log"
   ```

