import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import { extractPdfContent, chunkText } from './pdfService.js';
import { generateEmbedding } from './geminiEmbeddingService.js';

/**
 * Process uploaded PDF document:
 * Extract -> Chunk -> Generate Embeddings -> Store Chunks -> Mark Completed
 */
export const processDocument = async (documentId) => {
  const document = await Document.findById(documentId);
  if (!document) {
    throw new Error(`Document not found: ${documentId}`);
  }

  try {
    // 1. Mark as Processing
    document.processingStatus = 'Processing';
    document.processingError = null;
    await document.save();

    console.log(`[DocumentProcessor] Starting processing for "${document.fileName}" (${document.vehicleModel})`);

    // 2. Extract Text from PDF
    const { numPages, pages } = await extractPdfContent(document.storagePath);
    document.pageCount = numPages;

    // 3. Chunk text per page
    const allChunks = [];
    let globalChunkIndex = 0;

    for (const page of pages) {
      const pageChunks = chunkText(page.text, {
        chunkSize: 800,
        chunkOverlap: 150,
        pageNumber: page.pageNumber
      });

      for (const chunk of pageChunks) {
        allChunks.push({
          documentId: document._id,
          vehicleModel: document.vehicleModel,
          content: chunk.content,
          pageNumber: chunk.pageNumber,
          chunkIndex: globalChunkIndex++,
          metadata: {
            fileName: document.originalName,
            charCount: chunk.content.length,
            pageNumber: chunk.pageNumber
          }
        });
      }
    }

    console.log(`[DocumentProcessor] Extracted ${allChunks.length} chunks across ${numPages} pages.`);

    // 4. Generate Embeddings for chunks
    // Process in batches of 5 to respect Gemini API rate limits
    const chunksWithEmbeddings = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
      const batch = allChunks.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (chunk) => {
        try {
          const embedding = await generateEmbedding(chunk.content, {
            isQuery: false,
            title: `${chunk.vehicleModel} Brochure Specification`
          });
          return {
            ...chunk,
            embedding
          };
        } catch (embErr) {
          console.warn(`[DocumentProcessor] Embedding warning on chunk ${chunk.chunkIndex}:`, embErr.message);
          if (process.env.NODE_ENV === 'production') {
            throw embErr;
          }
          return {
            ...chunk,
            embedding: [] // In offline/fallback mode, empty or placeholder embedding
          };
        }
      });

      const processedBatch = await Promise.all(batchPromises);
      chunksWithEmbeddings.push(...processedBatch);
    }

    // 5. Save all chunks in MongoDB
    // First clear any previous chunks for this document (e.g. on re-processing)
    await DocumentChunk.deleteMany({ documentId: document._id });
    if (chunksWithEmbeddings.length > 0) {
      await DocumentChunk.insertMany(chunksWithEmbeddings);
    }

    // 6. Update Document Status
    document.processingStatus = 'Completed';
    document.chunkCount = chunksWithEmbeddings.length;
    await document.save();

    console.log(`[DocumentProcessor] Processing successfully COMPLETED for "${document.fileName}".`);
    return document;
  } catch (error) {
    console.error(`[DocumentProcessor] Processing failed for ${documentId}:`, error.message);
    document.processingStatus = 'Failed';
    document.processingError = error.message;
    await document.save();
    throw error;
  }
};
