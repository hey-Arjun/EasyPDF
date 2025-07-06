const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  storedName: {
    type: String,
    required: true,
    unique: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  isProcessed: {
    type: Boolean,
    default: false
  },
  isOutputFile: {
    type: Boolean,
    default: false
  },
  processingJobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastDownloaded: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
fileSchema.index({ userId: 1, uploadDate: -1 });
fileSchema.index({ storedName: 1 });
fileSchema.index({ isProcessed: 1 });
fileSchema.index({ processingJobId: 1 });

module.exports = mongoose.model('File', fileSchema); 