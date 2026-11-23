import express from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument
} from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadBrochure } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All document management routes require authentication
router.use(protect);

router.post('/upload', uploadBrochure.single('brochure'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.delete('/:id', deleteDocument);

export default router;
