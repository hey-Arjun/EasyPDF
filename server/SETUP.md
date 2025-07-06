# EasyPDF Backend Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create environment file:**
   Create a `.env` file in the backend directory with the following variables:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/easypdf
   # For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/easypdf

   # File Upload Configuration
   MAX_FILE_SIZE=50mb
   UPLOAD_PATH=./uploads
   DOWNLOAD_PATH=./downloads

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # Security
   BCRYPT_SALT_ROUNDS=12
   ```

3. **Create upload directories:**
   ```bash
   mkdir uploads
   mkdir downloads
   ```

4. **Start the server:**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## Database Setup

### Local MongoDB
1. Install MongoDB on your system
2. Start MongoDB service
3. Create a database named `easypdf`
4. Update `MONGODB_URI` in your `.env` file

### MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file with your Atlas connection string

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Organize PDF
- `POST /api/organize/merge` - Merge PDF files
- `POST /api/organize/split` - Split PDF by pages
- `POST /api/organize/remove-pages` - Remove specific pages
- `POST /api/organize/extract-pages` - Extract specific pages
- `POST /api/organize/organize` - Reorder pages
- `POST /api/organize/scan-to-pdf` - Convert images to PDF

### Optimize PDF
- `POST /api/optimize/compress` - Compress PDF
- `POST /api/optimize/repair` - Repair PDF
- `POST /api/optimize/ocr` - OCR PDF

### Convert to PDF
- `POST /api/convert-to-pdf/jpg` - JPG to PDF
- `POST /api/convert-to-pdf/word` - Word to PDF
- `POST /api/convert-to-pdf/powerpoint` - PowerPoint to PDF
- `POST /api/convert-to-pdf/excel` - Excel to PDF
- `POST /api/convert-to-pdf/html` - HTML to PDF

### Convert from PDF
- `POST /api/convert-from-pdf/jpg` - PDF to JPG
- `POST /api/convert-from-pdf/word` - PDF to Word
- `POST /api/convert-from-pdf/powerpoint` - PDF to PowerPoint
- `POST /api/convert-from-pdf/excel` - PDF to Excel
- `POST /api/convert-from-pdf/pdfa` - PDF to PDF/A

## Health Check
- `GET /health` - Server health check

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- File upload restrictions

## File Structure

```
backend/
├── config/
│   ├── config.js
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── organizeController.js
│   ├── optimizeController.js
│   ├── convertToPdfController.js
│   └── convertFromPdfController.js
├── middleware/
│   ├── auth.js
│   ├── upload.js
│   └── validation.js
├── models/
│   └── User.js
├── routes/
│   ├── auth.js
│   ├── organize.js
│   ├── optimize.js
│   ├── convertToPdf.js
│   └── convertFromPdf.js
├── uploads/
├── downloads/
├── server.js
├── package.json
└── README.md
```

## Troubleshooting

1. **MongoDB Connection Error:**
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Ensure network connectivity for Atlas

2. **Port Already in Use:**
   - Change PORT in `.env` file
   - Kill existing process on port 5000

3. **File Upload Issues:**
   - Ensure upload directories exist
   - Check file size limits
   - Verify file types

4. **JWT Errors:**
   - Check JWT_SECRET in `.env`
   - Ensure token is being sent in Authorization header
   - Verify token expiration

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong JWT_SECRET
3. Configure proper CORS origins
4. Set up SSL/TLS
5. Use environment-specific MongoDB URI
6. Configure proper logging
7. Set up monitoring and error tracking 