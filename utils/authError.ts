type HttpError = Error & { status?: number };

/**
 * True when a request failed because the session token is missing, expired, or
 * revoked. 403 responses are deliberately excluded: they mean the user is
 * signed in but lacks permission, so the session must be kept.
 */
export const isUnauthorizedError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;

  if ((error as HttpError).status === 401) return true;

  const message = error.message.toLowerCase();
  return (
    message.includes('token expired') ||
    message.includes('token failed') ||
    message.includes('jwt') ||
    message.includes('no token') ||
    message.includes('unauthorized')
  );
};
