# FoodApp Backend API

REST API for the FoodApp food delivery application. Built with Node.js, Express (ES modules), and MongoDB.

## Features

- JWT authentication and authorization
- User registration, login, profile, and logout
- Food catalog with category filters
- Cart: add, update, remove, clear items
- Orders: create, list, cancel, view details
- Addresses: create, update, delete, set default
- Wallet: balance, transactions, demo top-up
- Role-based access control (user and admin)
- Security: Helmet, CORS, rate limiting, compression
- Centralized error handling
- Input validation on all routes

## Prerequisites

- Node.js 24 LTS
- MongoDB 4.4 or higher
- npm

## Install

1. Enter the backend directory:
  ```
  cd backend
  ```

2. Install dependencies:
  ```
  npm install
  ```

3. Create `backend/.env`:
  ```
  NODE_ENV=development
  PORT=5000
  MONGODB_URI=mongodb://localhost:27017/foodapp
  JWT_SECRET=replace_with_a_long_random_secret
  JWT_EXPIRE=7d
  FRONTEND_URL=http://localhost:8081
  ```

  Generate the JWT secret with:
  ```
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```

4. Start MongoDB, then run the server:
  ```
  # Development with auto-restart
  npm run dev

  # Production
  npm start
  ```

  The server runs on `http://localhost:5000`.

## API Endpoints

Authentication:
```
POST  /api/auth/register    Register new user
POST  /api/auth/login     Log in user
GET  /api/auth/me       Get current user (protected)
POST  /api/auth/logout     Log out user (protected)
```

Users:
```
GET  /api/users/profile    Get your profile (protected)
PUT  /api/users/profile    Update profile (protected)
GET  /api/users/favorites   List favorites (protected)
PUT  /api/users/favorites/:id Toggle favorite (protected)
```

Foods:
```
GET  /api/foods        List foods
GET  /api/foods/:id      Get food by ID
GET  /api/foods/category/:cat Foods by category
POST  /api/foods        Create food (admin, protected)
PUT  /api/foods/:id      Update food (admin, protected)
DELETE /api/foods/:id      Delete food (admin, protected)
```

Cart:
```
GET  /api/cart        Get your cart (protected)
POST  /api/cart/items     Add item (protected)
PUT  /api/cart/items/:id   Update item (protected)
DELETE /api/cart/items/:id   Remove item (protected)
DELETE /api/cart        Clear cart (protected)
```

Orders:
```
GET  /api/orders/my-orders  List your orders (protected)
GET  /api/orders/:id     Get order by ID (protected)
POST  /api/orders       Create order (protected)
PUT  /api/orders/:id/cancel  Cancel order (protected)
PUT  /api/orders/:id/status  Update order status (admin)
GET  /api/orders       List all orders (admin)
```

Addresses:
```
GET  /api/addresses      List your addresses (protected)
POST  /api/addresses      Create address (protected)
PUT  /api/addresses/:id    Update address (protected)
DELETE /api/addresses/:id    Delete address (protected)
```

Wallet:
```
GET  /api/wallet       Balance and transactions (protected)
POST  /api/wallet/topup    Demo credit â‚¹0.01â€“â‚¹50,000 (protected)
```

## Authentication

Protected routes require a JWT in the `Authorization` header:
```
headers: {
 'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

## Database Models

User: name, email, phone, hashed password, role, membership type, favorites, wallet balance and transactions (hidden by default).

Food: name, description, price, category, image, rating, toppings, vegetarian/vegan flags, spice level.

Order: user, items, delivery address, payment method, order status, payment status, prices, paid timestamp, wallet refund flag.

Cart: user, items, total items, subtotal.

Address: user, label, street, city, state, zip code, country, coordinates, default flag.

## Project Structure

```
backend/
â”œâ”€â”€ controllers/     # Request handlers
â”‚  â”œâ”€â”€ auth.controller.js
â”‚  â”œâ”€â”€ food.controller.js
â”‚  â””â”€â”€ order.controller.js
â”œâ”€â”€ models/        # Mongoose schemas
â”‚  â”œâ”€â”€ User.model.js
â”‚  â”œâ”€â”€ Food.model.js
â”‚  â”œâ”€â”€ Order.model.js
â”‚  â”œâ”€â”€ Cart.model.js
â”‚  â””â”€â”€ Address.model.js
â”œâ”€â”€ routes/        # API routes
â”‚  â”œâ”€â”€ auth.routes.js
â”‚  â”œâ”€â”€ user.routes.js
â”‚  â”œâ”€â”€ food.routes.js
â”‚  â”œâ”€â”€ order.routes.js
â”‚  â”œâ”€â”€ cart.routes.js
â”‚  â””â”€â”€ address.routes.js
â”œâ”€â”€ middleware/      # Express middleware
â”‚  â”œâ”€â”€ auth.js      # JWT verification
â”‚  â””â”€â”€ errorHandler.js  # Global error handling
â”œâ”€â”€ server.js       # Entry point
â”œâ”€â”€ .env         # Environment variables
â”œâ”€â”€ package.json     # Dependencies (type: module)
â””â”€â”€ ES_MODULES_CONVERSION.md
```

## Deployment

Set these variables before deploying:
- `NODE_ENV=production`
- `JWT_SECRET` : generate a new secure secret
- `MONGODB_URI` : use MongoDB Atlas or a managed service
- `FRONTEND_URL` : your production frontend domain
- `EXPO_PUBLIC_ENABLE_LOGGING=false` : disable frontend logging in production

Do not commit `.env` files.

