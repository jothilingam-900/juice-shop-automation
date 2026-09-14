import { expect } from '@playwright/test';

/**
 * Page object for "My Payment Options" (Juice Shop saved payment methods).
 *
 * Locator strategy
 * -----------------
 * The card form is built with Angular Material, which assigns generated ids
 * such as #mat-input-3 / #mat-input-4. Those numbers depend on how many
 * Material controls happen to be rendered on the page, so they shift as soon
 * as the page changes - they are NOT safe to automate against.
 *
 * Instead every field is addressed through its visible label with
 * getByLabel(), and the navigation entries through their aria-label. Both are
 * user-facing contracts: if they change, the user experience changed too, and
 * the test SHOULD fail.
 */
export class PaymentPage {
  constructor(page) {
    this.page = page;

    // Navigation: home screen -> account menu -> orders & payment -> payments
    this.accountMenuButton = page.locator('#navbarAccount');
    this.ordersAndPaymentMenuButton = page.getByRole('menuitem', {
      name: 'Show Orders and Payment Menu',
    });
    this.paymentOptionsMenuItem = page.getByRole('menuitem', {
      name: 'Go to saved payment methods page',
    });

    // "Add new card" collapsible section
    this.addNewCardPanel = page.locator('mat-expansion-panel-header');

    // Card form fields - addressed by their visible labels
    this.nameInput = page.getByLabel('Name', { exact: true });
    this.cardNumberInput = page.getByLabel('Card Number');
    this.expiryMonthSelect = page.getByLabel('Expiry Month');
    this.expiryYearSelect = page.getByLabel('Expiry Year');
    this.submitButton = page.locator('#submitButton');

    // Results
    this.savedCardsTable = page.locator('mat-table');
  }

  /**
   * The application confirms a save with a snackbar quoting the last four
   * digits. Matching on that text - instead of on the generic snackbar class -
   * keeps the assertion specific: other snackbars (for example the language
   * notice) use the same container.
   */
  cardSavedMessage(cardNumber) {
    return this.page.getByText(`card ending with ${cardNumber.slice(-4)}`);
  }

  /**
   * Walks the real user journey from the home screen to My Payment Options,
   * rather than deep-linking to the route. The task asks for navigation from
   * the home screen, and this also exercises the menu itself.
   */
  async navigateFromHomeScreen() {
    await this.page.goto('/#/');

    await this.accountMenuButton.click();
    await this.ordersAndPaymentMenuButton.click();
    await this.paymentOptionsMenuItem.click();

    await expect(this.page).toHaveURL(/saved-payment-methods/);
    // The page fetches the existing cards and re-renders once they arrive,
    // which detaches the expansion panel mid-click. Waiting for the network to
    // settle first makes the following interaction deterministic.
    await this.page.waitForLoadState('networkidle');
    await expect(this.addNewCardPanel).toBeVisible();
  }

  async openAddNewCardForm() {
    await this.addNewCardPanel.click();
    await expect(this.addNewCardPanel).toHaveAttribute('aria-expanded', 'true');
    await expect(this.nameInput).toBeVisible();
  }

  /**
   * @param {{name: string, number: string, expiryMonth: string, expiryYear: string}} card
   */
  async addCard(card) {
    await this.nameInput.fill(card.name);
    await this.cardNumberInput.fill(card.number);
    await this.expiryMonthSelect.selectOption(card.expiryMonth);
    await this.expiryYearSelect.selectOption(card.expiryYear);

    await this.submitButton.click();
  }

  savedCardRow(cardNumber, cardHolderName) {
    const lastFourDigits = cardNumber.slice(-4);

    return this.savedCardsTable
      .locator('mat-row')
      .filter({ hasText: lastFourDigits })
      .filter({ hasText: cardHolderName });
  }
}