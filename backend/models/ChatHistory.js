import mongoose from 'mongoose';

const sourceReferenceSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  documentName: String,
  vehicleModel: String,
  pageNumber: Number,
  chunkText: String,
  relevanceScore: Number
}, { _id: false });

const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  sources: [sourceReferenceSchema],
  capability: {
    type: String,
    enum: [
      'alcazar_features',
      'alcazar_creta_compare',
      'alcazar_variants',
      'i20_aura_recommend',
      'general_rag',
      'unsupported_model',
      'non_hyundai_inquiry',
      null
    ],
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'Hyundai Automotive Inquiry'
  },
  messages: [chatMessageSchema]
}, {
  timestamps: true
});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
export default ChatHistory;
