import API_BASE_URL, { getAuthHeaders } from './config';

// Auth Service
export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user
  getMe: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get user data');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(token)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Logout failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
};

// Food Service
export const foodService = {
  // Get all food items
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}/food${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch food items');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Get food by ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/food/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch food item');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Get food by category
  getByCategory: async (category) => {
    try {
      const response = await fetch(`${API_BASE_URL}/food/category/${category}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch food items');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
};

// Cart Service
export const cartService = {
  // Get user cart
  getCart: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch cart');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Add item to cart
  addItem: async (token, foodId, quantity = 1, selectedToppings = []) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ foodId, quantity, selectedToppings })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add item to cart');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Update cart item
  updateItem: async (token, itemId, quantity) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/update/${itemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ quantity })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update cart item');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Remove item from cart
  removeItem: async (token, itemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove item from cart');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Clear cart
  clearCart: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/clear`, {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to clear cart');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
};

// Order Service
export const orderService = {
  // Create order
  createOrder: async (token, orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Get user orders
  getMyOrders: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (token, orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch order');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (token, orderId, cancelReason) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ cancelReason })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel order');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
};

// User Service
export const userService = {
  // Get user profile
  getProfile: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Update profile
  updateProfile: async (token, profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Get favorites
  getFavorites: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/favorites`, {
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch favorites');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Toggle favorite
  toggleFavorite: async (token, foodId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/favorites/${foodId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update favorites');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
};

// Address Service
export const addressService = {
  // Get all addresses
  getAll: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/address`, {
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch addresses');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Create address
  create: async (token, addressData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/address`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(addressData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create address');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Update address
  update: async (token, addressId, addressData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/address/${addressId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(addressData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update address');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Delete address
  delete: async (token, addressId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/address/${addressId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete address');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
};
