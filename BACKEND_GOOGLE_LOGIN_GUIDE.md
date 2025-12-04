# Google 登录后端开发需求指南

## 1. 接口定义

前端已经实现并部署，等待后端对接。请在后端实现以下 API 接口。

- **接口路径**: `/api/user/google-login`
- **请求方法**: `POST`
- **Content-Type**: `application/json`

### 请求参数 (Request Body)

前端会发送以下 JSON 数据：

```json
{
  "google_id": "11223344556677889900",  // Google 用户的唯一 ID (sub)
  "email": "user@gmail.com",            // 用户邮箱
  "name": "Zhang San",                  // 用户昵称
  "picture": "https://lh3.googleusercontent.com/..." // 用户头像 URL
}
```

### 成功响应 (Response - 200 OK)

必须返回包含 `token` 和 `user` 对象的 JSON，与普通登录接口保持一致：

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...", // JWT Token，用于后续鉴权
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "username": "Zhang San",
    "email": "user@gmail.com",
    "avatar": "https://lh3.googleusercontent.com/...",
    "balance": 0,
    "isVip": false
  }
}
```

### 失败响应 (Response - Error)

```json
{
  "success": false,
  "message": "Google login failed: [具体错误信息]"
}
```

---

## 2. 业务逻辑流程

后端收到请求后，应执行以下逻辑：

1.  **查询用户**: 在数据库中查找是否已存在 `google_id` 等于请求中 `google_id` 的用户。
2.  **用户已存在 (登录)**:
    *   如果找到了用户，直接生成 JWT Token。
    *   返回 Token 和用户信息。
3.  **用户不存在 (尝试通过邮箱关联)**:
    *   如果没找到 `google_id`，但在数据库中找到了相同 `email` 的用户（可能是之前通过账号密码注册的）。
    *   **更新用户**: 将 `google_id` 和 `avatar` (如果原头像为空) 更新到该用户记录中。
    *   生成 JWT Token 并返回。
4.  **新用户 (自动注册)**:
    *   如果 `google_id` 和 `email` 都不存在。
    *   **创建新用户**:
        *   `username`: 使用 Google 提供的 `name`。
        *   `email`: 使用 Google 提供的 `email`。
        *   `google_id`: 保存 Google ID。
        *   `avatar`: 使用 Google 提供的 `picture`。
        *   `password`: 生成一个随机密码（因为用户是通过 Google 登录的，不需要密码，但数据库字段可能必填）。
    *   保存到数据库。
    *   生成 JWT Token 并返回。

---

## 3. 代码实现参考 (Node.js + Express + Mongoose)

请根据你现有的项目结构调整代码。

### 第一步：更新 User 模型 (Schema)

在 User Model 中添加 `google_id` 字段。

```javascript
// models/User.js (或类似的路径)
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  // ... 其他现有字段 ...
  
  // === 新增字段 ===
  google_id: { type: String, unique: true, sparse: true } // sparse: true 允许该字段为空
});

module.exports = mongoose.model('User', userSchema);
```

### 第二步：添加控制器方法

```javascript
// controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken'); // 假设你使用 jsonwebtoken

// 生成 Token 的辅助函数 (请使用你项目中现有的逻辑)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

exports.googleLogin = async (req, res) => {
  try {
    const { google_id, email, name, picture } = req.body;

    // 1. 检查必填参数
    if (!google_id || !email) {
      return res.status(400).json({ success: false, message: 'Missing google_id or email' });
    }

    // 2. 查找用户
    let user = await User.findOne({ 
      $or: [
        { google_id: google_id }, 
        { email: email }
      ] 
    });

    if (user) {
      // 3. 用户存在：关联 Google ID (如果尚未关联)
      if (!user.google_id) {
        user.google_id = google_id;
        await user.save();
      }
      // 更新头像 (可选：如果用户没有头像，使用 Google 头像)
      if (!user.avatar && picture) {
        user.avatar = picture;
        await user.save();
      }
    } else {
      // 4. 用户不存在：自动注册
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      
      user = await User.create({
        username: name || email.split('@')[0], // 如果没有名字，用邮箱前缀
        email: email,
        password: randomPassword, // 随机密码
        google_id: google_id,
        avatar: picture || '',
        // 初始化其他必要字段，如余额等
        balance: 0 
      });
    }

    // 5. 生成 Token 并返回
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        balance: user.balance
        // ... 其他需要返回给前端的字段
      }
    });

  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google login'
    });
  }
};
```

### 第三步：添加路由

```javascript
// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// ... 其他路由 ...

// === 新增路由 ===
router.post('/google-login', userController.googleLogin);

module.exports = router;
```

---

## 4. 验证步骤

后端代码更新并重启服务器后：

1.  确保后端服务运行在 `139.162.62.115` (或通过 Nginx 代理)。
2.  前端会自动发送请求到 `/api/user/google-login`。
3.  如果成功，前端会自动跳转到登录后页面，右上角显示用户头像。

