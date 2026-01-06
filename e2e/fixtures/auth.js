import { test as base } from '@playwright/test';

/**
 * Auth fixtures for E2E tests
 * Provides authenticated page context
 */
export const test = base.extend({
  authenticatedPage: async ({ page, baseURL }, use) => {
    // Mock login or use test credentials
    // For now, we'll navigate to login and handle it
    await page.goto('/login');
    
    // Wait for login page to load
    await page.waitForSelector('input[type="email"], button:has-text("Google")');
    
    // Note: In real tests, you'd need to handle actual login
    // For now, we'll assume user is logged in via localStorage mock
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
    
    await use(page);
  },
});

export { expect } from '@playwright/test';

