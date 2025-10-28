# 🍔 FoodApp - Full Stack Food Delivery Application

A modern, full-stack food delivery application built with React Native (Expo), Node.js, Express, and MongoDB. Features include user authentication, real-time cart management, order tracking, and a beautiful UI with NativeWind (Tailwind CSS for React Native).

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)

---

## 📱 Features

### User Features
- 🔐 **Authentication** - Secure sign up/sign in with JWT
- 🏠 **Home Dashboard** - Personalized greeting and offers
- 🍕 **Food Menu** - Browse food items with categories
- 🛒 **Shopping Cart** - Add, update, remove items
- 📦 **Order Management** - Place and track orders
- ⭐ **Favorites** - Save favorite food items
- 👤 **User Profile** - Manage account details
- 📍 **Address Management** - Multiple delivery addresses
- 💰 **Wallet** - Track balance and transactions

### Technical Features
- ✅ RESTful API architecture
- ✅ JWT-based authentication
- ✅ AsyncStorage for data persistence
- ✅ Environment-based configuration
- ✅ Error handling & logging
- ✅ Form validation
- ✅ Loading states & animations
- ✅ Responsive design
- ✅ Type-safe with TypeScript

---

## 🛠️ Tech Stack

### Frontend
- **React Native** - Mobile framework
- **Expo** - Development platform
- **Expo Router** - File-based navigation
- **NativeWind** - Tailwind CSS for React Native
- **TypeScript** - Type safety
- **AsyncStorage** - Local storage
- **Custom Fonts** - Quicksand font family

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **dotenv** - Environment variables

### Security & Middleware
- **Helmet** - Security headers
- **CORS** - Cross-origin requests
- **Express Rate Limit** - API rate limiting
- **Compression** - Response compression
- **Morgan** - Request logging

---

## 📁 Project Structure

```
FoodApp/
├── app/                          # React Native screens
│   ├── (auth)/                   # Authentication screens
│   │   ├── Signin.tsx           # Sign in page
│   │   └── Signup.tsx           # Sign up page
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── Index.tsx            # Home page
│   │   ├── Search.tsx           # Search page
│   │   ├── Cart.tsx             # Shopping cart
│   │   └── Profile.tsx          # User profile
│   ├── index.tsx                # Entry point with auth check
│   └── _layout.tsx              # Root layout
│
├── components/                   # Reusable components
│   ├── CustomInput.tsx          # Custom input field
│   └── CartButton.tsx           # Cart icon with badge
│
├── services/                     # API integration
│   ├── apiClient.js             # HTTP client with timeout
│   ├── api.js                   # API service methods
│   └── config.js                # API configuration
│
├── constants/                    # App constants
│   └── index.ts                 # Images, colors, data
│
├── assets/                       # Static assets
│   ├── fonts/                   # Custom fonts
│   ├── icons/                   # App icons
│   └── images/                  # Images
│
├── backend/                      # Node.js backend
│   ├── models/                  # Mongoose models
│   │   ├── User.model.js        # User schema
│   │   ├── Food.model.js        # Food schema
│   │   ├── Order.model.js       # Order schema
│   │   ├── Cart.model.js        # Cart schema
│   │   └── Address.model.js     # Address schema
│   │
│   ├── controllers/             # Business logic
│   │   ├── auth.controller.js   # Authentication
│   │   ├── food.controller.js   # Food operations
│   │   ├── order.controller.js  # Order operations
│   │   └── user.controller.js   # User operations
│   │
│   ├── routes/                  # API routes
│   │   ├── auth.routes.js       # Auth endpoints
│   │   ├── food.routes.js       # Food endpoints
│   │   ├── order.routes.js      # Order endpoints
│   │   ├── cart.routes.js       # Cart endpoints
│   │   └── address.routes.js    # Address endpoints
│   │
│   ├── middleware/              # Custom middleware
│   │   ├── auth.js              # JWT verification
│   │   └── errorHandler.js      # Error handling
│   │
│   ├── server.js                # Express server
│   ├── package.json             # Backend dependencies
│   └── .env                     # Environment variables
│
├── .env                         # Frontend environment
├── package.json                 # Frontend dependencies
├── tailwind.config.js           # Tailwind configuration
├── tsconfig.json                # TypeScript config
└── README.md                    # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn
- Expo CLI
- Android Studio / Xcode (for emulators)
- Expo Go app (for physical device testing)

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/ManabBiswas/FoodApp.git
cd FoodApp
```

#### 2. Install Frontend Dependencies
```bash
npm install
```

#### 3. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

#### 4. Configure Environment Variables

**Frontend (.env):**
```env
# For Android Emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000

# For iOS Simulator
# EXPO_PUBLIC_API_URL=http://localhost:5000

# For Physical Device (replace with your computer's IP)
# EXPO_PUBLIC_API_URL=http://192.168.1.100:5000

EXPO_PUBLIC_API_TIMEOUT=30000
EXPO_PUBLIC_ENABLE_LOGGING=true
```

**Backend (backend/.env):**
```env
NODE_ENV=development
PORT=5000

# MongoDB (local)
MONGODB_URI=mongodb://localhost:27017/foodapp

# Or MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodapp

JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

FRONTEND_URL=http://localhost:8081
```

---

## 🏃 Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```

**Expected output:**
```
🚀 Server running on port 5000 in development mode
✅ MongoDB Connected Successfully
```

