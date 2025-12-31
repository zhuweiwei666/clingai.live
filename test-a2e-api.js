#!/usr/bin/env node
/**
 * 直接测试 A2E API 端点格式
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const A2E_API_TOKEN = process.env.A2E_API_TOKEN || 'sk_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OTUyMmFhZDI0YTQzZjAwNjA2ZTNlMmMiLCJuYW1lIjoiMTgyNzE4NDAyMjUiLCJyb2xlIjoidmlwIiwiaWF0IjoxNzY3MTQ2NDY2fQ.n24n8XI0TLbysF9rLi3Kr-By5jDtC9CTCLJOMgMDguk';
const A2E_BASE_URL = process.env.A2E_BASE_URL || 'https://video.a2e.ai';
const A2E_USER_ID = process.env.A2E_USER_ID || '69522aad24a43f00606e3e2c';

// 测试图片URL（使用一个公开的测试图片）
const TEST_IMAGE_URL = 'https://pub-17497f33464648bdb5f47bbbdbf732e7.r2.dev/images/img_1767155828263_1nhox8.jpg';

async function testA2EApi() {
  console.log('=== 测试 A2E API ===\n');
  console.log(`Base URL: ${A2E_BASE_URL}`);
  console.log(`Token: ${A2E_API_TOKEN.substring(0, 20)}...`);
  console.log(`User ID: ${A2E_USER_ID}\n`);

  // 1. 测试启动图生视频任务
  console.log('1. 测试启动图生视频任务...');
  try {
    const startResponse = await fetch(`${A2E_BASE_URL}/api/v1/image-to-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${A2E_API_TOKEN}`,
        'X-User-Id': A2E_USER_ID,
      },
      body: JSON.stringify({
        image_url: TEST_IMAGE_URL,
        duration: 5,
        fps: 25,
      }),
    });

    console.log(`   Status: ${startResponse.status}`);
    const startResult = await startResponse.text();
    console.log(`   Response: ${startResult.substring(0, 500)}...\n`);

    if (startResponse.ok) {
      const result = JSON.parse(startResult);
      const taskId = result.task_id || result.id || result.taskId;
      console.log(`   ✅ 任务创建成功！Task ID: ${taskId}\n`);

      // 2. 测试查询任务状态 - 方式1: GET /api/v1/image-to-video/${taskId}
      console.log('2. 测试查询状态 - 方式1: GET /api/v1/image-to-video/${taskId}');
      try {
        const statusResponse1 = await fetch(`${A2E_BASE_URL}/api/v1/image-to-video/${taskId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${A2E_API_TOKEN}`,
            'X-User-Id': A2E_USER_ID,
          },
        });
        console.log(`   Status: ${statusResponse1.status}`);
        const statusResult1 = await statusResponse1.text();
        console.log(`   Response: ${statusResult1.substring(0, 500)}...\n`);
      } catch (error) {
        console.log(`   ❌ 错误: ${error.message}\n`);
      }

      // 3. 测试查询任务状态 - 方式2: POST /api/v1/image-to-video/status
      console.log('3. 测试查询状态 - 方式2: POST /api/v1/image-to-video/status');
      try {
        const statusResponse2 = await fetch(`${A2E_BASE_URL}/api/v1/image-to-video/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${A2E_API_TOKEN}`,
            'X-User-Id': A2E_USER_ID,
          },
          body: JSON.stringify({
            task_id: taskId,
          }),
        });
        console.log(`   Status: ${statusResponse2.status}`);
        const statusResult2 = await statusResponse2.text();
        console.log(`   Response: ${statusResult2.substring(0, 500)}...\n`);
      } catch (error) {
        console.log(`   ❌ 错误: ${error.message}\n`);
      }

      // 4. 测试查询任务状态 - 方式3: GET /api/v1/image-to-video/status/${taskId}
      console.log('4. 测试查询状态 - 方式3: GET /api/v1/image-to-video/status/${taskId}');
      try {
        const statusResponse3 = await fetch(`${A2E_BASE_URL}/api/v1/image-to-video/status/${taskId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${A2E_API_TOKEN}`,
            'X-User-Id': A2E_USER_ID,
          },
        });
        console.log(`   Status: ${statusResponse3.status}`);
        const statusResult3 = await statusResponse3.text();
        console.log(`   Response: ${statusResult3.substring(0, 500)}...\n`);
      } catch (error) {
        console.log(`   ❌ 错误: ${error.message}\n`);
      }

      // 5. 测试查询任务状态 - 方式4: GET /api/v1/tasks/${taskId}
      console.log('5. 测试查询状态 - 方式4: GET /api/v1/tasks/${taskId}');
      try {
        const statusResponse4 = await fetch(`${A2E_BASE_URL}/api/v1/tasks/${taskId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${A2E_API_TOKEN}`,
            'X-User-Id': A2E_USER_ID,
          },
        });
        console.log(`   Status: ${statusResponse4.status}`);
        const statusResult4 = await statusResponse4.text();
        console.log(`   Response: ${statusResult4.substring(0, 500)}...\n`);
      } catch (error) {
        console.log(`   ❌ 错误: ${error.message}\n`);
      }

    } else {
      console.log(`   ❌ 任务创建失败: ${startResult}\n`);
    }
  } catch (error) {
    console.error(`   ❌ 错误: ${error.message}\n`);
  }
}

testA2EApi().catch(console.error);

