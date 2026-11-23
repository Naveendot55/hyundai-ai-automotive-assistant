import fs from 'fs';
import path from 'path';
import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import { processDocument } from '../services/documentProcessor.js';

// @desc    Upload a Hyundai PDF brochure and process it
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded. Please upload a valid Hyundai brochure PDF.'
      });
    }

    const { vehicleModel } = req.body;
    if (!vehicleModel) {
      // Remove uploaded file if model missing
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Vehicle model is required (e.g., Hyundai Alcazar, Hyundai Creta, Hyundai i20, Hyundai Aura).'
      });
    }

    // Create Document record
    const document = await Document.create({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      vehicleModel,
      fileUrl: `/uploads/${req.file.filename}`,
      storagePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype || 'application/pdf',
      uploadedBy: req.user._id,
      processingStatus: 'Uploaded'
    });

    // Run processing pipeline asynchronously or await it based on query flag
    // For fast feedback in API we can await or background it
    const syncProcessing = req.query.sync === 'true';

    if (syncProcessing) {
      await processDocument(document._id);
      const updatedDoc = await Document.findById(document._id);
      return res.status(201).json({
        success: true,
        message: 'Brochure uploaded and processed successfully',
        document: updatedDoc
      });
    } else {
      // Background processing
      processDocument(document._id).catch(err => {
        console.error(`[UploadHandler] Background processing failed for ${document._id}:`, err.message);
      });

      return res.status(201).json({
        success: true,
        message: 'Brochure uploaded successfully. Processing started.',
        document
      });
    }
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    next(error);
  }
};

// @desc    Get all uploaded documents with optional filtering
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
  try {
    const { vehicleModel, status } = req.query;
    const filter = {};

    if (vehicleModel) {
      filter.vehicleModel = vehicleModel;
    }
    if (status) {
      filter.processingStatus = status;
    }

    const documents = await Document.find(filter)
      .sort({ uploadedAt: -1 })
      .populate('uploadedBy', 'name email');

    res.json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document details and chunk previews
// @route   GET /api/documents/:id
// @access  Private
export const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Fetch chunk summary (first 50 chunks for preview)
    const chunks = await DocumentChunk.find({ documentId: document._id })
      .select('-embedding')
      .sort({ chunkIndex: 1 })
      .limit(50);

    res.json({
      success: true,
      document,
      chunks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document, physical file, and all associated chunks
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // 1. Delete physical file from disk
    if (document.storagePath && fs.existsSync(document.storagePath)) {
      try {
        fs.unlinkSync(document.storagePath);
        console.log(`[DeleteDoc] Removed file: ${document.storagePath}`);
      } catch (fileErr) {
        console.warn(`[DeleteDoc] File removal notice: ${fileErr.message}`);
      }
    }

    // 2. Delete all vector chunks associated with this document
    const chunkDeleteResult = await DocumentChunk.deleteMany({ documentId: document._id });
    console.log(`[DeleteDoc] Deleted ${chunkDeleteResult.deletedCount} vector chunks for document ${document._id}`);

    // 3. Delete document record
    await Document.findByIdAndDelete(document._id);

    res.json({
      success: true,
      message: 'Document and all associated vector chunks deleted successfully',
      deletedDocumentId: document._id,
      deletedChunksCount: chunkDeleteResult.deletedCount
    });
  } catch (error) {
    next(error);
  }
};