### Start Frontend (Expo)
In a new terminal:
```bash
npx expo start
```

Then choose your platform:
- Press `a` - Android emulator
- Press `i` - iOS simulator
- Scan QR code - Physical device (Expo Go app)

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

### Foods
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/foods` | Get all foods | No |
| GET | `/api/foods/:id` | Get food by ID | No |
| GET | `/api/foods/category/:category` | Get foods by category | No |
| POST | `/api/foods` | Create food (admin) | Yes |
| PUT | `/api/foods/:id` | Update food (admin) | Yes |
| DELETE | `/api/foods/:id` | Delete food (admin) | Yes |

### Cart
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cart` | Get user's cart | Yes |
| POST | `/api/cart/items` | Add item to cart | Yes |
| PUT | `/api/cart/items/:itemId` | Update cart item | Yes |
| DELETE | `/api/cart/items/:itemId` | Remove cart item | Yes |
| DELETE | `/api/cart` | Clear cart | Yes |

### Orders
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/orders` | Get user's orders | Yes |
| GET | `/api/orders/:id` | Get order by ID | Yes |
| POST | `/api/orders` | Create order | Yes |
| PUT | `/api/orders/:id/cancel` | Cancel order | Yes |

### User Profile
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Get profile | Yes |
| PUT | `/api/users/profile` | Update profile | Yes |
| GET | `/api/users/favorites` | Get favorites | Yes |
| POST | `/api/users/favorites/:foodId` | Toggle favorite | Yes |

### Addresses
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/addresses` | Get all addresses | Yes |
| POST | `/api/addresses` | Create address | Yes |
| PUT | `/api/addresses/:id` | Update address | Yes |
| DELETE | `/api/addresses/:id` | Delete address | Yes |

---

## 🧪 Testing

### Test Backend API (PowerShell)
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:5000/api/health"

# Register user
$body = @{
    name = "Test User"
    email = "test@example.com"
    phone = "1234567890"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
    -Method POST -Body $body -ContentType "application/json"

# Login
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST -Body $loginBody -ContentType "application/json"
```

### Test Credentials
```
Email: test2817@example.com
Password: password123
```

---

## 🎨 App Screens

### Authentication
- **Sign Up** - Create new account with validation
- **Sign In** - Login with email/password
- **Auto-login** - Token-based session persistence

### Main App
- **Home** - Personalized dashboard with offers and menu
- **Search** - Find food items
- **Cart** - Review and manage cart items
- **Profile** - Account settings, orders, favorites, wallet

---

## 🔐 Security Features

- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Protected API routes
- ✅ Rate limiting (100 req/15min)
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ Input validation
- ✅ Error handling middleware

---

## 🐛 Troubleshooting

### Network Request Failed
**Issue:** Frontend can't connect to backend

**Solutions:**
1. Check backend is running on port 5000
2. Update `.env` with correct API URL:
   - Android Emulator: `http://10.0.2.2:5000`
   - iOS Simulator: `http://localhost:5000`
   - Physical Device: `http://YOUR_COMPUTER_IP:5000`
3. Restart Expo: `Ctrl+C` then `npx expo start`
4. Check firewall allows Node.js connections

### MongoDB Connection Error
**Solutions:**
1. Ensure MongoDB is installed and running
2. Check `MONGODB_URI` in backend/.env
3. Use MongoDB Atlas for cloud database

### Route Not Found (404)
**Solutions:**
1. Verify backend is running
2. Check API routes in `backend/server.js`
3. Ensure routes use plural form: `/api/foods`, `/api/addresses`

---

## 📚 Additional Documentation

- [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) - Complete setup guide
<!-- - [TESTING.md](./TESTING.md) - API testing guide -->
<!-- - [NETWORK_TROUBLESHOOTING.md](./NETWORK_TROUBLESHOOTING.md) - Network issues -->
<!-- - [INTEGRATION_COMPLETE.md](./INTEGRATION_COMPLETE.md) - Integration summary -->

---

## 🛣️ Roadmap

### Phase 1 (Completed) ✅
- [x] User authentication
- [x] Home page with offers
- [x] Backend API setup
- [x] MongoDB integration
- [x] Profile page
- [x] AsyncStorage integration

### Phase 2 (In Progress)
- [ ] Food listing and details
- [ ] Search functionality
- [ ] Cart operations
- [ ] Order placement
- [ ] Address management

### Phase 3 (Planned)
- [ ] Payment gateway integration
- [ ] Push notifications
- [ ] Order tracking
- [ ] Reviews and ratings
- [ ] Image uploads (Cloudinary)
- [ ] Admin panel
- [ ] Analytics dashboard

---

<!-- ## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

--- -->
<!-- 
## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

--- -->

## 👨‍💻 Author

**Manab Biswas**
- GitHub: [@ManabBiswas](https://github.com/ManabBiswas)
- Repository: [FoodApp](https://github.com/ManabBiswas/FoodApp)

---

## 🙏 Acknowledgments

- [Expo](https://expo.dev) - React Native development platform
- [NativeWind](https://www.nativewind.dev/) - Tailwind CSS for React Native
- [MongoDB](https://www.mongodb.com/) - Database
- [Express](https://expressjs.com/) - Backend framework

---

## 📞 Support

For support, email manab.biswas@example.com or create an issue in the repository.

---

**Happy Coding! 🚀**
