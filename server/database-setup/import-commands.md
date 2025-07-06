# MongoDB Import Commands for EasyPDF

Use these commands to import the collections into your MongoDB database.

## Database Configuration
- **Database Name**: `easypdf`
- **MongoDB URI**: `mongodb+srv://workarjun31:Kumararjun31@cluster0.mjp4c05.mongodb.net`

## Import Commands

### 1. Import Users Collection
```bash
mongoimport --uri "mongodb+srv://workarjun31:Kumararjun31@cluster0.mjp4c05.mongodb.net/easypdf" --collection users --type json --file collections.json --jsonArray
```

### 2. Import Jobs Collection
```bash
mongoimport --uri "mongodb+srv://workarjun31:Kumararjun31@cluster0.mjp4c05.mongodb.net/easypdf" --collection jobs --type json --file jobs.json --jsonArray
```

### 3. Import Files Collection
```bash
mongoimport --uri "mongodb+srv://workarjun31:Kumararjun31@cluster0.mjp4c05.mongodb.net/easypdf" --collection files --type json --file files.json --jsonArray
```

## Collection Descriptions

### Users Collection
- **Purpose**: Store user authentication and profile data
- **Fields**: name, email, password (hashed), role, isActive, lastLogin, timestamps
- **Sample Users**:
  - john@example.com (password: password123)
  - jane@example.com (password: password123)
  - admin@easypdf.com (password: password123)

### Jobs Collection
- **Purpose**: Track PDF processing jobs and their status
- **Fields**: userId, type, status, inputFiles, outputFiles, processing details, timestamps
- **Job Types**: merge, split, remove-pages, extract-pages, organize, scan-to-pdf, compress, repair, ocr

### Files Collection
- **Purpose**: Track uploaded and processed files
- **Fields**: userId, originalName, storedName, filePath, fileSize, mimeType, processing status
- **File Types**: Input files (uploads) and output files (downloads)

## Environment Configuration

Add this to your `.env` file:
```env
MONGODB_URI=mongodb+srv://workarjun31:Kumararjun31@cluster0.mjp4c05.mongodb.net/easypdf
```

## Verification Commands

After importing, you can verify the collections:

```bash
# Connect to MongoDB
mongosh "mongodb+srv://workarjun31:Kumararjun31@cluster0.mjp4c05.mongodb.net/easypdf"

# List collections
show collections

# Count documents in each collection
db.users.countDocuments()
db.jobs.countDocuments()
db.files.countDocuments()

# View sample documents
db.users.findOne()
db.jobs.findOne()
db.files.findOne()
```

## Notes

- The sample data includes hashed passwords (all users have password: "password123")
- Job IDs and User IDs are sample ObjectIds for demonstration
- Files collection tracks both input and output files
- All collections include proper indexing for performance 