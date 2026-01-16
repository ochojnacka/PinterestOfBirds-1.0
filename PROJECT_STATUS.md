# Project Status - Pinterest of Birds

## ✅ Completed Components

### Frontend Components

- ✅ **App.jsx** - Main application with routing and state management
- ✅ **Header.jsx** - Header with ribbon image
- ✅ **Navbar.jsx** - Navigation bar with active states
- ✅ **Footer.jsx** - Footer with team credits
- ✅ **BirdCard.jsx** - Individual bird card component
- ✅ **BirdGrid.jsx** - Grid layout for displaying birds
- ✅ **UploadForm.jsx** - Form for uploading new birds
- ✅ **LogInBtn.jsx** - Login button component
- ✅ **LogInWndw.jsx** - Login/signup window with Cognito integration

### Backend

- ✅ **server.js** - Express server with all API endpoints
- ✅ **middleware/auth.js** - JWT authentication middleware
- ✅ **aws/dynamodb.js** - DynamoDB helper functions
- ✅ **aws/s3.js** - S3 file upload functions
- ✅ **aws/cognito.js** - Cognito authentication functions

### Configuration

- ✅ **Tailwind CSS** - Configured with custom colors and fonts
- ✅ **ESLint** - Configured for both frontend and backend
- ✅ **Vite** - Configured with proxy to backend
- ✅ **React Router** - Set up for navigation

## 📋 Required Assets

The following SVG/image files need to be added to `frontend/src/assets/`:

1. **outlineHeart.svg** - Outline heart icon for favorites (used in BirdCard)
2. **fullHeart.svg** - Filled heart icon for favorites (used in BirdCard)
3. **everything.svg** - Ribbon/banner image (used in Header)

## 🔧 Configuration Checklist

### Backend (.env file)

- [ ] Copy `backend/env.example` to `backend/.env`
- [ ] Fill in AWS credentials:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION` (default: eu-north-1)
- [ ] Set DynamoDB table names:
  - `DYNAMODB_BIRDS` (default: Birds)
  - `DYNAMODB_FAVORITEBIRDS` (default: FavoriteBirds)
- [ ] Set S3 bucket name:
  - `S3_BUCKET_NAME` (default: pinterest-of-birds)
- [ ] Set Cognito configuration:
  - `COGNITO_USER_POOL_ID`
  - `COGNITO_CLIENT_ID`
- [ ] Set server port:
  - `PORT` (default: 3000, but frontend proxy expects 5000)

### Frontend

- [ ] No additional configuration needed (uses relative API paths)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# Backend
cd backend
cp env.example .env
# Edit .env with your AWS credentials
```

### 3. Start Development Servers

```bash
# Terminal 1 - Backend (port 5000 or as configured in .env)
cd backend
npm run dev

# Terminal 2 - Frontend (port 3000)
cd frontend
npm run dev
```

## 📝 API Endpoints

### Public Endpoints

- `GET /api/birds` - Get all birds
- `GET /api/health` - Health check
- `GET /api/test` - Test endpoint

### Protected Endpoints (require authentication)

- `POST /api/birds` - Create a new bird
- `POST /api/uploads` - Upload image to S3
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites/:birdId` - Add to favorites
- `DELETE /api/favorites/:birdId` - Remove from favorites

### Authentication Endpoints

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/confirm` - Confirm email with code
- `POST /api/auth/signin` - Sign in and get tokens

## ⚠️ Important Notes

1. **Port Configuration**:

   - Frontend dev server runs on port 3000
   - Backend should run on port 5000 (or update `vite.config.js` proxy)
   - If backend PORT=3000 in .env, change frontend proxy or use different port

2. **AWS Services Required**:

   - DynamoDB tables: `Birds` and `FavoriteBirds` (or as configured)
   - S3 bucket with public-read ACL enabled
   - Cognito User Pool with App Client configured

3. **Missing Assets**:

   - Add SVG files to `frontend/src/assets/` before running
   - Or update imports in components to use placeholder images

4. **Cognito Setup**:
   - Ensure USER_PASSWORD_AUTH flow is enabled in Cognito App Client
   - Email verification should be enabled for signup flow

## 🐛 Known Issues / TODO

- [ ] Add placeholder SVG files if assets are missing
- [ ] Verify S3 bucket CORS configuration for image uploads
- [ ] Add error boundaries for better error handling
- [ ] Add loading states for better UX
- [ ] Consider adding token refresh logic

## 📦 Project Structure

```
pinterestOfBirds/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env (create from env.example)
│   ├── middleware/
│   │   └── auth.js
│   ├── aws/
│   │   ├── dynamodb.js
│   │   ├── s3.js
│   │   └── cognito.js
│   └── routes/
│       └── api.js
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── App.css
│   │   ├── assets/ (add SVG files here)
│   │   └── components/
│   │       ├── Header.jsx
│   │       ├── Navbar.jsx
│   │       ├── Footer.jsx
│   │       ├── BirdCard.jsx
│   │       ├── BirdGrid.jsx
│   │       ├── UploadForm.jsx
│   │       ├── LogInBtn.jsx
│   │       └── LogInWndw.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```
