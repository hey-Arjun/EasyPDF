# EasyPDF Backend API

A comprehensive Node.js/Express backend API for PDF processing and conversion tools.

## Features

### 🔐 Authentication
- User registration and login
- JWT token-based authentication
- Password hashing with bcrypt
- Password reset functionality

### 📄 PDF Organization Tools
- **Merge PDF**: Combine multiple PDFs into one
- **Split PDF**: Split PDF into multiple files by page ranges
- **Remove Pages**: Remove specific pages from PDF
- **Extract Pages**: Extract specific pages from PDF
- **Organize PDF**: Reorder pages in PDF
- **Scan to PDF**: Convert images to PDF

### ⚡ PDF Optimization Tools
- **Compress PDF**: Reduce file size with different compression levels
- **Repair PDF**: Fix corrupted PDF files
- **OCR PDF**: Extract text from scanned documents

### 🔄 Convert TO PDF
- **JPG to PDF**: Convert images to PDF
- **Word to PDF**: Convert Word documents to PDF
- **PowerPoint to PDF**: Convert presentations to PDF
- **Excel to PDF**: Convert spreadsheets to PDF
- **HTML to PDF**: Convert web pages to PDF

### 🔄 Convert FROM PDF
- **PDF to JPG**: Convert PDF pages to images
- **PDF to Word**: Convert PDF to Word document
- **PDF to PowerPoint**: Convert PDF to presentation
- **PDF to Excel**: Convert PDF to spreadsheet
- **PDF to PDF/A**: Convert to archival format

## Project Structure

```
backend/
├── config/
│   └── config.js              # Configuration settings
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── organizeController.js  # PDF organization tools
│   ├── optimizeController.js  # PDF optimization tools
│   ├── convertToPdfController.js    # Convert to PDF
│   └── convertFromPdfController.js  # Convert from PDF
├── middleware/
│   ├── auth.js               # JWT authentication
│   ├── upload.js             # File upload handling
│   └── validation.js         # Request validation
├── routes/
│   ├── auth.js               # Authentication routes
│   ├── organize.js           # Organization routes
│   ├── optimize.js           # Optimization routes
│   ├── convertToPdf.js       # Convert to PDF routes
│   └── convertFromPdf.js     # Convert from PDF routes
├── uploads/                  # Temporary file uploads
├── downloads/                # Processed file downloads
├── server.js                 # Main server file
├── package.json              # Dependencies
└── README.md                 # This file
```

## Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### PDF Organization
- `POST /api/organize/merge` - Merge multiple PDFs
- `POST /api/organize/split` - Split PDF by page ranges
- `POST /api/organize/remove-pages` - Remove specific pages
- `POST /api/organize/extract-pages` - Extract specific pages
- `POST /api/organize/organize` - Reorder pages
- `POST /api/organize/scan-to-pdf` - Convert images to PDF

### PDF Optimization
- `POST /api/optimize/compress` - Compress PDF
- `POST /api/optimize/repair` - Repair corrupted PDF
- `POST /api/optimize/ocr` - OCR PDF for text extraction

### Convert TO PDF
- `POST /api/convert-to-pdf/jpg-to-pdf` - Convert images to PDF
- `POST /api/convert-to-pdf/word-to-pdf` - Convert Word to PDF
- `POST /api/convert-to-pdf/powerpoint-to-pdf` - Convert PowerPoint to PDF
- `POST /api/convert-to-pdf/excel-to-pdf` - Convert Excel to PDF
- `POST /api/convert-to-pdf/html-to-pdf` - Convert HTML to PDF

### Convert FROM PDF
- `POST /api/convert-from-pdf/pdf-to-jpg` - Convert PDF to images
- `POST /api/convert-from-pdf/pdf-to-word` - Convert PDF to Word
- `POST /api/convert-from-pdf/pdf-to-powerpoint` - Convert PDF to PowerPoint
- `POST /api/convert-from-pdf/pdf-to-excel` - Convert PDF to Excel
- `POST /api/convert-from-pdf/pdf-to-pdfa` - Convert PDF to PDF/A

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## File Upload

Use multipart/form-data for file uploads:

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('compressionLevel', 'recommended');

fetch('/api/optimize/compress', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "downloadUrl": "/downloads/filename.pdf",
    "fileName": "filename.pdf",
    "fileSize": "1.2 MB"
  }
}
```

## Error Handling

Errors are returned in this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Configuration

Key configuration options in `config/config.js`:

- **File upload limits**: 50MB max file size
- **Compression levels**: Extreme, Recommended, Less
- **Supported formats**: PDF, Images, Office documents, HTML
- **Rate limiting**: 100 requests per 15 minutes

## Dependencies

- **Express**: Web framework
- **pdf-lib**: PDF manipulation
- **puppeteer**: HTML to PDF conversion
- **multer**: File upload handling
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **tesseract.js**: OCR functionality
- **mammoth**: Word document processing
- **xlsx**: Excel file processing

## Development

```bash
# Run in development mode with auto-restart
npm run dev

# Run tests
npm test

# Health check
curl http://localhost:5000/health
```

## Production Deployment

1. Set environment variables
2. Use PM2 or similar process manager
3. Set up reverse proxy (nginx)
4. Configure SSL certificates
5. Set up file cleanup for uploads/downloads

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- File type validation
- CORS configuration
- Helmet security headers
- Input validation and sanitization

## File Management

- Uploaded files are stored temporarily in `/uploads`
- Processed files are saved in `/downloads`
- Implement automatic cleanup for old files
- Set up proper file permissions

## Support

For issues and questions, please refer to the main project documentation or create an issue in the repository. 