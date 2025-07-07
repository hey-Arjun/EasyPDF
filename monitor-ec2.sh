#!/bin/bash

# EC2 Monitoring Script for PDF Tools
# Run this script to check the health of your deployed application

echo "🔍 PDF Tools EC2 Monitoring Script"
echo "=================================="

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

echo ""
print_info "Checking system status..."

# Check system resources
echo ""
echo "📊 System Resources:"
echo "-------------------"

# CPU and Memory
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')

print_info "CPU Usage: ${CPU_USAGE}%"
print_info "Memory Usage: ${MEMORY_USAGE}%"
print_info "Disk Usage: ${DISK_USAGE}%"

# Check if usage is high
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    print_warning "High CPU usage detected!"
fi

if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    print_warning "High memory usage detected!"
fi

if [ "$DISK_USAGE" -gt 80 ]; then
    print_warning "High disk usage detected!"
fi

# Check PM2 processes
echo ""
echo "🚀 Application Status:"
echo "--------------------"

if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 status --no-daemon)
    echo "$PM2_STATUS"
    
    # Check if processes are online
    ONLINE_COUNT=$(pm2 status --no-daemon | grep -c "online")
    TOTAL_COUNT=$(pm2 status --no-daemon | grep -c "pdf-tools")
    
    if [ "$ONLINE_COUNT" -eq "$TOTAL_COUNT" ] && [ "$TOTAL_COUNT" -gt 0 ]; then
        print_status "All PM2 processes are running"
    else
        print_error "Some PM2 processes are not running properly"
    fi
else
    print_error "PM2 is not installed or not in PATH"
fi

# Check services
echo ""
echo "🔧 Service Status:"
echo "-----------------"

# Check Nginx
if systemctl is-active --quiet nginx; then
    print_status "Nginx is running"
else
    print_error "Nginx is not running"
fi

# Check MongoDB
if systemctl is-active --quiet mongod; then
    print_status "MongoDB is running"
else
    print_error "MongoDB is not running"
fi

# Check ports
echo ""
echo "🌐 Port Status:"
echo "--------------"

# Check if ports are listening
if netstat -tlnp | grep -q ":80 "; then
    print_status "Port 80 (HTTP) is listening"
else
    print_error "Port 80 (HTTP) is not listening"
fi

if netstat -tlnp | grep -q ":3000 "; then
    print_status "Port 3000 (Backend) is listening"
else
    print_error "Port 3000 (Backend) is not listening"
fi

if netstat -tlnp | grep -q ":3001 "; then
    print_status "Port 3001 (Frontend) is listening"
else
    print_error "Port 3001 (Frontend) is not listening"
fi

# Check application health
echo ""
echo "🏥 Application Health:"
echo "--------------------"

# Get instance public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")

# Check frontend
if curl -s -f "http://$PUBLIC_IP" > /dev/null 2>&1; then
    print_status "Frontend is accessible"
else
    print_error "Frontend is not accessible"
fi

# Check backend API
if curl -s -f "http://$PUBLIC_IP:3000/api/health" > /dev/null 2>&1; then
    print_status "Backend API is accessible"
elif curl -s -f "http://$PUBLIC_IP:3000/" > /dev/null 2>&1; then
    print_status "Backend is accessible (no health endpoint)"
else
    print_error "Backend is not accessible"
fi

# Check recent logs
echo ""
echo "📝 Recent Logs (last 5 lines):"
echo "-----------------------------"

if command -v pm2 &> /dev/null; then
    echo "Backend logs:"
    pm2 logs pdf-tools-backend --lines 5 --nostream 2>/dev/null || print_warning "No backend logs available"
    
    echo ""
    echo "Frontend logs:"
    pm2 logs pdf-tools-frontend --lines 5 --nostream 2>/dev/null || print_warning "No frontend logs available"
fi

# Check error logs
echo ""
echo "🚨 Recent Errors:"
echo "----------------"

# Check Nginx error logs
if [ -f "/var/log/nginx/error.log" ]; then
    echo "Nginx errors (last 3):"
    tail -3 /var/log/nginx/error.log 2>/dev/null || print_warning "No Nginx error logs"
else
    print_warning "Nginx error log not found"
fi

# Check MongoDB logs
if [ -f "/var/log/mongodb/mongod.log" ]; then
    echo ""
    echo "MongoDB errors (last 3):"
    tail -3 /var/log/mongodb/mongod.log 2>/dev/null || print_warning "No MongoDB error logs"
else
    print_warning "MongoDB log not found"
fi

# Summary
echo ""
echo "📋 Summary:"
echo "----------"

if command -v pm2 &> /dev/null; then
    ONLINE_COUNT=$(pm2 status --no-daemon | grep -c "online")
    TOTAL_COUNT=$(pm2 status --no-daemon | grep -c "pdf-tools")
    
    if [ "$ONLINE_COUNT" -eq "$TOTAL_COUNT" ] && [ "$TOTAL_COUNT" -gt 0 ]; then
        print_status "Application appears to be healthy"
    else
        print_error "Application has issues - check logs above"
    fi
else
    print_error "Cannot determine application health - PM2 not available"
fi

echo ""
print_info "For detailed logs, run: pm2 logs"
print_info "To restart applications: pm2 restart all"
print_info "To monitor resources: htop" 