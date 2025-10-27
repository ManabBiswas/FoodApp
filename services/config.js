// API Configuration using environment variables
// Update .env file to change the API URL based on your setup

const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000'}/api`;
const API_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000');
const ENABLE_LOGGING = process.env.EXPO_PUBLIC_ENABLE_LOGGING === 'true';

// Log the API URL in development mode
if (__DEV__ && ENABLE_LOGGING) {
  console.log('🌐 API Base URL:', API_BASE_URL);
  console.log('⏱️  API Timeout:', API_TIMEOUT, 'ms');
}

export default API_BASE_URL;
export { API_TIMEOUT, ENABLE_LOGGING };

export const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Bearer ${token}` })
});
