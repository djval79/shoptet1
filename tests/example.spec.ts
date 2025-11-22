import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Check if we are on the login page by looking for the Demo button
    const demoButton = page.getByRole('button', { name: 'Owner Demo' });

    if (await demoButton.isVisible()) {
        await demoButton.click();
        // Wait for the dashboard to load (e.g., check for a specific element)
        await expect(page.getByText('Dashboard', { exact: true })).toBeVisible({ timeout: 10000 });
    }
});

test('has title', async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Chat2Close/);
});

test('dashboard loads', async ({ page }) => {
    // Check for a key element on the dashboard
    await expect(page.getByText('Dashboard', { exact: true })).toBeVisible();
});

test('navigation to CRM', async ({ page }) => {
    // Click the CRM link in the sidebar
    await page.getByRole('button', { name: 'CRM' }).click();

    // Expect the URL to contain 'view=crm'
    await expect(page).toHaveURL(/.*view=crm/);

    // Expect CRM header to be visible
    await expect(page.getByText('CRM & Sales Funnel')).toBeVisible();
});

test('navigation to Settings', async ({ page }) => {
    // Set a large viewport to ensure sidebar items are visible
    await page.setViewportSize({ width: 1280, height: 1200 });

    // Click the Settings text in the sidebar (first one found)
    await page.getByText('Settings', { exact: true }).first().click();

    // Expect the URL to contain 'view=settings'
    await expect(page).toHaveURL(/.*view=settings/);

    // Expect Settings header to be visible
    await expect(page.getByText('Settings & Configuration')).toBeVisible();
});
