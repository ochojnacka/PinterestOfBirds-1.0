import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables FIRST - before importing anything that uses them
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');
console.log('Loading .env from:', envPath);
const dotenvResult = dotenv.config({ path: envPath });
if (dotenvResult.error) {
  console.warn('Warning: .env file not found or could not be loaded:', dotenvResult.error.message);
} else {
  console.log('.env file loaded successfully');
}

// NOW import modules that need environment variables
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { scanItems, putItem, queryItems, deleteItem } from './aws/dynamodb.js';
import { uploadFile } from './aws/s3.js';
import { auth } from './middleware/auth.js';
import { signUp, signIn, confirmSignUp } from './aws/cognito.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer configuration (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Frontend path
const frontendPath = path.join(__dirname, '../frontend/dist');

// Serve static files from frontend build
app.use(express.static(frontendPath));

// Request logging middleware
app.use((req, res, next) => {
  const log = `[${new Date().toISOString()}] ${req.method} ${req.path}`;
  console.log(log);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend API is working!' });
});

// --- API ENDPOINTS ---

// GET /api/birds - Get all birds
app.get('/api/birds', async (req, res, next) => {
  try {
    const tableName = process.env.DYNAMODB_BIRDS || 'Birds';
    const result = await scanItems(tableName);
    res.status(200).json(result.Items || []);
  } catch (err) {
    next(err);
  }
});

// POST /api/birds - Create a new bird
app.post('/api/birds', auth, async (req, res, next) => {
  try {
    const { name, description, imageUrl } = req.body;

    if (!name || !description || !imageUrl) {
      return res.status(400).json({ error: 'Brakujące dane: name, description, imageUrl są wymagane' });
    }

    const birdId = uuidv4();
    const item = {
      birdId,
      name,
      description,
      birdPicture: imageUrl,
      createdAt: new Date().toISOString(),
    };

    const tableName = process.env.DYNAMODB_BIRDS || 'Birds';
    await putItem(tableName, item);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/uploads - Upload image to S3
app.post('/api/uploads', auth, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Brak pliku' });
    }

    const fileKey = `${Date.now()}-${req.file.originalname}`;
    const result = await uploadFile(
      fileKey,
      req.file.buffer,
      req.file.mimetype
    );

    res.status(201).json({ success: true, imageUrl: result.Location });
  } catch (err) {
    next(err);
  }
});

// GET /api/favorites - Get user's favorite birds
app.get('/api/favorites', auth, async (req, res, next) => {
  try {
    const tableName = process.env.DYNAMODB_FAVORITEBIRDS || 'FavoriteBirds';
    const result = await queryItems(
      tableName,
      'userId = :uid',
      { ':uid': req.userId }
    );
    res.status(200).json(result.Items || []);
  } catch (err) {
    next(err);
  }
});

// POST /api/favorites/:birdId - Add bird to favorites
app.post('/api/favorites/:birdId', auth, async (req, res, next) => {
  try {
    const { birdId } = req.params;
    const tableName = process.env.DYNAMODB_FAVORITEBIRDS || 'FavoriteBirds';
    
    const item = {
      userId: req.userId,
      birdId,
      createdAt: new Date().toISOString(),
    };

    await putItem(tableName, item);
    res.status(201).json({ success: true, item });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/favorites/:birdId - Remove bird from favorites
app.delete('/api/favorites/:birdId', auth, async (req, res, next) => {
  try {
    const { birdId } = req.params;
    const tableName = process.env.DYNAMODB_FAVORITEBIRDS || 'FavoriteBirds';
    
    await deleteItem(tableName, {
      userId: req.userId,
      birdId,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

// --- COGNITO AUTH ENDPOINTS ---

// POST /api/auth/signup - Register new user
app.post('/api/auth/signup', async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Username, password, and email are required' });
    }
    const result = await signUp(username, password, email);
    res.json({ message: 'User registered successfully', userId: result.UserSub });
  } catch (err) {
    console.error('Error signing up:', err);
    res.status(500).json({ error: err.message || 'Failed to sign up' });
  }
});

// POST /api/auth/confirm - Confirm user registration
app.post('/api/auth/confirm', async (req, res, next) => {
  try {
    const { username, confirmationCode } = req.body;
    if (!username || !confirmationCode) {
      return res.status(400).json({ error: 'Username and confirmation code are required' });
    }
    await confirmSignUp(username, confirmationCode);
    res.json({ message: 'User confirmed successfully' });
  } catch (err) {
    console.error('Error confirming sign up:', err);
    res.status(500).json({ error: err.message || 'Failed to confirm sign up' });
  }
});

// POST /api/auth/signin - Sign in user
app.post('/api/auth/signin', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const result = await signIn(username, password);
    
    // Handle NEW_PASSWORD_REQUIRED challenge
    if (result.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
      return res.status(403).json({
        error: 'NEW_PASSWORD_REQUIRED',
        message: 'User must set a new password',
        session: result.Session,
      });
    }
    
    res.json({
      accessToken: result.AuthenticationResult.AccessToken,
      idToken: result.AuthenticationResult.IdToken,
      refreshToken: result.AuthenticationResult.RefreshToken,
    });
  } catch (err) {
    console.error('Error signing in:', err);
    res.status(500).json({ error: err.message || 'Failed to sign in' });
  }
});

// POST /api/auth/change-password - Handle NEW_PASSWORD_REQUIRED challenge
app.post('/api/auth/change-password', async (req, res, next) => {
  try {
    const { username, newPassword, session } = req.body;
    if (!username || !newPassword || !session) {
      return res.status(400).json({ error: 'Username, new password, and session are required' });
    }
    
    const { CognitoIdentityProviderClient, RespondToAuthChallengeCommand } = await import('@aws-sdk/client-cognito-identity-provider');
    const client = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
    
    const command = new RespondToAuthChallengeCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      Session: session,
      ChallengeResponses: {
        USERNAME: username,
        NEW_PASSWORD: newPassword,
      },
    });
    
    const result = await client.send(command);
    res.json({
      accessToken: result.AuthenticationResult.AccessToken,
      idToken: result.AuthenticationResult.IdToken,
      refreshToken: result.AuthenticationResult.RefreshToken,
      message: 'Password changed successfully',
    });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ error: err.message || 'Failed to change password' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Wystąpił błąd serwera';
  res.status(statusCode).json({ error: message });
});

// Serve frontend for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'Endpoint not found' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`AWS Region: ${process.env.AWS_REGION || 'eu-north-1'}`);
});
