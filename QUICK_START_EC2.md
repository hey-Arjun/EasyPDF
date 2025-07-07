# Quick Start: Deploy PDF Tools on EC2

This is a simplified guide to get your PDF tools application running on Amazon EC2 quickly.

## Prerequisites
- AWS Account
- Git repository of your PDF tools project

## Step 1: Launch EC2 Instance

1. **Go to AWS Console** → EC2 → Launch Instance
2. **Choose Amazon Linux 2023** (free tier eligible)
3. **Select t2.micro** (free tier) or t3.small for better performance
4. **Configure Security Group** with these rules:
   - SSH (Port 22) - Your IP
   - HTTP (Port 80) - 0.0.0.0/0
   - HTTPS (Port 443) - 0.0.0.0/0
   - Custom TCP (Port 3000) - 0.0.0.0/0
   - Custom TCP (Port 3001) - 0.0.0.0/0

## Step 2: Connect to Your Instance

```bash
# Download your .pem key file and set permissions
chmod 400 your-key.pem

# Connect via SSH (replace with your actual values)
ssh -i your-key.pem ec2-user@your-instance-public-ip
```

## Step 3: Run the Deployment Script

Once connected to your EC2 instance:

```bash
# Download the deployment script
curl -O https://raw.githubusercontent.com/your-username/PDF-tools/main/deploy-ec2.sh

# Make it executable
chmod +x deploy-ec2.sh

# Run the deployment script
./deploy-ec2.sh
```

## Step 4: Configure Your Application

After the script completes, you need to update the configuration files:

### Update Backend Configuration
```bash
# Edit the backend .env file
nano /home/ec2-user/PDF-tools/server/.env
```

Update these values:
- `JWT_SECRET` - Generate a strong secret key
- `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth client secret

### Update Frontend Configuration
```bash
# Edit the frontend environment file
nano /home/ec2-user/PDF-tools/client/.env.production
```

Update:
- `REACT_APP_GOOGLE_CLIENT_ID` - Your Google OAuth client ID

## Step 5: Restart Applications

```bash
# Restart all applications with new configuration
pm2 restart all
```

## Step 6: Access Your Application

Your application should now be available at:
- **Frontend**: `http://your-instance-public-ip`
- **Backend API**: `http://your-instance-public-ip:3000`

## Troubleshooting

### Check Application Status
```bash
# Check if applications are running
pm2 status

# Check logs
pm2 logs
```

### Common Issues

**If the frontend doesn't load:**
```bash
# Check if build exists
ls -la /home/ec2-user/PDF-tools/client/build

# Rebuild frontend
cd /home/ec2-user/PDF-tools/client
npm run build
pm2 restart pdf-tools-frontend
```

**If the backend doesn't start:**
```bash
# Check backend logs
pm2 logs pdf-tools-backend

# Check if MongoDB is running
sudo systemctl status mongod
```

**If you can't access the application:**
```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check if ports are open
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :3001
```

## Next Steps

1. **Set up a domain name** and point it to your EC2 instance
2. **Configure SSL certificate** using Certbot
3. **Set up automated backups** for your database
4. **Monitor your application** using PM2 and system tools

## Useful Commands

```bash
# Monitor system resources
htop

# Check disk space
df -h

# Check memory usage
free -h

# Update application
cd /home/ec2-user/PDF-tools
git pull
cd server && npm install
cd ../client && npm install && npm run build
pm2 restart all

# Backup database
./backup-db.sh
```

## Security Notes

- Change the default JWT secret
- Configure your Google OAuth credentials properly
- Consider setting up SSL/TLS certificates
- Regularly update your system packages
- Monitor your application logs for any issues

Your PDF tools application should now be running on EC2! 🚀 