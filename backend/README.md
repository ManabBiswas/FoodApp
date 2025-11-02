# Food Delivery App - Backend API

Complete REST API for the Food Delivery mobile application built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization** with JWT
- **User Management** - Registration, Login, Profile
- **Food Management** - CRUD operations with filters
- **Cart System** - Add, update, remove items
- **Order Management** - Create, track, cancel orders
- **Address Management** - Multiple delivery addresses
- **Favorites** - Save favorite food items
- **Role-based Access Control** - User and Admin roles
- **Security** - Helmet, Rate Limiting, CORS
- **Error Handling** - Centralized error handler
- **Data Validation** - Input validation on all routes

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/foodapp
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:8081
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

### 5. Run the server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
GET    /api/auth/me             - Get current user (Protected)
POST   /api/auth/logout         - Logout user (Protected)
```

### Users
```
GET    /api/users/profile       - Get user profile (Protected)
PUT    /api/users/profile       - Update profile (Protected)
GET    /api/users/favorites     - Get favorites (Protected)
PUT    /api/users/favorites/:id - Add/Remove favorite (Protected)
```

### Food Items
```
GET    /api/food                - Get all food items
GET    /api/food/:id            - Get food by ID
POST   /api/food                - Create food (Admin)
PUT    /api/food/:id            - Update food (Admin)
DELETE /api/food/:id            - Delete food (Admin)
GET    /api/food/category/:cat  - Get by category
```

**Query Parameters for GET /api/food:**
- `category` - Filter by category
- `search` - Search in name/description
- `isVegetarian` - Filter vegetarian items
- `maxPrice` - Maximum price
- `minRating` - Minimum rating

### Cart
```
GET    /api/cart                - Get user cart (Protected)
POST   /api/cart/add            - Add item to cart (Protected)
PUT    /api/cart/update/:id     - Update cart item (Protected)
DELETE /api/cart/remove/:id     - Remove item (Protected)
DELETE /api/cart/clear           - Clear cart (Protected)
```

### Orders
```
POST   /api/orders              - Create order (Protected)
GET    /api/orders/my-orders    - Get user orders (Protected)
GET    /api/orders/:id          - Get order by ID (Protected)
PUT    /api/orders/:id/cancel   - Cancel order (Protected)
PUT    /api/orders/:id/status   - Update status (Admin)
GET    /api/orders              - Get all orders (Admin)
```

### Addresses
```
GET    /api/address             - Get all addresses (Protected)
POST   /api/address             - Create address (Protected)
PUT    /api/address/:id         - Update address (Protected)
DELETE /api/address/:id         - Delete address (Protected)
```

## 🔐 Authentication

Protected routes require JWT token in the Authorization header:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

## 📊 Database Models

### User Model
- name, email, phone, password
- role (user/admin)
- membershipType (regular/gold/platinum)
- favoriteItems
- timestamps

### Food Model
- name, description, price, category
- image, images[]
- rating, numReviews
- nutritionInfo, toppings
- isVegetarian, isVegan, spicyLevel
- timestamps

### Order Model
- user, orderItems[]
- deliveryAddress, paymentMethod
- orderStatus, paymentStatus
- prices (items, tax, delivery, total)
- timestamps

### Cart Model
- user, items[]
- totalItems, subtotal
- timestamps

### Address Model
- user, label, street, city, state
- zipCode, country, coordinates
- isDefault
- timestamps

## 🧪 Testing API

### Using cURL
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","phone":"1234567890","password":"123456"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'

# Get Food Items
curl http://localhost:5000/api/food
```

### Using Postman
Import the API endpoints or create a new collection with the above routes.

## 📱 Connecting React Native App

Update your React Native app's API configuration:

```javascript
// api/config.js
const API_URL = 'http://YOUR_IP_ADDRESS:5000/api';

// For Android Emulator
const API_URL = 'http://10.0.2.2:5000/api';

// For iOS Simulator  
const API_URL = 'http://localhost:5000/api';
```

## 🔧 Project Structure

```
backend/
├── controllers/          # Request handlers
│   ├── auth.controller.js
│   ├── food.controller.js
│   ├── order.controller.js
├── models/              # Database models
│   ├── User.model.js
│   ├── Food.model.js
│   ├── Order.model.js
│   ├── Cart.model.js
│   └── Address.model.js
├── routes/              # API routes
│   ├── auth.routes.js
│   ├── food.routes.js
│   ├── order.routes.js
│   ├── cart.routes.js
│   ├── address.routes.js
│   └── user.routes.js
├── middleware/          # Custom middleware
│   ├── auth.js
│   └── errorHandler.js
├── .env.example
├── server.js           # Entry point
└── package.json
```

## 🚀 Deployment

### Deploy to Heroku
```bash
heroku create foodapp-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

### Deploy to Railway/Render
1. Connect your GitHub repository
2. Set environment variables
3. Deploy

## 📝 Notes

- Change JWT_SECRET in production
- Use MongoDB Atlas for production database
- Enable HTTPS in production
- Implement rate limiting per user
- Add logging service (Winston, Morgan)
- Add API documentation (Swagger)
---
<!-- ## 🤝 Contributing

Manab Biswas

## 📄 License

ISC -->
