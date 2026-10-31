# FoodApp

FoodApp is a food delivery application built with React Native (Expo), Node.js, Express, and MongoDB. It includes user authentication, cart management, order placement, saved addresses, and a wallet for mock top-ups and payments.

## Features

- Sign up and sign in with JWT authentication
- Browse food items with categories
- Add, update, and remove cart items
- Place orders with cash, card, UPI, or wallet payment
- Save multiple delivery addresses and set a default
- Auto-fill checkout with the default address
- Track wallet balance and transaction history
- Demo top-up for wallet (up to â‚¹50,000 per top-up)
- Wallet orders debit; cancellations refund once

## Tech Stack

Frontend:
- React Native with Expo SDK 58
- Expo Router for file-based navigation
- NativeWind (Tailwind CSS for React Native)
- TypeScript with `@/` path aliases
- Quicksand font family
- AsyncStorage for local persistence

Backend:
- Node.js with Express (ES modules)
- MongoDB with Mongoose
- JWT authentication with bcrypt password hashing
- Helmet, CORS, rate limiting, compression

## Project Structure

```
FoodApp/
â”œâ”€â”€ app/             # Expo Router screens
â”‚  â”œâ”€â”€ (auth)/          # Sign in and sign up
â”‚  â”œâ”€â”€ (tabs)/          # Home, Search, Cart, Profile
â”‚  â”œâ”€â”€ addresses.tsx       # Delivery addresses (AddressContext)
â”‚  â”œâ”€â”€ checkout.tsx       # Checkout (default address, wallet pay)
â”‚  â”œâ”€â”€ wallet.tsx        # Wallet balance, top-up, history
â”‚  â”œâ”€â”€ index.tsx         # Entry point with auth check
â”‚  â””â”€â”€ _layout.tsx        # Root layout with providers
â”œâ”€â”€ components/          # Reusable UI components
â”‚  â”œâ”€â”€ CartButton.tsx
â”‚  â”œâ”€â”€ CustomInput.tsx
â”‚  â””â”€â”€ Skeleton.tsx       # Shared pulse-loop skeletons
â”œâ”€â”€ contexts/           # React Context state
â”‚  â”œâ”€â”€ AuthContext.tsx      # Token, user, login/logout
â”‚  â”œâ”€â”€ CartContext.tsx      # Cart items, add/remove/clear
â”‚  â”œâ”€â”€ AddressContext.tsx    # Saved addresses, default selection
â”‚  â””â”€â”€ WalletContext.tsx     # Balance, transactions, top-up
â”œâ”€â”€ services/           # API layer
â”‚  â”œâ”€â”€ api.js          # Service methods
â”‚  â”œâ”€â”€ apiClient.js       # HTTP client with timeout
â”‚  â”œâ”€â”€ api.d.ts         # TypeScript declarations
â”‚  â””â”€â”€ config.js         # API configuration
â”œâ”€â”€ constants/          # Images, colors, data
â”œâ”€â”€ assets/            # Fonts, icons, images
â”œâ”€â”€ backend/           # Node.js API
â”‚  â”œâ”€â”€ controllers/       # Auth, food, order logic
â”‚  â”œâ”€â”€ models/          # Mongoose schemas (User, Food, Order, Cart, Address)
â”‚  â”œâ”€â”€ routes/          # API route definitions
â”‚  â”œâ”€â”€ middleware/        # Auth guard, error handler
â”‚  â””â”€â”€ server.js         # Express server entry
â”œâ”€â”€ .env             # Frontend environment variables
â”œâ”€â”€ backend/.env         # Backend environment variables
â”œâ”€â”€ package.json         # Frontend dependencies
â”œâ”€â”€ tailwind.config.js      # Tailwind configuration
â””â”€â”€ tsconfig.json         # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 24 LTS (Expo SDK 58 does not support Node 25)
- MongoDB (local or MongoDB Atlas)
- npm
- Expo CLI
- Android Studio or Xcode for emulators, or Expo Go on a physical device

### Install

1. Clone the repository:
  ```
  git clone https://github.com/ManabBiswas/FoodApp.git
  cd FoodApp
  ```

2. Install frontend dependencies:
  ```
  npm install
  ```

3. Install backend dependencies:
  ```
  cd backend
  npm install
  cd ..
  ```

### Configure Environment Variables

Frontend `.env`:
```
EXPO_PUBLIC_API_TIMEOUT=30000
EXPO_PUBLIC_ENABLE_LOGGING=false
```

Leave `EXPO_PUBLIC_API_URL` unset in development. The app derives the backend host from the Expo dev server. Set it explicitly for production builds.

Backend `backend/.env`:
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

### Run

1. Start MongoDB, then start the backend:
  ```
  cd backend
  npm run dev
  ```

2. Start the frontend in a new terminal:
  ```
  npx expo start
  ```

3. Press `a` for Android emulator, `i` for iOS simulator, or scan the QR code with Expo Go.

## API Endpoints

Authentication:
- POST `/api/auth/register` : register (no auth)
- POST `/api/auth/login` : login (no auth)
- GET `/api/auth/me` : current user (auth required)
- POST `/api/auth/logout` : logout (auth required)

Foods:
- GET `/api/foods` : list foods
- GET `/api/foods/:id` : single food
- GET `/api/foods/category/:category` : foods by category

Cart:
- GET `/api/cart` : your cart
- POST `/api/cart/items` : add item
- PUT `/api/cart/items/:itemId` : update quantity
- DELETE `/api/cart/items/:itemId` : remove item
- DELETE `/api/cart` : clear cart

Orders:
- GET `/api/orders/my-orders` : your orders
- GET `/api/orders/:id` : single order
- POST `/api/orders` : create order
- PUT `/api/orders/:id/cancel` : cancel order

User:
- GET `/api/users/profile` : your profile
- PUT `/api/users/profile` : update profile
- GET `/api/users/favorites` : your favorites
- PUT `/api/users/favorites/:foodId` : toggle favorite

Addresses:
- GET `/api/addresses` : your addresses
- POST `/api/addresses` : create address
- PUT `/api/addresses/:id` : update address
- DELETE `/api/addresses/:id` : delete address

Wallet:
- GET `/api/wallet` : balance and transactions
- POST `/api/wallet/topup` : demo credit (1 to â‚¹50,000)

## Testing

Health check:
```
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET
```

Test suites (run from `C:\Users\Manab Biswas\AppData\Local\Temp\opencode`):
- `api-test.ps1` : 58 backend checks, 0 failures
- `wallet-address-test.mjs` : 44 wallet and address UI checks
- `auth-flow-test.mjs` : 24 authentication checks
- `frontend-smoke.mjs` : 20 UI smoke checks
- `skeleton-test.mjs` : 15 skeleton checks

Type check and lint:
```
npx tsc --noEmit
npm run lint
```

Both pass with no output.

## Troubleshooting

**Frontend cannot reach the backend**
- Confirm the backend is running on port 5000.
- In development, leave `EXPO_PUBLIC_API_URL` unset. The app reads the host from the Expo dev server, so emulators and physical devices work without editing `.env`.
- For production or a remote backend, set `EXPO_PUBLIC_API_URL` explicitly.
- Restart Expo: press `Ctrl+C`, then run `npx expo start --clear`.

**MongoDB connection error**
- Start MongoDB locally or point `MONGODB_URI` at MongoDB Atlas.

**401 or session expired**
- The app clears local auth on a 401 and redirects to sign in. Log in again.

**Wallets shows zero after top-up**
- Top-up is a demo credit. Confirm the amount is between â‚¹0.01 and â‚¹50,000.

## Author

Manab Biswas : [@ManabBiswas](https://github.com/ManabBiswas)

## Support

Email manabbiswas108108@gmail.com or open an issue in the repository.

