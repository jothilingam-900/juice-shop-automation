import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage.js';
import { PaymentPage } from '../../pages/PaymentPage.js';
import { buildUniqueCard } from '../../utils/card-factory.js';
import newUser from '../../test-data/new-user.json' with { type: 'json' };

test.describe('My Payment Options', () => {
  let paymentPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(newUser.email, newUser.password);

    paymentPage = new PaymentPage(page);
  });

  test('a card added from the home screen is saved to the account', async () => {
    const card = buildUniqueCard();

    await paymentPage.navigateFromHomeScreen();
    await paymentPage.openAddNewCardForm();
    await paymentPage.addCard(card);

    // The snackbar proves the application acknowledged the save, rather than
    // only that the form was submitted.
    await expect(paymentPage.cardSavedMessage(card.number)).toBeVisible();

    // And the card is actually listed against the account.
    await expect(paymentPage.savedCardRow(card.number, card.name)).toBeVisible();
  });
});