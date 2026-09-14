import { expect } from '@playwright/test';

// The consent banners are optional, so we only wait a short time for them.
const BANNER_TIMEOUT_MS = 5_000;

/**
 * Page-object for the Juice Shop login screen.
 *
 * Locator strategy: the login form exposes real,
 * developer-authored ids (#email, #password, #loginButton),
 * so those are stable and preferred.
 * The consent banners are matched by their accessible label,
 * not by position.
 */
export class LoginPage {
  constructor(page) {
    this.page = page;

    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#loginButton');

    this.welcomeBannerCloseButton =
      page.locator('button[aria-label="Close Welcome Banner"]');

    this.cookieDismissButton =
      page.locator('a.cc-btn.cc-dismiss');

    this.accountMenuButton =
      page.locator('#navbarAccount');

    this.logoutButton =
      page.locator('#navbarLogoutButton');
  }

  async goto() {
    await this.page.goto('/#/login');
    await this.dismissOverlays();
    await expect(this.emailInput).toBeVisible();
  }

  async dismissOverlays() {
    for (const banner of [
      this.welcomeBannerCloseButton,
      this.cookieDismissButton
    ]) {
      const appeared = await banner
        .waitFor({
          state: 'visible',
          timeout: BANNER_TIMEOUT_MS
        })
        .then(() => true)
        .catch(() => false);

      if (appeared) {
        await banner.click();
        await banner.waitFor({ state: 'hidden' });
      }
    }
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();

   
    await expect(this.accountMenuButton).toBeVisible();
  }
}
