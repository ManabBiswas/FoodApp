import API_BASE_URL, { API_TIMEOUT, ENABLE_LOGGING } from './config';

/**
 * Enhanced API Client with timeout, error handling, and logging
 */
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = API_TIMEOUT;
  }

  /**
   * Create fetch request with timeout
   */
  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your network connection.');
      }
      throw error;
    }
  }

  /**
   * Make API request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    if (ENABLE_LOGGING) {
      console.log(`📡 ${options.method || 'GET'} ${url}`);
      if (options.body) {
        console.log('📦 Request body:', JSON.parse(options.body));
      }
    }

    try {
      const response = await this.fetchWithTimeout(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      const data = await response.json();

      if (ENABLE_LOGGING) {
        console.log(`✅ Response [${response.status}]:`, data);
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      if (ENABLE_LOGGING) {
        console.error('❌ API Error:', error.message);
      }

      // Enhance error messages for common issues
      if (error.message === 'Network request failed') {
        throw new Error(
          'Unable to connect to server. Please check:\n' +
          '1. Backend server is running on port 5000\n' +
          '2. Your network connection\n' +
          '3. API URL in .env file is correct'
        );
      }

      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, token = null) {
    return this.request(endpoint, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  }

  /**
   * POST request
   */
  async post(endpoint, body, token = null) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, body, token = null) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, token = null) {
    return this.request(endpoint, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  }
}

export default new ApiClient();
