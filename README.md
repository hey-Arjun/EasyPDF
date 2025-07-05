# EasyPDF - Full-Stack PDF Tools Application

A comprehensive PDF processing application built with React frontend and Node.js backend, offering various PDF manipulation tools similar to iLovePDF.

## 🚀 Features

### PDF Organization Tools
- **Organize PDF**: Reorder pages in PDF documents
- **Remove Pages**: Remove specific pages from PDFs
- **Extract Pages**: Extract specific pages from PDFs

### PDF Optimization Tools
- **Compress PDF**: Reduce PDF file size while maintaining quality

### Convert TO PDF Tools
- **JPG to PDF**: Convert image files to PDF
- **Word to PDF**: Convert Word documents to PDF
- **PowerPoint to PDF**: Convert PowerPoint presentations to PDF
- **Excel to PDF**: Convert Excel spreadsheets to PDF
- **HTML to PDF**: Convert HTML files to PDF

### User Management
- User registration and authentication
- Job history tracking for logged-in users
- Anonymous usage support
- Profile management

## 🛠️ Tech Stack

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **React Dropzone** for file uploads
- **CSS3** with modern styling
- **Context API** for state management

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **PDF-lib** for PDF manipulation
- **Puppeteer** for HTML to PDF conversion
- **Mammoth** for Word to PDF conversion
- **Tesseract.js** for OCR capabilities

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd PDF-tools
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Environment Configuration**
   
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5002
   ```

5. **Start the application**
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   PORT=5002 npm start
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5002

## 🏗️ Project Structure

```
PDF-tools/
├── src/                    # Frontend React application
│   ├── components/         # Reusable React components
│   ├── pages/             # Page components
│   ├── context/           # React context providers
│   ├── styles/            # CSS stylesheets
│   └── App.js             # Main App component
├── backend/               # Node.js backend application
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── uploads/          # File upload directory
│   ├── downloads/        # Generated files directory
│   └── server.js         # Main server file
├── package.json          # Frontend dependencies
└── README.md            # Project documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### PDF Organization
- `POST /api/organize/organize` - Organize PDF pages
- `POST /api/organize/remove-pages` - Remove pages from PDF
- `POST /api/organize/extract-pages` - Extract pages from PDF

### PDF Optimization
- `POST /api/optimize/compress` - Compress PDF

### Convert TO PDF
- `POST /api/convert-to-pdf/jpg-to-pdf` - Convert images to PDF
- `POST /api/convert-to-pdf/word-to-pdf` - Convert Word to PDF
- `POST /api/convert-to-pdf/powerpoint-to-pdf` - Convert PowerPoint to PDF
- `POST /api/convert-to-pdf/excel-to-pdf` - Convert Excel to PDF
- `POST /api/convert-to-pdf/html-to-pdf` - Convert HTML to PDF

### Downloads
- `GET /api/*/download/:filename` - Download generated files

### Job History
- `GET /api/jobs` - Get user's job history

## 🎯 Usage

### For Anonymous Users
- All PDF tools are available without registration
- Files are processed but job history is not saved
- Download links are provided for processed files

### For Registered Users
- Full access to all PDF tools
- Job history is automatically saved
- Access to past PDFs and job details
- Profile management capabilities

## 🔒 Security Features

- JWT-based authentication
- File type validation
- Rate limiting
- Secure file handling
- Input sanitization

## 🚀 Deployment

### Frontend Deployment
The React app can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### Backend Deployment
The Node.js backend can be deployed to:
- Heroku
- AWS EC2
- DigitalOcean
- Railway

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by iLovePDF's user interface
- Built with modern web technologies
- Open source PDF processing libraries

## 📞 Support

For support and questions, please open an issue in the GitHub repository. 