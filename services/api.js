import apiClient from './apiClient';

// ==================== AUTH SERVICE ====================
export const authService = {
  register: async (userData) => {
    return apiClient.post('/auth/register', userData);
  },

  login: async (email, password) => {
    return apiClient.post('/auth/login', { email, password });
  },

  getMe: async (token) => {
    return apiClient.get('/auth/me', token);
  },

  logout: async (token) => {
    return apiClient.post('/auth/logout', {}, token);
  }
};

// ==================== FOOD SERVICE ====================
export const foodService = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/foods?${queryString}` : '/foods';
    return apiClient.get(endpoint);
  },

  getById: async (id) => {
    return apiClient.get(`/foods/${id}`);
  },

  getByCategory: async (category) => {
    return apiClient.get(`/foods/category/${category}`);
  },

  search: async (searchTerm) => {
    return apiClient.get(`/foods?search=${encodeURIComponent(searchTerm)}`);
  },

  create: async (foodData, token) => {
    return apiClient.post('/foods', foodData, token);
  },

  update: async (id, foodData, token) => {
    return apiClient.put(`/foods/${id}`, foodData, token);
  },

  delete: async (id, token) => {
    return apiClient.delete(`/foods/${id}`, token);
  }
};

// ==================== CART SERVICE ====================
export const cartService = {
  getCart: async (token) => {
    return apiClient.get('/cart', token);
  },

  addItem: async (itemData, token) => {
    return apiClient.post('/cart/items', itemData, token);
  },

  updateItem: async (itemId, updates, token) => {
    return apiClient.put(`/cart/items/${itemId}`, updates, token);
  },

  removeItem: async (itemId, token) => {
    return apiClient.delete(`/cart/items/${itemId}`, token);
  },

  clearCart: async (token) => {
    return apiClient.delete('/cart', token);
  }
};

// ==================== ORDER SERVICE ====================
export const orderService = {
  createOrder: async (orderData, token) => {
    return apiClient.post('/orders', orderData, token);
  },

  getMyOrders: async (token) => {
    return apiClient.get('/orders', token);
  },

  getOrderById: async (orderId, token) => {
    return apiClient.get(`/orders/${orderId}`, token);
  },

  cancelOrder: async (orderId, token) => {
    return apiClient.put(`/orders/${orderId}/cancel`, {}, token);
  }
};

// ==================== USER SERVICE ====================
export const userService = {
  getProfile: async (token) => {
    return apiClient.get('/users/profile', token);
  },

  updateProfile: async (profileData, token) => {
    return apiClient.put('/users/profile', profileData, token);
  },

  getFavorites: async (token) => {
    return apiClient.get('/users/favorites', token);
  },

  toggleFavorite: async (foodId, token) => {
    return apiClient.post(`/users/favorites/${foodId}`, {}, token);
  }
};

// ==================== ADDRESS SERVICE ====================
export const addressService = {
  getAll: async (token) => {
    return apiClient.get('/addresses', token);
  },

  create: async (addressData, token) => {
    return apiClient.post('/addresses', addressData, token);
  },

  update: async (addressId, addressData, token) => {
    return apiClient.put(`/addresses/${addressId}`, addressData, token);
  },

  delete: async (addressId, token) => {
    return apiClient.delete(`/addresses/${addressId}`, token);
  }
};
