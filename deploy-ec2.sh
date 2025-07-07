#!/bin/bash

# EC2 Deployment Script for PDF Tools
# Run this script on your EC2 instance after connecting via SSH

set -e  # Exit on any error

echo "🚀 Starting EC2 deployment for PDF Tools..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as ec2-user."
   exit 1
fi

# Update system
print_status "Updating system packages..."
sudo yum update -y

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify Node.js installation
print_status "Verifying Node.js installation..."
node --version
npm --version

# Install PM2 globally
print_status "Installing PM2 process manager..."
sudo npm install -g pm2

# Install Nginx
print_status "Installing Nginx..."
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install MongoDB
print_status "Installing MongoDB..."
sudo tee /etc/yum.repos.d/mongodb-org.repo << EOF
[mongodb-org-4.4]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/4.4/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-4.4.asc
EOF

sudo yum install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Create application directory
print_status "Setting up application directory..."
cd /home/ec2-user

# Check if repository already exists
if [ -d "PDF-tools" ]; then
    print_warning "PDF-tools directory already exists. Updating..."
    cd PDF-tools
    git pull
else
    print_status "Cloning repository..."
    git clone https://github.com/your-username/PDF-tools.git
    cd PDF-tools
fi

# Deploy Backend
print_status "Deploying backend..."
cd server

# Install dependencies
print_status "Installing backend dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/pdf-tools
JWT_SECRET=your-super-secret-jwt-key-here-change-this
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
EOF
    print_warning "Please update the .env file with your actual configuration values!"
fi

# Start backend with PM2
print_status "Starting backend with PM2..."
pm2 start server.js --name "pdf-tools-backend"

# Deploy Frontend
print_status "Deploying frontend..."
cd ../client

# Install dependencies
print_status "Installing frontend dependencies..."
npm install

# Create production environment file
print_status "Creating production environment file..."
cat > .env.production << EOF
REACT_APP_API_URL=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
EOF

# Build frontend
print_status "Building frontend..."
npm run build

# Install serve globally
print_status "Installing serve for frontend..."
sudo npm install -g serve

# Start frontend with PM2
print_status "Starting frontend with PM2..."
pm2 start "serve -s build -l 3001" --name "pdf-tools-frontend"

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save
pm2 startup

# Configure Nginx
print_status "Configuring Nginx..."
sudo tee /etc/nginx/conf.d/pdf-tools.conf << EOF
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # File uploads
    location /uploads/ {
        proxy_pass http://localhost:3000/uploads/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Downloads
    location /downloads/ {
        proxy_pass http://localhost:3000/downloads/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Test and reload Nginx
print_status "Testing and reloading Nginx..."
sudo nginx -t
sudo systemctl reload nginx

# Create backup script
print_status "Creating backup script..."
cat > /home/ec2-user/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ec2-user/backups"
mkdir -p $BACKUP_DIR
mongodump --db pdf-tools --out $BACKUP_DIR/backup_$DATE
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz -C $BACKUP_DIR backup_$DATE
rm -rf $BACKUP_DIR/backup_$DATE
echo "Backup completed: backup_$DATE.tar.gz"
EOF

chmod +x /home/ec2-user/backup-db.sh

# Display status
print_status "Deployment completed!"
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "🌐 Your application should be available at:"
echo "   Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "   Backend API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
echo ""
echo "📝 Next steps:"
echo "   1. Update the .env file in /home/ec2-user/PDF-tools/server/ with your actual configuration"
echo "   2. Update the .env.production file in /home/ec2-user/PDF-tools/client/ with your Google Client ID"
echo "   3. Restart the applications: pm2 restart all"
echo "   4. Set up SSL certificate with Certbot (optional but recommended)"
echo ""
echo "🔧 Useful commands:"
echo "   - Check logs: pm2 logs"
echo "   - Restart apps: pm2 restart all"
echo "   - Monitor resources: htop"
echo "   - Backup database: ./backup-db.sh"
echo ""
print_status "Deployment script completed successfully!" 