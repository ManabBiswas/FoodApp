export const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;

export const isObjectId = (value) =>
  typeof value === 'string' && OBJECT_ID_PATTERN.test(value);

export const isNonEmptyString = (value, maxLength = 500) =>
  typeof value === 'string' &&
  value.trim().length > 0 &&
  value.trim().length <= maxLength;

export const isValidEmail = (value) =>
  typeof value === 'string' &&
  value.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isValidPhone = (value) =>
  typeof value === 'string' && /^[0-9]{10,15}$/.test(value.trim());

/**
 * Accepts a number or numeric string and returns an integer within bounds.
 * Returns null when the value is not a valid integer.
 */
export const parsePositiveInt = (value, max = 99) => {
  const number =
    typeof value === 'string' && value.trim() !== '' ? Number(value) : value;

  if (!Number.isInteger(number) || number < 1 || number > max) {
    return null;
  }

  return number;
};

/**
 * Returns a finite number or null.
 */
export const parseFiniteNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export const roundCurrency = (value) => Math.round(value * 100) / 100;

/**
 * Copy only allowed keys from a request body. Prevents mass assignment of
 * fields such as `user`, `role`, or `_id`.
 */
export const pickFields = (source, allowedFields) => {
  const result = {};

  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return result;
  }

  for (const field of allowedFields) {
    if (source[field] !== undefined) {
      result[field] = source[field];
    }
  }

  return result;
};

export const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export const isBoolean = (value) => typeof value === 'boolean';
