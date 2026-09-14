/**
 * Thin wrappers around the Juice Shop REST API.
 *
 * Keeping the endpoints and payload shapes here means a test reads as the
 * scenario it describes, and an API change is fixed in exactly one place.
 */

const LOGIN_ENDPOINT = '/rest/user/login';
const CARDS_ENDPOINT = '/api/Cards';

/**
 * Authenticates over the API and returns the bearer token.
 *
 * Logging in through the API rather than the UI keeps API tests independent of
 * the front end: a broken login form should not fail a cards API test.
 *
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {{email: string, password: string}} credentials
 * @returns {Promise<string>} JWT for the Authorization header
 */
export async function loginViaApi(request, credentials) {
  const response = await request.post(LOGIN_ENDPOINT, {
    data: { email: credentials.email, password: credentials.password },
  });

  if (!response.ok()) {
    throw new Error(
      `API login failed for ${credentials.email}: ` +
        `${response.status()} ${await response.text()}`,
    );
  }

  const body = await response.json();
  return body.authentication.token;
}

/**
 * Builds the Authorization header used by every authenticated endpoint.
 */
export function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

/**
 * Adds a payment card for the authenticated user.
 *
 * The API expects numbers, while the UI and our test data carry strings, so the
 * conversion lives here instead of being repeated in every test.
 *
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} token
 * @param {{name: string, number: string, expiryMonth: string, expiryYear: string}} card
 */
export function addCard(request, token, card) {
  return request.post(CARDS_ENDPOINT, {
    headers: authHeaders(token),
    data: {
      fullName: card.name,
      cardNum: Number(card.number),
      expMonth: Number(card.expiryMonth),
      expYear: Number(card.expiryYear),
    },
  });
}

/**
 * Returns every card saved against the authenticated user.
 */
export function getCards(request, token) {
  return request.get(CARDS_ENDPOINT, { headers: authHeaders(token) });
}
