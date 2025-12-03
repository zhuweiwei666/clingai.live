# 自动部署设置说明

## ✅ 已配置的自动触发方式

### 方式1: Git 提交后自动部署（推荐）

每次执行 `git commit` 后，会自动触发部署脚本。

**已自动配置，无需额外操作！**

```bash
# 正常提交代码
git add .
git commit -m "更新功能"

# 提交后会自动运行部署脚本
# 部署在后台运行，不会阻塞你的工作
```

**查看部署日志：**
```bash
tail -f deploy.log
```

### 方式2: 文件监控自动部署

监控文件变化，保存文件后自动触发部署。

**启动监控：**
```bash
./watch-and-deploy.sh
```

**停止监控：**
按 `Ctrl+C`

**注意：** 需要先安装 `fswatch`（macOS）或 `inotify-tools`（Linux）

```bash
# macOS
brew install fswatch

# Linux (Ubuntu/Debian)
sudo apt-get install inotify-tools

# Linux (CentOS/RHEL)
sudo yum install inotify-tools
```

### 方式3: 手动运行

任何时候都可以手动运行：

```bash
./auto-deploy.sh
```

## 📋 使用建议

1. **日常开发**：使用 Git hook（方式1），每次提交后自动部署
2. **频繁调试**：使用文件监控（方式2），保存即部署
3. **一次性部署**：手动运行（方式3）

## 🔧 禁用自动部署

如果不想在提交时自动部署，可以：

```bash
# 重命名或删除 hook
mv .git/hooks/post-commit .git/hooks/post-commit.disabled

# 或直接删除
rm .git/hooks/post-commit
```

## 📝 日志文件

- `deploy.log` - 完整部署日志
- `deploy-error.log` - 错误日志

## ⚡ 快速命令

```bash
# 查看最新部署日志
tail -f deploy.log

# 查看错误日志
cat deploy-error.log

# 手动触发部署
./auto-deploy.sh

# 启动文件监控
./watch-and-deploy.sh
```

