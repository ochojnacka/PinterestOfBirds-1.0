import express from 'express';
import { putItem, getItem, scanItems } from '../aws/dynamodb.js';
import { uploadFile, getPresignedUrl, deleteFile } from '../aws/s3.js';
import { signUp, signIn, confirmSignUp } from '../aws/cognito.js';

const router = express.Router();

// DynamoDB routes
router.get('/birds', async (req, res) => {
  try {
    const tableName = process.env.DYNAMODB_BIRDS;
    const result = await scanItems(tableName);
    res.json(result.Items || []);
  } catch (error) {
    console.error('Error fetching birds:', error);
    res.status(500).json({ error: 'Failed to fetch birds' });
  }
});

router.post('/birds', async (req, res) => {
  try {
    const tableName = process.env.DYNAMODB_BIRDS;
    const item = req.body;
    await putItem(tableName, item);
    res.json({ message: 'Bird created successfully', item });
  } catch (error) {
    console.error('Error creating bird:', error);
    res.status(500).json({ error: 'Failed to create bird' });
  }
});

router.get('/birds/:id', async (req, res) => {
  try {
    const tableName = process.env.DYNAMODB_BIRDS;
    const result = await getItem(tableName, { id: req.params.id });
    if (result.Item) {
      res.json(result.Item);
    } else {
      res.status(404).json({ error: 'Bird not found' });
    }
  } catch (error) {
    console.error('Error fetching bird:', error);
    res.status(500).json({ error: 'Failed to fetch bird' });
  }
});

// Favorite Birds routes
router.get('/favorite-birds', async (req, res) => {
  try {
    const tableName = process.env.DYNAMODB_FAVORITEBIRDS;
    const result = await scanItems(tableName);
    res.json(result.Items || []);
  } catch (error) {
    console.error('Error fetching favorite birds:', error);
    res.status(500).json({ error: 'Failed to fetch favorite birds' });
  }
});

router.post('/favorite-birds', async (req, res) => {
  try {
    const tableName = process.env.DYNAMODB_FAVORITEBIRDS;
    const item = req.body;
    await putItem(tableName, item);
    res.json({ message: 'Favorite bird added successfully', item });
  } catch (error) {
    console.error('Error adding favorite bird:', error);
    res.status(500).json({ error: 'Failed to add favorite bird' });
  }
});

router.get('/favorite-birds/:id', async (req, res) => {
  try {
    const tableName = process.env.DYNAMODB_FAVORITEBIRDS;
    const result = await getItem(tableName, { id: req.params.id });
    if (result.Item) {
      res.json(result.Item);
    } else {
      res.status(404).json({ error: 'Favorite bird not found' });
    }
  } catch (error) {
    console.error('Error fetching favorite bird:', error);
    res.status(500).json({ error: 'Failed to fetch favorite bird' });
  }
});

// S3 routes
router.post('/upload', async (req, res) => {
  try {
    const { key, contentType } = req.body;
    // In a real app, you'd handle file upload via multipart/form-data
    // This is a simplified example
    res.json({ message: 'Upload endpoint - implement file handling' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

router.get('/presigned-url/:key', async (req, res) => {
  try {
    const url = await getPresignedUrl(req.params.key);
    res.json({ url });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ error: 'Failed to generate presigned URL' });
  }
});

// Cognito routes
router.post('/auth/signup', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const result = await signUp(username, password, email);
    res.json({ message: 'User registered successfully', userId: result.UserSub });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ error: error.message || 'Failed to sign up' });
  }
});

router.post('/auth/confirm', async (req, res) => {
  try {
    const { username, confirmationCode } = req.body;
    await confirmSignUp(username, confirmationCode);
    res.json({ message: 'User confirmed successfully' });
  } catch (error) {
    console.error('Error confirming sign up:', error);
    res.status(500).json({ error: error.message || 'Failed to confirm sign up' });
  }
});

router.post('/auth/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await signIn(username, password);
    res.json({
      accessToken: result.AuthenticationResult.AccessToken,
      idToken: result.AuthenticationResult.IdToken,
      refreshToken: result.AuthenticationResult.RefreshToken,
    });
  } catch (error) {
    console.error('Error signing in:', error);
    res.status(500).json({ error: error.message || 'Failed to sign in' });
  }
});

export default router;
