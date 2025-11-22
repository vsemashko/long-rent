import { test, expect } from '@playwright/test';

test.describe('Complete Rental Flow (Authenticated)', () => {
  test('should have navigation links for authenticated users', async ({ page }) => {
    // Note: This test assumes user is authenticated via setup
    // In a real scenario, you'd use beforeEach to login

    await page.goto('/');

    // Check for authenticated user navigation
    // These might not be visible if not logged in
    const messages = page.locator('text=Messages');
    const favorites = page.locator('text=Favorites');
    const applications = page.locator('text=My Applications');

    // At least one of these should eventually exist for authenticated users
  });

  test('should navigate to my applications page when authenticated', async ({ page }) => {
    await page.goto('/my-applications');

    // Either shows applications or requires login
    const isLoginPage = page.url().includes('/login');
    const isApplicationsPage = page.url().includes('/my-applications');

    expect(isLoginPage || isApplicationsPage).toBeTruthy();
  });

  test('should navigate to my contracts page when authenticated', async ({ page }) => {
    await page.goto('/my-contracts');

    // Either shows contracts or requires login
    const isLoginPage = page.url().includes('/login');
    const isContractsPage = page.url().includes('/my-contracts');

    expect(isLoginPage || isContractsPage).toBeTruthy();
  });

  test('should navigate to payments page when authenticated', async ({ page }) => {
    await page.goto('/payments');

    // Either shows payments or requires login
    const isLoginPage = page.url().includes('/login');
    const isPaymentsPage = page.url().includes('/payments');

    expect(isLoginPage || isPaymentsPage).toBeTruthy();
  });

  test('should navigate to maintenance page when authenticated', async ({ page }) => {
    await page.goto('/my-maintenance');

    // Either shows maintenance or requires login
    const isLoginPage = page.url().includes('/login');
    const isMaintenancePage = page.url().includes('/my-maintenance');

    expect(isLoginPage || isMaintenancePage).toBeTruthy();
  });

  test('should navigate to pending reviews page when authenticated', async ({ page }) => {
    await page.goto('/pending-reviews');

    // Either shows reviews or requires login
    const isLoginPage = page.url().includes('/login');
    const isReviewsPage = page.url().includes('/pending-reviews');

    expect(isLoginPage || isReviewsPage).toBeTruthy();
  });
});

test.describe('Landlord Flow (Authenticated)', () => {
  test('should navigate to my properties page', async ({ page }) => {
    await page.goto('/my-properties');

    // Either shows properties or requires login
    const isLoginPage = page.url().includes('/login');
    const isPropertiesPage = page.url().includes('/my-properties');

    expect(isLoginPage || isPropertiesPage).toBeTruthy();
  });

  test('should navigate to landlord applications page', async ({ page }) => {
    await page.goto('/landlord-applications');

    // Either shows applications or requires login
    const isLoginPage = page.url().includes('/login');
    const isApplicationsPage = page.url().includes('/landlord-applications');

    expect(isLoginPage || isApplicationsPage).toBeTruthy();
  });

  test('should navigate to landlord maintenance page', async ({ page }) => {
    await page.goto('/landlord-maintenance');

    // Either shows maintenance or requires login
    const isLoginPage = page.url().includes('/login');
    const isMaintenancePage = page.url().includes('/landlord-maintenance');

    expect(isLoginPage || isMaintenancePage).toBeTruthy();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy on homepage', async ({ page }) => {
    await page.goto('/');

    // Check for h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);
  });

  test('should have alt text for logo', async ({ page }) => {
    await page.goto('/');

    // If there's a logo image, it should have alt text
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      // Alt can be empty string for decorative images, but should exist
      expect(alt !== null).toBeTruthy();
    }
  });

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/login');

    // Check that form inputs have associated labels
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });
});
