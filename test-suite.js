/**
 * 完整功能测试套件
 * 测试所有API端点和功能
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://173.255.193.131:3001/api';
const TEST_RESULTS = {
  passed: [],
  failed: [],
  warnings: [],
};

// 测试用户凭证（需要先注册）
let testToken = null;
let testUserId = null;

// 工具函数
async function test(name, fn) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    const result = await fn();
    if (result.success) {
      console.log(`✅ PASS: ${name}`);
      TEST_RESULTS.passed.push({ name, result });
      return result;
    } else {
      console.log(`❌ FAIL: ${name} - ${result.error || 'Unknown error'}`);
      TEST_RESULTS.failed.push({ name, error: result.error });
      return result;
    }
  } catch (error) {
    console.log(`❌ ERROR: ${name} - ${error.message}`);
    TEST_RESULTS.failed.push({ name, error: error.message });
    return { success: false, error: error.message };
  }
}

async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (testToken) {
    headers['Authorization'] = `Bearer ${testToken}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    return {
      success: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// ========== 测试用例 ==========

// 1. 健康检查
async function testHealth() {
  return test('Health Check', async () => {
    const result = await apiCall('/health');
    if (result.success && result.data.status === 'ok') {
      return { success: true, data: result.data };
    }
    return { success: false, error: 'Health check failed' };
  });
}

// 2. 存储状态检查
async function testStorageStatus() {
  return test('Storage Status', async () => {
    const result = await apiCall('/storage/status');
    if (result.success && result.data.data && result.data.data.enabled) {
      return { success: true, data: result.data.data };
    }
    return { success: false, error: 'Storage not enabled' };
  });
}

// 3. 模板API测试
async function testTemplates() {
  return test('Get Templates', async () => {
    const result = await apiCall('/templates');
    if (result.success && result.data.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: 'Failed to get templates' };
  });
}

async function testTemplateCategories() {
  return test('Get Template Categories', async () => {
    const result = await apiCall('/templates/categories');
    if (result.success && result.data.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: 'Failed to get categories' };
  });
}

// 4. 认证测试
async function testRegister() {
  return test('User Registration', async () => {
    const email = `test_${Date.now()}@test.com`;
    const result = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password: 'test123456',
        username: 'testuser',
      }),
    });
    
    if (result.success && result.data.success && result.data.token) {
      testToken = result.data.token;
      testUserId = result.data.user?.id;
      return { success: true, data: result.data };
    }
    return { success: false, error: 'Registration failed' };
  });
}

async function testLogin() {
  return test('User Login', async () => {
    const result = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123456',
      }),
    });
    
    if (result.success && result.data.success && result.data.token) {
      testToken = result.data.token;
      return { success: true, data: result.data };
    }
    return { success: false, error: 'Login failed (may need to register first)' };
  });
}

async function testGetMe() {
  return test('Get Current User', async () => {
    if (!testToken) {
      return { success: false, error: 'No token available' };
    }
    
    const result = await apiCall('/auth/me');
    if (result.success && result.data.success && result.data.user) {
      return { success: true, data: result.data };
    }
    return { success: false, error: 'Failed to get user info' };
  });
}

// 5. 用户API测试
async function testUserProfile() {
  return test('Get User Profile', async () => {
    if (!testToken) return { success: false, error: 'No token' };
    
    const result = await apiCall('/user/profile');
    if (result.success && result.data.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: 'Failed to get profile' };
  });
}

async function testUserCoins() {
  return test('Get User Coins', async () => {
    if (!testToken) return { success: false, error: 'No token' };
    
    const result = await apiCall('/user/coins');
    if (result.success && result.data.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: 'Failed to get coins' };
  });
}

async function testUserWorks() {
  return test('Get User Works', async () => {
    if (!testToken) return { success: false, error: 'No token' };
    
    const result = await apiCall('/user/works');
    if (result.success && result.data.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: 'Failed to get works' };
  });
}

// 6. 上传测试
async function testImageUpload() {
  return test('Image Upload', async () => {
    if (!testToken) return { success: false, error: 'No token' };
    
    // 创建一个简单的测试图片（1x1 PNG）
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const buffer = Buffer.from(pngBase64, 'base64');
    
    const FormData = (await import('form-data')).default;
    const form = new FormData();
    form.append('file', buffer, {
      filename: 'test.png',
      contentType: 'image/png',
    });
    
    const result = await fetch(`${BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        ...form.getHeaders(),
      },
      body: form,
    });
    
    const data = await result.json();
    if (result.ok && data.success && data.data && data.data.url) {
      return { success: true, data: data.data };
    }
    return { success: false, error: 'Upload failed' };
  });
}

// 7. 生成功能测试
async function testGeneratePhoto2Video() {
  return test('Generate Photo2Video', async () => {
    if (!testToken) return { success: false, error: 'No token' };
    
    const result = await apiCall('/generate/photo2video', {
      method: 'POST',
      body: JSON.stringify({
        sourceImage: 'https://pub-17497f33464648bdb5f47bbbdbf732e7.r2.dev/images/test.png',
        templateId: null,
        prompt: 'test prompt',
        params: {},
      }),
    });
    
    if (result.success && result.data.success && result.data.taskId) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.data?.error || 'Generation failed' };
  });
}

// 8. 订单API测试
async function testOrderPackages() {
  return test('Get Order Packages', async () => {
    const result = await apiCall('/order/packages');
    if (result.success && result.data.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: 'Failed to get packages' };
  });
}

// 9. 错误处理测试
async function testErrorHandling() {
  return test('Error Handling', async () => {
    // 测试不存在的端点
    const result = await apiCall('/nonexistent');
    if (result.status === 404 && result.data.success === false) {
      return { success: true, data: result.data };
    }
    return { success: false, error: 'Error handling not working correctly' };
  });
}

// 10. 响应格式测试
async function testResponseFormat() {
  return test('Response Format', async () => {
    const result = await apiCall('/templates');
    if (result.data && typeof result.data.success === 'boolean') {
      return { success: true, data: result.data };
    }
    return { success: false, error: 'Response format incorrect' };
  });
}

// 主测试函数
async function runAllTests() {
  console.log('========================================');
  console.log('🚀 开始完整功能测试');
  console.log('========================================\n');
  
  // 基础测试
  await testHealth();
  await testStorageStatus();
  
  // 模板测试
  await testTemplates();
  await testTemplateCategories();
  
  // 认证测试
  await testRegister();
  if (!testToken) {
    await testLogin();
  }
  if (testToken) {
    await testGetMe();
    
    // 用户功能测试
    await testUserProfile();
    await testUserCoins();
    await testUserWorks();
    
    // 上传测试
    await testImageUpload();
    
    // 生成功能测试（需要金币）
    // await testGeneratePhoto2Video();
  }
  
  // 订单测试
  await testOrderPackages();
  
  // 错误处理测试
  await testErrorHandling();
  await testResponseFormat();
  
  // 输出结果
  console.log('\n========================================');
  console.log('📊 测试结果汇总');
  console.log('========================================');
  console.log(`✅ 通过: ${TEST_RESULTS.passed.length}`);
  console.log(`❌ 失败: ${TEST_RESULTS.failed.length}`);
  console.log(`⚠️  警告: ${TEST_RESULTS.warnings.length}`);
  console.log('========================================\n');
  
  if (TEST_RESULTS.failed.length > 0) {
    console.log('失败的测试:');
    TEST_RESULTS.failed.forEach(({ name, error }) => {
      console.log(`  - ${name}: ${error}`);
    });
  }
  
  return TEST_RESULTS;
}

// 运行测试
runAllTests().then(results => {
  process.exit(results.failed.length > 0 ? 1 : 0);
}).catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});

