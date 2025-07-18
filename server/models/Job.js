import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['compress', 'merge', 'split', 'convert', 'extract', 'remove', 'organize']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  inputFile: {
    name: String,
    size: Number,
    path: String
  },
  outputFile: {
    name: String,
    size: Number,
    path: String
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  error: String,
  metadata: {
    originalSize: Number,
    compressedSize: Number,
    compressionRatio: Number,
    pages: Number
  }
}, {
  timestamps: true
});

const Job = mongoose.model('Job', jobSchema);

<<<<<<< HEAD
export default Job; 
=======
export default Job; 
>>>>>>> f2fbb8a (Update all files before uploading build)
