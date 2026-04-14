export interface AuthServiceType {
  register: (userData: any) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  getMe: (token: string) => Promise<any>;
  logout: (token: string) => Promise<any>;
}

export interface FoodServiceType {
  getAll: (params?: Record<string, any>) => Promise<any>;
  getById: (id: string) => Promise<any>;
  getByCategory: (category: string) => Promise<any>;
  search: (searchTerm: string) => Promise<any>;
  create: (foodData: any, token: string) => Promise<any>;
  update: (id: string, foodData: any, token: string) => Promise<any>;
  delete: (id: string, token: string) => Promise<any>;
}

export interface CartServiceType {
  getCart: (token: string) => Promise<any>;
  addItem: (itemData: any, token: string) => Promise<any>;
  updateItem: (itemId: string, updates: any, token: string) => Promise<any>;
  removeItem: (itemId: string, token: string) => Promise<any>;
  clearCart: (token: string) => Promise<any>;
}

export interface OrderServiceType {
  createOrder: (orderData: any, token: string) => Promise<any>;
  getMyOrders: (token: string) => Promise<any>;
  getOrderById: (orderId: string, token: string) => Promise<any>;
  cancelOrder: (orderId: string, token: string) => Promise<any>;
}

export interface UserServiceType {
  getProfile: (token: string) => Promise<any>;
  updateProfile: (profileData: any, token: string) => Promise<any>;
  getFavorites: (token: string) => Promise<any>;
  toggleFavorite: (foodId: string, token: string) => Promise<any>;
}

export interface AddressServiceType {
  getAll: (token: string) => Promise<any>;
  create: (addressData: any, token: string) => Promise<any>;
  update: (addressId: string, addressData: any, token: string) => Promise<any>;
  delete: (addressId: string, token: string) => Promise<any>;
}

export const authService: AuthServiceType;
export const foodService: FoodServiceType;
export const cartService: CartServiceType;
export const orderService: OrderServiceType;
export const userService: UserServiceType;
export const addressService: AddressServiceType;
