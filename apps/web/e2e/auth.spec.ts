import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login and register buttons when not authenticated', async ({ page }) => {
    await page.goto('/');

    // Check for login and sign up buttons
    await expect(page.locator('text=Login')).toBeVisible();
    await expect(page.locator('text=Sign Up')).toBeVisible();
  });

  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/');

    await page.click('text=Sign Up');
    await page.waitForURL('**/register');

    // Check registration form elements
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('text=Create Account')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    await page.click('text=Login');
    await page.waitForURL('**/login');

    // Check login form elements
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('should show validation errors for empty login form', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Check for validation errors (form should prevent submission)
    await expect(page).toHaveURL('**/login');
  });

  test('should have links between login and register pages', async ({ page }) => {
    await page.goto('/login');

    // Check for register link
    await expect(page.locator('text=Sign up')).toBeVisible();

    // Navigate to register
    await page.click('text=Sign up');
    await page.waitForURL('**/register');

    // Check for login link
    await expect(page.locator('text=Sign in')).toBeVisible();
  });
});
