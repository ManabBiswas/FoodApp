import Constants from 'expo-constants';
import { Platform } from 'react-native';

// The Expo dev server knows which host the app bundle was loaded from.
// Reusing that host for the API avoids stale hard-coded LAN IPs.
const getDevServerHost = () => {
  // On web there is no Expo manifest host, so use the page's own hostname.
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return window.location.hostname;
    }
    return null;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return null;

  const host = hostUri.split(':')[0];
  if (!host) return null;

  // Android emulators cannot reach the host machine through localhost.
  if (Platform.OS === 'android' && (host === 'localhost' || host === '127.0.0.1')) {
    return '10.0.2.2';
  }

  return host;
};

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
const devServerHost = __DEV__ ? getDevServerHost() : null;
const fallbackUrl = devServerHost
  ? `http://${devServerHost}:5000`
  : Platform.OS === 'android'
    ? 'http://10.0.2.2:5000'
    : 'http://localhost:5000';

const API_BASE_URL = `${configuredUrl || fallbackUrl}/api`;
const API_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000', 10);
const ENABLE_LOGGING = process.env.EXPO_PUBLIC_ENABLE_LOGGING === 'true';

if (__DEV__ && ENABLE_LOGGING) {
  console.log('API Base URL:', API_BASE_URL);
  console.log('API Timeout:', API_TIMEOUT, 'ms');
}

export default API_BASE_URL;
export { API_TIMEOUT, ENABLE_LOGGING };

export const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token && { Authorization: `Bearer ${token}` }),
});
