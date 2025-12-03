# 🚀 快速部署指南

## 一键部署

在项目根目录执行：

```bash
./auto-deploy.sh
```

## 脚本功能

✅ 自动推送代码到 GitHub  
✅ 服务器自动拉取最新代码  
✅ 自动安装依赖  
✅ 自动构建项目  
✅ 自动部署文件  
✅ 自动配置 Nginx  
✅ 自动重启服务  
✅ 完整的错误处理和日志记录  

## 配置信息

- **服务器**: root@173.255.193.131
- **部署目录**: /var/www/honeyai
- **GitHub 仓库**: git@github.com:zhuweiwei666/clingai.live.git

## 查看日志

```bash
# 查看完整日志
tail -f deploy.log

# 查看错误日志
cat deploy-error.log
```

## 访问网站

部署成功后访问：http://173.255.193.131

## 需要帮助？

查看详细文档：`AUTO_DEPLOY_README.md`

