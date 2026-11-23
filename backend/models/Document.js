import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: [true, 'Original file name is required'],
    trim: true
  },
  vehicleModel: {
    type: String,
    required: [true, 'Vehicle model is required'],
    enum: [
      'Hyundai Alcazar',
      'Hyundai Creta',
      'Hyundai i20',
      'Hyundai Aura',
      'Hyundai Venue',
      'Hyundai Verna',
      'Hyundai Tucson',
      'Hyundai Ioniq 5',
      'General'
    ],
    default: 'Hyundai Alcazar'
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL or storage path is required']
  },
  storagePath: {
    type: String,
    required: [true, 'Physical file path is required']
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    default: 'application/pdf'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  processingStatus: {
    type: String,
    enum: ['Uploaded', 'Processing', 'Completed', 'Failed'],
    default: 'Uploaded'
  },
  processingError: {
    type: String,
    default: null
  },
  chunkCount: {
    type: Number,
    default: 0
  },
  pageCount: {
    type: Number,
    default: 0
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Cascade delete chunks when a document is deleted
documentSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  await mongoose.model('DocumentChunk').deleteMany({ documentId: this._id });
  next();
});

const Document = mongoose.model('Document', documentSchema);
export default Document;
