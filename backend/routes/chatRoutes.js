import express from 'express';
import {
  sendChatMessage,
  getChatHistory,
  deleteChatConversation
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', sendChatMessage);
router.get('/history', getChatHistory);
router.delete('/history/:id', deleteChatConversation);

export default router;
