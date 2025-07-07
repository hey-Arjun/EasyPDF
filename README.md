# PDF-tools

A full-stack PDF tools web application with a React frontend and Node.js/Express backend. Features include PDF conversion, compression, merging, splitting, OCR, and more.

## Project Structure

```
PDF-tools/
├── client/   # React frontend
├── server/   # Node.js/Express backend
├── README.md
├── DEPLOYMENT.md
└── .gitignore
```

## Local Development

### 1. Frontend (React)
```
cd client
npm install
npm start
```
Runs on [http://localhost:3000](http://localhost:3000)

### 2. Backend (Express)
```
cd server
npm install
npm run dev
```
Runs on [http://localhost:5001](http://localhost:5001)

## Deployment
- **Frontend:** Deploy `client/` to Vercel
- **Backend:** Deploy `server/` to Render
- See `DEPLOYMENT.md` for detailed instructions

## Features
- PDF conversion (Word, Excel, JPG, PowerPoint, HTML)
- PDF compression
- Merge, split, extract, and remove pages
- OCR (Optical Character Recognition)
- User authentication (including Google OAuth)
- File upload/download history

## Environment Variables
See `server/env.production.template` and Vercel/Render dashboard for required environment variables.

## License
MIT 