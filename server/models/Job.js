const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['merge', 'split', 'remove_pages', 'extract_pages', 'organize', 'scan_to_pdf', 'compress', 'repair', 'ocr', 'jpg_to_pdf', 'word_to_pdf', 'powerpoint_to_pdf', 'excel_to_pdf', 'html_to_pdf', 'pdf_to_jpg', 'pdf_to_word', 'pdf_to_powerpoint', 'pdf_to_excel', 'pdf_to_pdfa']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  fileName: {
    type: String,
    required: true
  },
  originalFiles: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
jobSchema.index({ userId: 1, createdAt: -1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('Job', jobSchema); 