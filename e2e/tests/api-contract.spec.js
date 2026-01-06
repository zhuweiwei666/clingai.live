import { test, expect } from '@playwright/test';

/**
 * API Contract Tests
 * 
 * Verify API endpoints match benchmark response formats
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

test.describe('API Contract Tests', () => {
  test('GET /api/settings/get should return correct format', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/settings/get`);
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // Verify response format
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('settings');
    expect(data.data.settings).toHaveProperty('coinPackages');
    expect(data.data.settings).toHaveProperty('subscriptionPlans');
  });

  test('GET /api/order/packages should return correct format', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/order/packages`);
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // Verify response format
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('packages');
    expect(Array.isArray(data.data.packages)).toBeTruthy();
    
    // Verify package structure
    if (data.data.packages.length > 0) {
      const pkg = data.data.packages[0];
      expect(pkg).toHaveProperty('id');
      expect(pkg).toHaveProperty('coins');
      expect(pkg).toHaveProperty('price');
    }
  });

  test('GET /api/order/plans should return correct format', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/order/plans`);
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // Verify response format
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('plans');
    expect(Array.isArray(data.data.plans)).toBeTruthy();
    
    // Verify plan structure
    if (data.data.plans.length > 0) {
      const plan = data.data.plans[0];
      expect(plan).toHaveProperty('id');
      expect(plan).toHaveProperty('name');
      expect(plan).toHaveProperty('price');
    }
  });

  test('GET /api/health should return correct format', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/health`);
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // Verify response format
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('status', 'ok');
  });

  test('POST /api/generate/* should return error when not authenticated', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/generate/photo2video`, {
      data: {
        imageUrl: 'https://example.com/image.jpg',
        templateId: '1',
      },
    });
    
    expect(response.status()).toBe(401);
    const data = await response.json();
    
    // Verify error format
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error');
  });

  test('Error responses should follow standard format', async ({ request }) => {
    // Test 404 error
    const response = await request.get(`${API_BASE_URL}/nonexistent`);
    
    expect(response.status()).toBe(404);
    const data = await response.json();
    
    // Verify error format
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error');
  });
});

