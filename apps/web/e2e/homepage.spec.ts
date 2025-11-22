import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the homepage with correct branding', async ({ page }) => {
    await page.goto('/');

    // Check for main heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('HomeMore');

    // Check for tagline
    await expect(page.locator('text=More than renting')).toBeVisible();

    // Check for tenant and landlord sections
    await expect(page.locator('text=For Tenants')).toBeVisible();
    await expect(page.locator('text=For Landlords')).toBeVisible();

    // Check development status message
    await expect(
      page.locator('text=Platform under development')
    ).toBeVisible();
  });

  test('should have proper page title and meta', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/HomeMore/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that content is still visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=For Tenants')).toBeVisible();
  });
});
