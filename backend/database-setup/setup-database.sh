#!/bin/bash

# EasyPDF Database Setup Script
# This script will create the database and import sample collections

# Database configuration
DATABASE="easypdf"
URI="mongodb+srv://workarjun31:Kumararjun31@cluster0.mjp4c05.mongodb.net"

echo "🚀 Setting up EasyPDF database..."

# Create database and collections
echo "📊 Creating database: $DATABASE"

# Import users collection
echo "👥 Importing users collection..."
mongoimport --uri "$URI/$DATABASE" --collection users --type json --file collections.json --jsonArray

# Import jobs collection
echo "📋 Importing jobs collection..."
mongoimport --uri "$URI/$DATABASE" --collection jobs --type json --file jobs.json --jsonArray

# Import files collection
echo "📁 Importing files collection..."
mongoimport --uri "$URI/$DATABASE" --collection files --type json --file files.json --jsonArray

echo "✅ Database setup completed!"
echo ""
echo "📊 Collections created:"
echo "  - users (for user authentication)"
echo "  - jobs (for tracking PDF processing jobs)"
echo "  - files (for tracking uploaded and processed files)"
echo ""
echo "🔗 Connection string for your .env file:"
echo "MONGODB_URI=$URI/$DATABASE" 