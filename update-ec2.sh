#!/bin/bash

# EC2 Update Script for PDF Tools
# Run this script to update your deployed application with new changes

set -e  # Exit on any error

echo "🔄 PDF Tools EC2 Update Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[ℹ]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as ec2-user."
   exit 1
fi

# Check if we're in the right directory
if [ ! -d "PDF-tools" ]; then
    print_error "PDF-tools directory not found. Please run this script from /home/ec2-user"
    exit 1
fi

cd PDF-tools

print_info "Starting application update..."

# Backup current state
print_status "Creating backup of current state..."
BACKUP_DIR="/home/ec2-user/backups/app-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup current .env files
if [ -f "server/.env" ]; then
    cp server/.env "$BACKUP_DIR/server.env.backup"
    print_status "Backed up server .env file"
fi

if [ -f "client/.env.production" ]; then
    cp client/.env.production "$BACKUP_DIR/client.env.production.backup"
    print_status "Backed up client .env.production file"
fi

# Pull latest changes
print_status "Pulling latest changes from Git..."
git pull origin main || git pull origin master

# Update Backend
print_status "Updating backend..."
cd server

# Install/update dependencies
print_status "Installing backend dependencies..."
npm install

# Restore .env if it was backed up
if [ -f "$BACKUP_DIR/server.env.backup" ]; then
    cp "$BACKUP_DIR/server.env.backup" .env
    print_status "Restored server .env file"
fi

# Restart backend
print_status "Restarting backend..."
pm2 restart pdf-tools-backend

# Update Frontend
print_status "Updating frontend..."
cd ../client

# Install/update dependencies
print_status "Installing frontend dependencies..."
npm install

# Restore .env.production if it was backed up
if [ -f "$BACKUP_DIR/client.env.production.backup" ]; then
    cp "$BACKUP_DIR/client.env.production.backup" .env.production
    print_status "Restored client .env.production file"
fi

# Build frontend
print_status "Building frontend..."
npm run build

# Restart frontend
print_status "Restarting frontend..."
pm2 restart pdf-tools-frontend

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

# Check application status
echo ""
print_status "Update completed!"
echo ""
echo "📊 Application Status:"
pm2 status

# Test application health
echo ""
print_info "Testing application health..."

# Get instance public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")

# Test frontend
if curl -s -f "http://$PUBLIC_IP" > /dev/null 2>&1; then
    print_status "Frontend is accessible"
else
    print_warning "Frontend may not be accessible yet (check in a few seconds)"
fi

# Test backend
if curl -s -f "http://$PUBLIC_IP:3000/" > /dev/null 2>&1; then
    print_status "Backend is accessible"
else
    print_warning "Backend may not be accessible yet (check in a few seconds)"
fi

echo ""
print_info "Update process completed successfully!"
print_info "Your application should be running with the latest changes."
echo ""
print_info "Useful commands:"
print_info "  - Check logs: pm2 logs"
print_info "  - Monitor health: ./monitor-ec2.sh"
print_info "  - Restart if needed: pm2 restart all" 