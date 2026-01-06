import { test, expect } from '../fixtures/auth';

/**
 * Critical User Flows E2E Tests
 * 
 * Tests the most important user journeys:
 * 1. Login flow
 * 2. Template selection and video generation
 * 3. Task polling and result display
 * 4. Works gallery
 * 5. Payment flow (coins purchase)
 */

test.describe('Critical User Flows', () => {
  test('should load home page with templates', async ({ page }) => {
    await page.goto('/');
    
    // Wait for templates to load
    await page.waitForSelector('[class*="cards-grid"]', { timeout: 10000 });
    
    // Verify templates are displayed
    const templates = await page.locator('[class*="cards-grid"] > div').count();
    expect(templates).toBeGreaterThan(0);
    
    // Verify header is present
    await expect(page.locator('header')).toBeVisible();
    
    // Verify bottom navigation is present
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should navigate to create page', async ({ page }) => {
    await page.goto('/');
    
    // Click on a template
    const firstTemplate = page.locator('[class*="cards-grid"] > div').first();
    await firstTemplate.click();
    
    // Should navigate to create page with template parameter
    await page.waitForURL(/\/create\?template=/);
    
    // Verify create page elements
    await expect(page.locator('h1:has-text("Create Video")')).toBeVisible({ timeout: 5000 });
  });

  test('should display login page when not authenticated', async ({ page }) => {
    // Clear auth state
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.goto('/create');
    
    // Should redirect to login
    await page.waitForURL(/\/login/);
    await expect(page.locator('h1, h2')).toContainText(/login|sign in/i);
  });

  test('should display profile page when authenticated', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile');
    
    // Verify profile elements
    await expect(authenticatedPage.locator('text=My Plan')).toBeVisible();
    await expect(authenticatedPage.locator('text=My Coins')).toBeVisible();
  });

  test('should navigate to coins purchase page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/coins');
    
    // Verify coin packages are displayed
    await expect(authenticatedPage.locator('text=Buy Coins')).toBeVisible();
    
    // Verify packages list
    const packages = await authenticatedPage.locator('[class*="glass-card"]').count();
    expect(packages).toBeGreaterThan(0);
  });

  test('should navigate to subscribe page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/subscribe');
    
    // Verify subscription plans
    await expect(authenticatedPage.locator('text=Subscribe')).toBeVisible();
    
    // Verify plan cards
    const plans = await authenticatedPage.locator('[class*="rounded-3xl"]').count();
    expect(plans).toBeGreaterThan(0);
  });

  test('should display my works page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/my-works');
    
    // Verify works page elements
    await expect(authenticatedPage.locator('h1:has-text("My Works")')).toBeVisible();
    
    // Verify filter tabs
    await expect(authenticatedPage.locator('text=All')).toBeVisible();
    await expect(authenticatedPage.locator('text=Videos')).toBeVisible();
    await expect(authenticatedPage.locator('text=Images')).toBeVisible();
  });

  test('should navigate through feature tabs', async ({ page }) => {
    await page.goto('/');
    
    // Click on different feature tabs
    const tabs = ['Remove', 'Chat Edit', 'AI Image', 'Face Swap', 'Dress Up'];
    
    for (const tab of tabs) {
      const tabButton = page.locator(`text=${tab}`).first();
      if (await tabButton.isVisible()) {
        await tabButton.click();
        await page.waitForTimeout(500); // Wait for navigation
      }
    }
  });

  test('should handle route aliases correctly', async ({ page }) => {
    // Test route aliases
    const aliases = [
      { from: '/makeover', to: '/face-swap' },
      { from: '/history', to: '/my-works' },
      { from: '/setting', to: '/settings' },
      { from: '/pricing', to: '/coins' },
    ];
    
    for (const alias of aliases) {
      await page.goto(alias.from);
      await page.waitForURL(new RegExp(alias.to));
    }
  });
});

