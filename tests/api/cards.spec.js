import { test, expect } from '@playwright/test';
import { loginViaApi, addCard, getCards } from '../../utils/api-client.js';
import { buildUniqueCard } from '../../utils/card-factory.js';
import newUser from '../../test-data/new-user.json' with { type: 'json' };

test.describe('Cards API', () => {
  let authToken;

  test.beforeEach(async ({ request }) => {
    authToken = await loginViaApi(request, newUser);
  });

  test('POST /api/Cards saves a unique card against the account', async ({ request }) => {
    const card = buildUniqueCard();

    const response = await addCard(request, authToken, card);

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.status).toBe('success');

    // The response should echo back exactly what was sent, plus a server-side id.
    expect(body.data).toMatchObject({
      fullName: card.name,
      cardNum: Number(card.number),
      expMonth: Number(card.expiryMonth),
      expYear: Number(card.expiryYear),
    });
    expect(body.data.id).toBeGreaterThan(0);

    // Reading the card back proves it was persisted, not just accepted.
    const listResponse = await getCards(request, authToken);
    expect(listResponse.status()).toBe(200);

    const savedCards = (await listResponse.json()).data;
    const savedCard = savedCards.find((entry) => entry.id === body.data.id);

    expect(savedCard, 'the created card should be listed for the user').toBeDefined();

    // The listing endpoint masks all but the last four digits, so the full
    // number is deliberately not asserted here - only the visible suffix.
    const lastFourDigits = card.number.slice(-4);
    expect(String(savedCard.cardNum)).toContain(lastFourDigits);
    expect(String(savedCard.cardNum)).not.toBe(card.number);
  });

  test('POST /api/Cards is rejected without an auth token', async ({ request }) => {
    const card = buildUniqueCard();

    const response = await request.post('/api/Cards', {
      data: {
        fullName: card.name,
        cardNum: Number(card.number),
        expMonth: Number(card.expiryMonth),
        expYear: Number(card.expiryYear),
      },
    });

    expect(response.ok(), 'an unauthenticated request must not create a card').toBeFalsy();
  });
});
