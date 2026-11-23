import fs from 'fs';
import pdfParse from 'pdf-parse';

/**
 * Clean extracted text: normalize whitespace, remove non-printable characters while preserving structure
 */
export const cleanText = (rawText) => {
  if (!rawText) return '';
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[^\S\n]+/g, ' ') // Collapse multiple spaces
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .trim();
};

/**
 * Split text into semantic overlapping chunks preserving page context
 */
export const chunkText = (text, options = {}) => {
  const {
    chunkSize = 800,
    chunkOverlap = 150,
    pageNumber = 1
  } = options;

  if (!text || text.length === 0) return [];

  const chunks = [];
  let startIndex = 0;
  let chunkIndex = 0;

  // Split by natural paragraph breaks or lines first
  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;

    if (endIndex >= text.length) {
      endIndex = text.length;
    } else {
      // Find the nearest punctuation or newline to avoid splitting words
      const lastPunctuation = Math.max(
        text.lastIndexOf('.', endIndex),
        text.lastIndexOf('\n', endIndex),
        text.lastIndexOf(';', endIndex)
      );

      if (lastPunctuation > startIndex + (chunkSize * 0.6)) {
        endIndex = lastPunctuation + 1;
      }
    }

    const chunkContent = text.substring(startIndex, endIndex).trim();
    if (chunkContent.length > 30) { // filter out trivial fragments
      chunks.push({
        chunkIndex,
        content: chunkContent,
        pageNumber,
        length: chunkContent.length
      });
      chunkIndex++;
    }

    if (endIndex >= text.length) {
      break;
    }

    startIndex = Math.max(startIndex + 1, endIndex - chunkOverlap);
  }

  return chunks;
};

/**
 * Extract text from PDF with page tracking
 */
export const extractPdfContent = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const uint8Data = new Uint8Array(dataBuffer);
  
  // Custom pager renderer to track per-page content
  const pages = [];
  let currentPage = 1;

  const render_page = function (pageData) {
    return pageData.getTextContent().then(function (textContent) {
      let pageText = '';
      for (const item of textContent.items) {
        pageText += item.str + ' ';
      }
      pages.push({
        pageNumber: currentPage,
        text: cleanText(pageText)
      });
      currentPage++;
      return pageText;
    });
  };

  const parsed = await pdfParse(uint8Data, {
    pagerender: render_page
  });

  // If pagerender did not capture separate pages, fallback to whole text
  if (pages.length === 0) {
    pages.push({
      pageNumber: 1,
      text: cleanText(parsed.text)
    });
  }

  return {
    numPages: parsed.numpages || pages.length,
    info: parsed.info || {},
    pages
  };
};
