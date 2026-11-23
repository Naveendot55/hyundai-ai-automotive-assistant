import ChatHistory from '../models/ChatHistory.js';
import { executeRagQuery } from '../services/ragService.js';

// @desc    Process a user message through RAG pipeline and return grounded response
// @route   POST /api/chat
// @access  Private
export const sendChatMessage = async (req, res, next) => {
  try {
    const { message, conversationId, vehicleModelFilter } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required.'
      });
    }

    const trimmedMessage = message.trim();

    // 1. Retrieve or create conversation record
    let chat;
    if (conversationId) {
      chat = await ChatHistory.findOne({ _id: conversationId, userId: req.user._id });
    }

    if (!chat) {
      chat = new ChatHistory({
        userId: req.user._id,
        title: trimmedMessage.substring(0, 45) + (trimmedMessage.length > 45 ? '...' : ''),
        messages: []
      });
    }

    // Debounce duplicate user submissions within 2 seconds
    const lastMsg = chat.messages[chat.messages.length - 1];
    if (
      lastMsg &&
      lastMsg.role === 'user' &&
      lastMsg.content === trimmedMessage &&
      Date.now() - new Date(lastMsg.timestamp).getTime() < 2000
    ) {
      console.log(`[ChatController] Debounced rapid duplicate submission: "${trimmedMessage}"`);
      return res.json({
        success: true,
        conversationId: chat._id,
        title: chat.title,
        response: chat.messages[chat.messages.length - 1]
      });
    }

    // 2. Execute RAG pipeline
    const ragResult = await executeRagQuery({
      query: trimmedMessage,
      conversationHistory: chat.messages,
      vehicleModelFilter
    });

    // 3. Save user message and assistant grounded response to chat history
    chat.messages.push({
      role: 'user',
      content: trimmedMessage,
      timestamp: new Date()
    });

    chat.messages.push({
      role: 'assistant',
      content: ragResult.answer,
      sources: ragResult.sources,
      capability: ragResult.capability,
      timestamp: new Date()
    });

    chat.updatedAt = new Date();
    await chat.save();

    // 4. Return response to frontend
    res.json({
      success: true,
      conversationId: chat._id,
      title: chat.title,
      capability: ragResult.capability,
      response: {
        role: 'assistant',
        content: ragResult.answer,
        sources: ragResult.sources,
        capability: ragResult.capability,
        retrievedCount: ragResult.retrievedCount,
        timestamp: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's chat conversations or messages in a conversation
// @route   GET /api/chat/history
// @access  Private
export const getChatHistory = async (req, res, next) => {
  try {
    const { conversationId } = req.query;

    if (conversationId) {
      const conversation = await ChatHistory.findOne({
        _id: conversationId,
        userId: req.user._id
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      return res.json({
        success: true,
        conversation
      });
    }

    // Return deduplicated, active conversation summaries for this user
    const rawConversations = await ChatHistory.find({ 
      userId: req.user._id,
      'messages.0': { $exists: true } // only return non-empty conversations
    })
      .select('title createdAt updatedAt messages')
      .sort({ updatedAt: -1 })
      .limit(50);

    // Deduplicate conversations that share the exact same title & initial message
    const seenSignatures = new Set();
    const deduplicatedSummaries = [];

    for (const c of rawConversations) {
      const firstUserMsg = c.messages.find(m => m.role === 'user')?.content || c.title;
      const signature = `${c.title.trim().toLowerCase()}:::${firstUserMsg.trim().toLowerCase()}`;

      if (!seenSignatures.has(signature)) {
        seenSignatures.add(signature);
        deduplicatedSummaries.push({
          _id: c._id,
          title: c.title,
          messageCount: c.messages.length,
          lastMessage: c.messages.length > 0 ? c.messages[c.messages.length - 1].content.substring(0, 80) : '',
          updatedAt: c.updatedAt
        });
      }
    }

    res.json({
      success: true,
      conversations: deduplicatedSummaries.slice(0, 20)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear or delete a conversation
// @route   DELETE /api/chat/history/:id
// @access  Private
export const deleteChatConversation = async (req, res, next) => {
  try {
    const conversation = await ChatHistory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
