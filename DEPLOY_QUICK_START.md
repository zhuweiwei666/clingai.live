# 🚀 快速开始 - 自动部署

## ✅ 已配置完成！

现在每次修改代码并提交后，**会自动运行部署脚本**。

## 📝 使用方法

### 方式1: Git 提交自动部署（默认已启用）

```bash
# 1. 修改代码后
git add .
git commit -m "更新功能"

# 2. 提交后会自动触发部署
# 部署在后台运行，不会阻塞你的工作
```

### 方式2: 手动运行部署

```bash
./auto-deploy.sh
```

### 方式3: 文件监控自动部署

```bash
# 启动监控（保存文件即自动部署）
./watch-and-deploy.sh

# 按 Ctrl+C 停止
```

## 📊 查看部署状态

```bash
# 实时查看部署日志
tail -f deploy.log

# 查看错误日志
cat deploy-error.log
```

## 🔧 测试配置

```bash
# 运行测试脚本检查配置
./test-auto-deploy.sh
```

## 📚 详细文档

- `AUTO_DEPLOY_README.md` - 完整使用说明
- `AUTO_DEPLOY_SETUP.md` - 自动触发配置说明
- `QUICK_DEPLOY.md` - 快速部署指南

## ⚡ 常用命令

```bash
# 部署
./auto-deploy.sh

# 查看日志
tail -f deploy.log

# 测试配置
./test-auto-deploy.sh

# 文件监控
./watch-and-deploy.sh
```

## 🌐 部署地址

部署成功后访问：**http://173.255.193.131**

---

**提示：** 现在你只需要正常提交代码，部署会自动进行！🎉

