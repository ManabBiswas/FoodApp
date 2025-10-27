// API Configuration
// Change this to your computer's IP address when testing on physical device
// For Android Emulator use: http://10.0.2.2:5000/api
// For iOS Simulator use: http://localhost:5000/api
// For physical device use: http://YOUR_IP_ADDRESS:5000/api

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api'  // Change to your IP for physical device
  : 'https://your-production-api.com/api';

export default API_BASE_URL;

export const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Bearer ${token}` })
});
