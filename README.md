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

### EC2 Deployment (Recommended)
- **Quick Start**: See `QUICK_START_EC2.md` for fast deployment
- **Detailed Guide**: See `EC2_DEPLOYMENT.md` for comprehensive instructions
- **Automated Script**: Use `deploy-ec2.sh` for automated deployment

### Other Platforms
- See `DEPLOYMENT.md` for alternative deployment options

## Features
- PDF conversion (Word, Excel, JPG, PowerPoint, HTML)
- PDF compression
- Merge, split, extract, and remove pages
- OCR (Optical Character Recognition)
- User authentication (including Google OAuth)
- File upload/download history

## Environment Variables
See `server/env.production.template` for required environment variables.

## License
MIT 