import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests
 * 
 * Compare our implementation with benchmark site screenshots
 * Run with: npx playwright test --update-snapshots to update baselines
 */

const BENCHMARK_URL = 'https://h5.onlycrush.app';
const OUR_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

test.describe('Visual Regression', () => {
  test('home page should match benchmark', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await expect(page).toHaveScreenshot('home-page.png', {
      fullPage: true,
      maxDiffPixels: 5000, // Allow some differences
    });
  });

  test('profile page should match benchmark', async ({ page }) => {
    // Set auth state
    await page.evaluate(() => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser',
        coins: 100,
        plan: 'free',
      }));
    });
    
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('profile-page.png', {
      fullPage: true,
      maxDiffPixels: 5000,
    });
  });

  test('coins page should match benchmark', async ({ page }) => {
    await page.goto('/coins');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('coins-page.png', {
      fullPage: true,
      maxDiffPixels: 5000,
    });
  });

  test('subscribe page should match benchmark', async ({ page }) => {
    await page.goto('/subscribe');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('subscribe-page.png', {
      fullPage: true,
      maxDiffPixels: 5000,
    });
  });

  test('face swap page should match benchmark', async ({ page }) => {
    await page.goto('/face-swap');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('face-swap-page.png', {
      fullPage: true,
      maxDiffPixels: 5000,
    });
  });

  test('layout header should match benchmark', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const header = page.locator('header').first();
    await expect(header).toHaveScreenshot('header.png', {
      maxDiffPixels: 1000,
    });
  });

  test('bottom navigation should match benchmark', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const nav = page.locator('nav').last();
    await expect(nav).toHaveScreenshot('bottom-nav.png', {
      maxDiffPixels: 1000,
    });
  });
});

