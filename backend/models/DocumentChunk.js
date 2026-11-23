import mongoose from 'mongoose';

const documentChunkSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
    index: true
  },
  vehicleModel: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  pageNumber: {
    type: Number,
    default: 1
  },
  chunkIndex: {
    type: Number,
    required: true
  },
  embedding: {
    type: [Number],
    required: false, // Populated after Gemini embedding call
    default: undefined
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for fast filtered retrieval
documentChunkSchema.index({ vehicleModel: 1, documentId: 1 });

const DocumentChunk = mongoose.model('DocumentChunk', documentChunkSchema);
export default DocumentChunk;
