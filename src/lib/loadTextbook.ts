/**
 * Utility function to load textbook content from public folder
 * Caches the content in memory to avoid multiple fetches
 */

let textbookCache: string | null = null;

export async function loadTextbook(): Promise<string> {
  // Return cached content if available
  if (textbookCache) {
    return textbookCache;
  }

  try {
    // Fetch from public folder
    const response = await fetch("/HCM.txt");
    
    if (!response.ok) {
      throw new Error(`Failed to load textbook: ${response.statusText}`);
    }

    // Read as text with UTF-8 encoding to handle Vietnamese characters
    const text = await response.text();
    
    // Cache the content
    textbookCache = text;
    
    return text;
  } catch (error) {
    console.error("Error loading textbook:", error);
    throw error;
  }
}

/**
 * Clear the textbook cache (useful for testing or reloading)
 */
export function clearTextbookCache(): void {
  textbookCache = null;
}

/**
 * Get a chunk of the textbook content (for context window management)
 * Returns a portion of the text around specific keywords or section
 * Improved version that searches for multiple keywords and extracts larger chunks
 */
export function getTextbookChunk(
  fullText: string,
  userQuestion?: string,
  chunkSize: number = 15000
): string {
  if (!userQuestion || userQuestion.trim().length === 0) {
    // Return first chunk if no question
    return fullText.substring(0, Math.min(chunkSize, fullText.length));
  }

  const lowerText = fullText.toLowerCase();
  const lowerQuestion = userQuestion.toLowerCase();

  // Extract keywords from question (words longer than 2 characters)
  const questionWords = lowerQuestion
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .filter((word) => !["về", "của", "trong", "cho", "với", "từ", "đến", "và", "các", "những"].includes(word));

  // Try to find chapter titles or section headers
  const chapterKeywords = [
    "chương",
    "văn hóa",
    "đạo đức",
    "con người",
    "độc lập dân tộc",
    "chủ nghĩa xã hội",
    "đảng cộng sản",
    "đoàn kết",
    "nhà nước",
  ];

  // Combine question words with chapter keywords
  const allKeywords = [...questionWords, ...chapterKeywords].filter(
    (kw, index, self) => self.indexOf(kw) === index
  );

  // Find all positions of keywords
  const positions: number[] = [];
  for (const keyword of allKeywords) {
    let searchIndex = 0;
    while (searchIndex < lowerText.length) {
      const foundIndex = lowerText.indexOf(keyword, searchIndex);
      if (foundIndex === -1) break;
      positions.push(foundIndex);
      searchIndex = foundIndex + 1;
    }
  }

  if (positions.length === 0) {
    // No keywords found, return first chunk
    return fullText.substring(0, Math.min(chunkSize, fullText.length));
  }

  // Find the best region: look for chapter headers first
  let bestStart = 0;
  let bestEnd = fullText.length;

  // Try to find chapter boundaries (look for "Chương" followed by Roman numerals or Vietnamese text)
  // Pattern matches: "Chương I", "Chương II", "Chương VỊ", "Chương VI", etc.
  // Use a more flexible pattern to match Vietnamese characters with diacritics
  const chapterPattern = /chương\s+[^\n]{1,50}\n/gi;
  const chapters: Array<{ start: number; end: number; title: string }> = [];
  let match;
  const chapterMatches: Array<{ index: number; text: string }> = [];

  // Find all chapter headers
  while ((match = chapterPattern.exec(fullText)) !== null) {
    chapterMatches.push({ index: match.index, text: match[0] });
  }

  // Build chapter boundaries
  for (let i = 0; i < chapterMatches.length; i++) {
    const chapterStart = chapterMatches[i].index;
    const chapterEnd =
      i < chapterMatches.length - 1
        ? chapterMatches[i + 1].index
        : fullText.length;
    chapters.push({
      start: chapterStart,
      end: chapterEnd,
      title: chapterMatches[i].text,
    });
  }

  // If we found chapters, try to match question to a chapter
  if (chapters.length > 0) {
    let bestMatch = { chapter: chapters[0], score: 0 };
    
    for (const chapter of chapters) {
      const chapterText = fullText.substring(chapter.start, Math.min(chapter.start + 500, chapter.end)).toLowerCase();
      const chapterTitle = chapter.title.toLowerCase();
      
      // Calculate match score
      let score = 0;
      
      // Check if question keywords match chapter title or content
      for (const keyword of allKeywords) {
        if (chapterTitle.includes(keyword)) {
          score += 3; // Higher weight for title matches
        }
        if (chapterText.includes(keyword)) {
          score += 1;
        }
      }
      
      // Special handling for chapter VI (văn hóa, đạo đức, con người)
      // Match "VỊ" (with diacritics) or "VI" (without diacritics)
      if (chapterTitle.includes("vỊ") || chapterTitle.includes("vi") || chapterTitle.match(/v[íìịỉĩ]/i)) {
        if (lowerQuestion.includes("văn hóa") || lowerQuestion.includes("đạo đức") || lowerQuestion.includes("con người")) {
          score += 10; // Very high score for chapter VI
        }
      }
      
      // Also check if chapter title contains keywords from question
      if (lowerQuestion.includes("văn hóa") && chapterText.includes("văn hóa")) {
        score += 5;
      }
      if (lowerQuestion.includes("đạo đức") && chapterText.includes("đạo đức")) {
        score += 5;
      }
      if (lowerQuestion.includes("con người") && chapterText.includes("con người")) {
        score += 5;
      }
      
      if (score > bestMatch.score) {
        bestMatch = { chapter, score };
      }
    }
    
    // If we found a good match (score >= 2), use that chapter
    if (bestMatch.score >= 2) {
      bestStart = bestMatch.chapter.start;
      // Return larger chunk for chapter summaries
      if (lowerQuestion.includes("tóm tắt") || lowerQuestion.includes("tóm tắt")) {
        bestEnd = bestMatch.chapter.end; // Return entire chapter for summaries
      } else {
        bestEnd = Math.min(bestMatch.chapter.end, bestMatch.chapter.start + chunkSize);
      }
    }
  }
  
  // Fallback: If no chapter match found but question is about văn hóa/đạo đức/con người
  // Try to find "Chương VỊ" or keywords directly in text
  if (bestStart === 0 && (lowerQuestion.includes("văn hóa") || lowerQuestion.includes("đạo đức") || lowerQuestion.includes("con người"))) {
    // Search for "Chương VỊ" or "Chương VI" 
    const chapterVIMarkers = [
      fullText.toLowerCase().indexOf("chương vỊ"),
      fullText.toLowerCase().indexOf("chương vi"),
      fullText.toLowerCase().indexOf("chương vĩ"),
    ].filter(pos => pos !== -1);
    
    if (chapterVIMarkers.length > 0) {
      const chapterVIStart = Math.min(...chapterVIMarkers);
      // Find next chapter or end of text
      const nextChapterPattern = /chương\s+[^\n]{1,50}\n/gi;
      nextChapterPattern.lastIndex = chapterVIStart + 100;
      const nextChapterMatch = nextChapterPattern.exec(fullText);
      const chapterVIEnd = nextChapterMatch ? nextChapterMatch.index : fullText.length;
      
      bestStart = chapterVIStart;
      if (lowerQuestion.includes("tóm tắt")) {
        bestEnd = chapterVIEnd; // Full chapter for summaries
      } else {
        bestEnd = Math.min(chapterVIEnd, chapterVIStart + chunkSize);
      }
    } else {
      // Last resort: search for keywords and extract large chunk
      const keywordPositions = [
        fullText.toLowerCase().indexOf("văn hóa, đạo đức, con người"),
        fullText.toLowerCase().indexOf("văn hóa"),
        fullText.toLowerCase().indexOf("đạo đức"),
      ].filter(pos => pos !== -1);
      
      if (keywordPositions.length > 0) {
        const keywordPos = Math.min(...keywordPositions);
        bestStart = Math.max(0, keywordPos - 2000);
        bestEnd = Math.min(fullText.length, keywordPos + chunkSize);
      }
    }
  }

  // If no chapter match, use keyword positions to find best region
  if (bestStart === 0 && positions.length > 0) {
    positions.sort((a, b) => a - b);
    const firstPos = positions[0];
    const lastPos = positions[positions.length - 1];
    const regionSize = lastPos - firstPos;

    if (regionSize < chunkSize) {
      // All keywords are close together, extract around them
      bestStart = Math.max(0, firstPos - chunkSize / 3);
      bestEnd = Math.min(fullText.length, lastPos + (chunkSize * 2) / 3);
    } else {
      // Keywords are spread out, take larger chunk
      bestStart = Math.max(0, firstPos - chunkSize / 4);
      bestEnd = Math.min(fullText.length, firstPos + chunkSize);
    }
  }

  // Extract the chunk
  const extracted = fullText.substring(bestStart, bestEnd);

  // If extracted chunk is too small, try to expand it
  if (extracted.length < chunkSize / 2 && bestEnd < fullText.length) {
    const expandedEnd = Math.min(fullText.length, bestStart + chunkSize);
    return fullText.substring(bestStart, expandedEnd);
  }

  return extracted;
}
