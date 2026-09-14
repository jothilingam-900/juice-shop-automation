import baseCard from '../test-data/card.json' with { type: 'json' };

/**
 * Juice Shop stores every submitted card against the user and never
 * de-duplicates them. Reusing one fixed number would make the saved-cards list
 * grow with identical rows, so an assertion like "the row for this card is
 * visible" would become ambiguous after the first run.
 *
 * Each run therefore gets its own card number: a Visa-style '4' prefix plus a
 * millisecond timestamp and two random digits, padded to the 16 digits the
 * application expects. The remaining card details come from test-data/card.json
 * so that the shape of the data stays in one place.
 *
 * @param {Partial<{name: string, number: string, expiryMonth: string, expiryYear: string}>} overrides
 */
export function buildUniqueCard(overrides = {}) {
  const randomPair = String(Math.floor(Math.random() * 100)).padStart(2, '0');
  const uniqueCardNumber = `4${Date.now()}${randomPair}`;

  return {
    ...baseCard,
    number: uniqueCardNumber,
    ...overrides,
  };
}