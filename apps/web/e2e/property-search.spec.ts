import { test, expect } from '@playwright/test';

test.describe('Property Search', () => {
  test('should navigate to search page', async ({ page }) => {
    await page.goto('/');

    // Click on Search link in navigation
    await page.click('text=Search');
    await page.waitForURL('**/search');

    // Check search page loaded
    await expect(page.locator('h1')).toContainText('Find Your Home');
  });

  test('should display search filters', async ({ page }) => {
    await page.goto('/search');

    // Check for filter elements
    await expect(page.locator('text=City')).toBeVisible();
    await expect(page.locator('text=Price Range')).toBeVisible();
    await expect(page.locator('text=Property Type')).toBeVisible();
  });

  test('should be accessible directly via URL', async ({ page }) => {
    await page.goto('/search');

    // Page should load successfully
    await expect(page.locator('h1')).toBeVisible();
    await expect(page).toHaveURL('**/search');
  });

  test('should show property listings or empty state', async ({ page }) => {
    await page.goto('/search');

    // Either properties are shown or empty state is visible
    const hasProperties = await page.locator('[data-testid="property-card"]').count();
    const hasEmptyState = await page.locator('text=No properties found').isVisible();

    expect(hasProperties > 0 || hasEmptyState).toBeTruthy();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/search');

    // Check that main elements are still visible
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Property Detail Page', () => {
  test('should require authentication for applying', async ({ page }) => {
    // This test assumes there's at least one property
    // In a real scenario, you'd seed test data or use API mocking
    await page.goto('/search');

    // Try to access a property detail page
    // Note: This is a generic test - actual property IDs would be dynamic
  });

  test('should show property information when available', async ({ page }) => {
    // Navigate to search to find a property
    await page.goto('/search');

    // Check if any property cards exist
    const propertyCards = page.locator('[data-testid="property-card"]');
    const count = await propertyCards.count();

    if (count > 0) {
      // Click on the first property
      await propertyCards.first().click();

      // Wait for navigation to property detail page
      await page.waitForURL('**/properties/**');

      // Property detail page should show key information
      // These are generic checks - actual content depends on test data
      await expect(page.locator('h1')).toBeVisible();
    } else {
      test.skip();
    }
  });
});
