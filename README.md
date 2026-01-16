# Pinterest of Birds

A full-stack web application for discovering and saving bird images, built with React + Vite, Express, Node.js, and AWS services (EC2, DynamoDB, S3, Cognito).

## Project Structure

```
pinterestOfBirds/
├── backend/
│   ├── server.js          # Express server entry point
│   ├── package.json
│   ├── .env.example
│   ├── aws/
│   │   ├── dynamodb.js    # DynamoDB helper functions
│   │   ├── s3.js          # S3 helper functions
│   │   └── cognito.js     # Cognito authentication functions
│   └── routes/
│       └── api.js         # API route handlers
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── main.jsx       # React entry point
│   │   ├── components/    # React components
│   │   │   ├── Header.jsx
│   │   │   ├── MainContent.jsx
│   │   │   └── Footer.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- AWS Account with access to:
  - EC2
  - DynamoDB
  - S3
  - Cognito

## Local Development Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Update the `.env` file with your AWS credentials:
```env
PORT=5000
NODE_ENV=development
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
DYNAMODB_TABLE_NAME=your-table-name
S3_BUCKET_NAME=your-bucket-name
COGNITO_USER_POOL_ID=your-user-pool-id
COGNITO_CLIENT_ID=your-client-id
```

5. Start the development server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## AWS Setup

### 1. DynamoDB Setup

1. Create a DynamoDB table in the AWS Console
2. Note the table name and update your `.env` file
3. Example table structure:
   - Table name: `birds`
   - Partition key: `id` (String)

### 2. S3 Setup

1. Create an S3 bucket in the AWS Console
2. Configure bucket permissions (CORS, public access if needed)
3. Note the bucket name and update your `.env` file

### 3. Cognito Setup

1. Create a Cognito User Pool in the AWS Console
2. Create an App Client
3. Note the User Pool ID and Client ID, update your `.env` file
4. Configure authentication settings as needed

### 4. IAM Setup

Create an IAM user with permissions for:
- DynamoDB (read/write access)
- S3 (read/write access)
- Cognito (user management)

Use the access key ID and secret access key in your `.env` file.

## Deployment to AWS EC2

### 1. Launch EC2 Instance

1. Launch an EC2 instance (Ubuntu recommended)
2. Configure security group to allow:
   - SSH (port 22)
   - HTTP (port 80)
   - HTTPS (port 443)
   - Backend API (port 5000)
   - Frontend (port 3000)

### 2. Connect to EC2 Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 3. Install Dependencies on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx (optional, for reverse proxy)
sudo apt install nginx -y
```

### 4. Deploy Application

1. Clone your repository or upload files to EC2
2. Set up environment variables on the server
3. Install dependencies:
```bash
cd backend && npm install
cd ../frontend && npm install
```

4. Build frontend:
```bash
cd frontend
npm run build
```

5. Start backend with PM2:
```bash
cd backend
pm2 start server.js --name backend
pm2 save
pm2 startup
```

### 5. Configure Nginx (Optional)

Create an Nginx configuration file:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. Set Up SSL (Optional)

Use Let's Encrypt for free SSL certificates:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## API Endpoints

### Health Check
- `GET /api/health` - Server health status
- `GET /api/test` - Test endpoint

### DynamoDB
- `GET /api/items` - Get all items
- `POST /api/items` - Create new item
- `GET /api/items/:id` - Get item by ID

### S3
- `POST /api/upload` - Upload file
- `GET /api/presigned-url/:key` - Get presigned URL

### Cognito
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/confirm` - Confirm user registration
- `POST /api/auth/signin` - Sign in user

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `AWS_REGION` - AWS region
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `DYNAMODB_TABLE_NAME` - DynamoDB table name
- `S3_BUCKET_NAME` - S3 bucket name
- `COGNITO_USER_POOL_ID` - Cognito user pool ID
- `COGNITO_CLIENT_ID` - Cognito client ID

## Security Notes

- Never commit `.env` files to version control
- Use IAM roles on EC2 instead of access keys when possible
- Configure CORS properly for production
- Use HTTPS in production
- Implement proper authentication middleware
- Validate and sanitize all inputs

## Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify environment variables are set correctly
- Check AWS credentials are valid

### Frontend can't connect to backend
- Verify backend is running
- Check CORS configuration
- Verify proxy settings in `vite.config.js`

### AWS errors
- Verify IAM permissions
- Check AWS region matches your resources
- Verify resource names (table, bucket, etc.) are correct

## License

ISC
