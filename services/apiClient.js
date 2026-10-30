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
        try {
          console.log('📦 Request body:', JSON.parse(options.body));
        } catch {
          console.log('📦 Request body (raw):', options.body);
        }
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

      const rawBody = await response.text();
      let data = null;

      if (rawBody) {
        try {
          data = JSON.parse(rawBody);
        } catch {
          // Non-JSON responses (proxy errors, empty gateway pages) should not
          // surface as a confusing JSON parse crash.
          data = { message: rawBody.slice(0, 200) };
        }
      }

      if (ENABLE_LOGGING) {
        console.log(`✅ Response [${response.status}]:`, data);
      }

      if (!response.ok) {
        const requestError = new Error(
          data?.message || `HTTP ${response.status}: ${response.statusText}`
        );
        requestError.status = response.status;
        throw requestError;
      }

      return data ?? {};
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (ENABLE_LOGGING) {
        console.error('❌ API Error:', message);
      }

      // `Network request failed` is React Native; `Failed to fetch` and
      // `Load failed` are the browser equivalents.
      if (
        message === 'Network request failed' ||
        message === 'Failed to fetch' ||
        message === 'Load failed' ||
        /networkerror/i.test(message)
      ) {
        throw new Error(
          `Unable to reach the API at ${this.baseURL}. Check that the backend is running and reachable from this device.`
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
