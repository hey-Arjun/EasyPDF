# EC2 Deployment Guide for PDF Tools

This guide will help you deploy your full-stack PDF tools application on Amazon EC2.

## Prerequisites

- AWS Account
- Basic knowledge of Linux commands
- Domain name (optional but recommended)

## Step 1: Launch EC2 Instance

### 1.1 Create EC2 Instance
1. Go to AWS Console → EC2 → Launch Instance
2. Choose Amazon Linux 2023 (free tier eligible)
3. Select t2.micro (free tier) or t3.small for better performance
4. Configure Security Group:
   - SSH (Port 22) - Your IP
   - HTTP (Port 80) - 0.0.0.0/0
   - HTTPS (Port 443) - 0.0.0.0/0
   - Custom TCP (Port 3000) - 0.0.0.0/0 (for backend)
   - Custom TCP (Port 3001) - 0.0.0.0/0 (for frontend)

### 1.2 Connect to Instance
```bash
# Download your .pem key file and set permissions
chmod 400 your-key.pem

# Connect via SSH
ssh -i your-key.pem ec2-user@your-instance-public-ip
```

## Step 2: Server Setup

### 2.1 Update System
```bash
sudo yum update -y
```

### 2.2 Install Node.js and npm
```bash
# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version
npm --version
```

### 2.3 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 2.4 Install Nginx
```bash
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2.5 Install MongoDB
```bash
# Create MongoDB repo file
sudo tee /etc/yum.repos.d/mongodb-org.repo << EOF
[mongodb-org-4.4]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/4.4/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-4.4.asc
EOF

# Install MongoDB
sudo yum install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Step 3: Deploy Backend

### 3.1 Clone Repository
```bash
cd /home/ec2-user
git clone https://github.com/your-username/PDF-tools.git
cd PDF-tools/server
```

### 3.2 Install Dependencies
```bash
npm install
```

### 3.3 Configure Environment Variables
```bash
# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/pdf-tools
JWT_SECRET=your-super-secret-jwt-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://your-domain.com
EOF
```

### 3.4 Start Backend with PM2
```bash
# Start the server
pm2 start server.js --name "pdf-tools-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

## Step 4: Deploy Frontend

### 4.1 Build Frontend
```bash
cd /home/ec2-user/PDF-tools/client
npm install
npm run build
```

### 4.2 Configure Frontend Environment
```bash
# Create production environment file
cat > .env.production << EOF
REACT_APP_API_URL=http://your-domain.com:3000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
EOF
```

### 4.3 Serve Frontend with PM2
```bash
# Install serve globally
sudo npm install -g serve

# Start frontend with PM2
pm2 start "serve -s build -l 3001" --name "pdf-tools-frontend"

# Save PM2 configuration
pm2 save
```

## Step 5: Configure Nginx

### 5.1 Create Nginx Configuration
```bash
sudo tee /etc/nginx/conf.d/pdf-tools.conf << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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
```

### 5.2 Test and Reload Nginx
```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 6: SSL Certificate (Optional but Recommended)

### 6.1 Install Certbot
```bash
sudo yum install -y certbot python3-certbot-nginx
```

### 6.2 Get SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Step 7: Monitoring and Maintenance

### 7.1 Check Application Status
```bash
# Check PM2 processes
pm2 status

# Check logs
pm2 logs

# Check specific app logs
pm2 logs pdf-tools-backend
pm2 logs pdf-tools-frontend
```

### 7.2 Monitor System Resources
```bash
# Check system resources
htop
df -h
free -h
```

### 7.3 Backup Database
```bash
# Create backup script
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
```

## Step 8: Troubleshooting

### 8.1 Common Issues

**Backend not starting:**
```bash
# Check logs
pm2 logs pdf-tools-backend

# Check if port is in use
sudo netstat -tlnp | grep :3000
```

**Frontend not loading:**
```bash
# Check if build exists
ls -la /home/ec2-user/PDF-tools/client/build

# Check frontend logs
pm2 logs pdf-tools-frontend
```

**Database connection issues:**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### 8.2 Useful Commands

```bash
# Restart applications
pm2 restart all

# Update application
cd /home/ec2-user/PDF-tools
git pull
cd server && npm install
cd ../client && npm install && npm run build
pm2 restart all

# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
ps aux | grep node
```

## Step 9: Security Considerations

1. **Firewall**: Configure security groups properly
2. **SSH**: Use key-based authentication only
3. **Updates**: Regularly update system packages
4. **Backups**: Set up automated database backups
5. **Monitoring**: Set up CloudWatch alarms
6. **SSL**: Always use HTTPS in production

## Step 10: Scaling (Future)

When your application grows:
1. Use Application Load Balancer
2. Deploy to multiple EC2 instances
3. Use RDS for database
4. Use S3 for file storage
5. Implement CDN for static assets

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check system logs: `sudo journalctl -f`
4. Monitor resources: `htop`, `df -h`, `free -h` 