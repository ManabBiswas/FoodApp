export interface AuthHeaders {
  "Content-Type": string;
  Authorization?: string;
}

declare const API_BASE_URL: string;
export const API_TIMEOUT: number;
export const ENABLE_LOGGING: boolean;

export default API_BASE_URL;

export function getAuthHeaders(token?: string | null): AuthHeaders;
