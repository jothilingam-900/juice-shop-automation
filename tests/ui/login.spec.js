import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage.js';
import newUser from '../../test-data/new-user.json' with { type: 'json' };

test.describe('Authentication', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(newUser.email, newUser.password);
  });

  test('registered user lands in an authenticated session', async ({ page }) => {
    await expect(loginPage.accountMenuButton).toBeVisible();

    await loginPage.accountMenuButton.click();
    await expect(loginPage.logoutButton).toBeVisible();

    // Scoped to the profile menu item: the email also appears in the sidenav,
    // and an unscoped text match would hit both and fail Playwright strict mode.
    const profileMenuItem = page.getByRole('menuitem', { name: 'Go to user profile' });
    await expect(profileMenuItem).toContainText(newUser.email);
  });
});
