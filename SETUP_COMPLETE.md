# FoodApp Setup Complete

FoodApp is connected with environment configuration and an improved API architecture.

## Improvements

### 1. Environment Variables (`.env`)

```
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000
EXPO_PUBLIC_API_TIMEOUT=30000
EXPO_PUBLIC_ENABLE_LOGGING=false
```

Change the API URL by editing `.env`, then restart Expo (`Ctrl+C`, then `npx expo start`). No code changes needed.

### 2. Enhanced API Client (`services/apiClient.js`)

- 30-second timeout handling
- Clear error messages
- Development request and response logging
- Centralized fetch logic
- Token management

### 3. Cleaner API Service (`services/api.js`)

- Consistent error handling
- Services: auth, food, cart, order, user, address, wallet

### 4. Home Page (`app/(tabs)/Index.tsx`)

- Fetches food items from the backend
- Displays the logged-in user's name
- Loading state while fetching
- Empty state when no foods exist
- Refresh button to reload the menu
- Food cards with images and prices

## How to Run

Step 1 : start the backend:
```bash
cd backend
npm run dev
```

Expected output:
```
Server running on port 5000 in development mode
MongoDB Connected Successfully
```

Step 2 : start the frontend in a new terminal:
```bash
npx expo start
```

Step 3 : open the app:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan the QR code with Expo Go

## Testing

### Test Login

1. Open the app and go to Sign In
2. Email: `test2817@example.com`
3. Password: `password123`
4. Tap Sign In

Expected:
- Console shows the API base URL
- Console shows the login request and response
- Alert: "Login successful!"
- Redirect to Home
- Greeting: "Hey [Your Name]!"

### Test Home Page

After logging in:
- Personalized greeting
- Offer cards
- Menu items section
- Loading indicator, then empty state if no foods exist

### Test Account Creation

1. Go to Sign Up
2. Fill in all fields
3. Tap Create Account

Expected:
- Account created
- Auto-login
- Redirect to Home

## Console Output

App start:
```
API Base URL: http://10.0.2.2:5000/api
API Timeout: 30000 ms
```

Login:
```
POST http://10.0.2.2:5000/api/auth/login
Request body: { email: 'test2817@example.com' }
Response [200]: { status: 'success', data: {...} }
```

Home page:
```
GET http://10.0.2.2:5000/api/foods
Response [200]: { status: 'success', count: 0, data: [] }
```

## Configuration by Device

### Android emulator (current)
```
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000
```
Already configured. Reload the app.

### iOS simulator
```
EXPO_PUBLIC_API_URL=http://localhost:5000
```
Edit `.env`, save, and restart Expo.

### Physical device
1. Find your computer's IP:
  ```powershell
  ipconfig
  # Look for IPv4, e.g., 192.168.1.100
  ```
2. Update `.env`:
  ```
  EXPO_PUBLIC_API_URL=http://192.168.1.100:5000
  ```
3. Restart Expo:
  ```bash
  # Press Ctrl+C, then
  npx expo start
  ```
4. Check the firewall: allow Node.js, keep both devices on the same WiFi

## API Status Check

Run in PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET
```

Expected:
```json
{ "status": "success", "message": "Server is running" }
```

## Troubleshooting

**"Network request failed"**
1. Confirm the backend runs on port 5000
2. Verify `.env` has the correct URL:
  - Android emulator: `http://10.0.2.2:5000`
  - iOS simulator: `http://localhost:5000`
  - Physical device: `http://YOUR_IP:5000`
3. Restart Expo after changing `.env`
4. Confirm the console shows the correct API URL

**"Request timeout"**
- The backend may be slow or not responding
- Check the backend terminal for errors
- Restart the backend: `cd backend && npm run dev`

**No foods showing**
- The database has no food items yet
- You see "No food items available yet"
- Add foods through an admin account or manual database entry

**Cannot log in**
- Create an account first, or use the test account: `test2817@example.com` / `password123`
- Check backend logs for error details

## Project Structure

```
FoodApp/
â”œâ”€â”€ .env            # Environment config
â”œâ”€â”€ .env.example        # Template
â”œâ”€â”€ services/
â”‚  â”œâ”€â”€ config.js        # Uses .env
â”‚  â”œâ”€â”€ apiClient.js      # HTTP client with timeout
â”‚  â””â”€â”€ api.js         # All API methods
â”œâ”€â”€ app/
â”‚  â”œâ”€â”€ (auth)/
â”‚  â”‚  â”œâ”€â”€ Signin.tsx     # Connected to API
â”‚  â”‚  â””â”€â”€ Signup.tsx     # Connected to API
â”‚  â””â”€â”€ (tabs)/
â”‚    â”œâ”€â”€ Index.tsx      # Fetches foods
â”‚    â”œâ”€â”€ Search.tsx     # TODO
â”‚    â”œâ”€â”€ Cart.tsx      # TODO
â”‚    â””â”€â”€ Profile.tsx     # TODO
â””â”€â”€ backend/          # Running on port 5000
```

## Next Steps

Immediate:
1. Add food items (admin panel or manual database entry)
2. Search page : connect to the food search API
3. Cart page : connect to the cart API
4. Profile page : fetch real user data
5. Food details page : create a separate screen

Future:
- Add to cart functionality
- Order placement
- Order history
- Address management
- Payment integration
- Push notifications
- Image upload for foods

## Key Files

`.env` : change the API URL here:
```
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000
```

`services/config.js` : reads environment variables:
```javascript
const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL}/api`;
```

`services/apiClient.js` : HTTP client with timeout and logging:
```javascript
await fetchWithTimeout(url, options);
```

`services/api.js` : all API methods:
```javascript
await authService.login(email, password);
await foodService.getAll();
```

`app/(tabs)/Index.tsx` : home page with food list:
```javascript
const response = await foodService.getAll();
setFoods(response.data);
```

## Success Checklist

Before testing:
- Backend running: `Server running on port 5000`
- MongoDB connected: `MongoDB Connected Successfully`
- `.env` exists with the correct API URL
- Expo running: `npx expo start`
- Console shows the API base URL
- Log in with the test account
- Home page shows the personalized greeting
- Home page shows the Menu Items section

## Quick Commands

```bash
# Backend
cd backend
npm run dev

# Frontend
npx expo start
# Press 'r' to reload
# Press 'Shift + r' to clear cache and reload

# Test API
Invoke-RestMethod -Uri "http://localhost:5000/api/health"

# Check environment
# Console should show:
# API Base URL: http://10.0.2.2:5000/api
```

You are set. Start the backend, start the frontend, log in with `test2817@example.com` / `password123`, and see your name on the home page.

