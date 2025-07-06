# EasyPDF - Complete PDF Processing Solution

A comprehensive PDF processing platform built with React (Frontend) and Node.js (Backend).

## 🏗️ Project Structure

```
EasyPDF/
├── client/          # React Frontend
│   ├── src/         # React source code
│   ├── public/      # Static files
│   └── package.json # Frontend dependencies
├── server/          # Node.js Backend
│   ├── controllers/ # API controllers
│   ├── models/      # Database models
│   ├── routes/      # API routes
│   ├── middleware/  # Express middleware
│   ├── config/      # Configuration files
│   └── package.json # Backend dependencies
└── package.json     # Root package.json for scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EasyPDF
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up the database**
   ```bash
   npm run setup
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

This will start both the frontend (port 3000) and backend (port 5001) servers concurrently.

## 📁 Individual Commands

### Frontend (Client)
```bash
cd client
npm install
npm start          # Start React dev server
npm run build      # Build for production
```

### Backend (Server)
```bash
cd server
npm install
npm run dev        # Start with nodemon
npm start          # Start production server
npm run setup      # Setup database
```

## 🔧 Available Scripts

- `npm run install-all` - Install dependencies for all packages
- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend server
- `npm run build` - Build the React app for production
- `npm run start` - Start the production server
- `npm run setup` - Setup the database

## 🌟 Features

### PDF Tools
- **Compress PDF** - Reduce file size while maintaining quality
- **Merge PDF** - Combine multiple PDFs into one
- **Split PDF** - Split PDF into multiple files
- **Convert PDF** - Convert to/from various formats (Word, Excel, PowerPoint, JPG)
- **OCR PDF** - Extract text from scanned documents
- **Repair PDF** - Fix corrupted PDF files
- **Organize PDF** - Reorder, remove, or extract pages

### User Features
- User authentication (Email/Password + Google OAuth)
- File history and management
- Real-time processing status
- Responsive design for all devices

## 🛠️ Technology Stack

### Frontend
- React 18
- React Router DOM
- CSS3 with modern styling
- Responsive design

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- PDF processing libraries

## 📝 Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/easypdf
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@easypdf.com or create an issue in the repository. 