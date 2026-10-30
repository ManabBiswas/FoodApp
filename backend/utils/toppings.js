import { isNonEmptyString } from './validation.js';

const MAX_TOPPINGS = 10;

/**
 * Resolve requested toppings against the toppings stored on the food document.
 * Prices always come from the database, never from the request body.
 *
 * Returns `{ toppings }` on success or `{ error }` on invalid input.
 */
export const resolveToppings = (food, requestedToppings) => {
  if (requestedToppings === undefined || requestedToppings === null) {
    return { toppings: [] };
  }

  if (!Array.isArray(requestedToppings)) {
    return { error: 'selectedToppings must be an array' };
  }

  if (requestedToppings.length > MAX_TOPPINGS) {
    return { error: `A maximum of ${MAX_TOPPINGS} toppings is allowed` };
  }

  const availableToppings = Array.isArray(food.toppings) ? food.toppings : [];
  const toppings = [];

  for (const requested of requestedToppings) {
    if (!isNonEmptyString(requested?.name, 100)) {
      return { error: 'Each topping must include a name' };
    }

    const available = availableToppings.find(
      (topping) => topping.name === requested.name.trim()
    );

    if (!available) {
      return {
        error: `Topping "${requested.name}" is not available for ${food.name}`,
      };
    }

    toppings.push({
      name: available.name,
      price: Number(available.price) || 0,
    });
  }

  return { toppings };
};

export default resolveToppings;
