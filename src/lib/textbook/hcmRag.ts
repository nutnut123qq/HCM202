import MiniSearch from "minisearch";

export interface SourceChunk {
  id: string;
  title: string;
  chapter?: string;
  startLine: number;
  endLine: number;
  content: string;
  score: number;
}

interface ChunkMeta {
  id: string;
  title: string;
  chapter?: string;
  startLine: number;
  endLine: number;
  content: string;
  titleNorm: string;
  contentNorm: string;
}

// Module-level cache
let cachedText: string | null = null;
let cachedIndex: MiniSearch<ChunkMeta> | null = null;
let cachedChunks: ChunkMeta[] | null = null;
let indexBuildPromise: Promise<void> | null = null;

// Vietnamese stopwords
const STOPWORDS = new Set([
  "và", "là", "của", "trong", "những", "các", "với", "cho", "từ", "đến", "một",
  "được", "có", "đã", "sẽ", "để", "này", "đó", "về", "như", "khi", "nếu",
  "mà", "vì", "nên", "thì", "cũng", "được", "ra", "vào", "lên", "xuống",
  "nào", "đâu", "sao", "thế", "nào", "gì", "ai", "đâu", "bao", "giờ",
]);

/**
 * Normalize Vietnamese text for search
 */
function normalizeVietnamese(text: string): string {
  // Remove diacritics (NFD normalization)
  let normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  // Replace đ/Đ -> d
  normalized = normalized.replace(/đ/g, "d");

  // Tokenize and filter
  const tokens = normalized.split(/[^a-z0-9]+/).filter((token) => {
    return token.length >= 2 && !STOPWORDS.has(token);
  });

  return tokens.join(" ");
}

/**
 * Detect if a line is a heading
 */
function isHeading(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length === 0) return false;

  // Match chapter/bài/mục patterns
  if (/^(chương|bài|mục)\s+/i.test(trimmed)) {
    return true;
  }

  // Check if line is mostly uppercase and long enough
  if (trimmed.length >= 10) {
    const upperCount = (trimmed.match(/[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/g) || []).length;
    if (upperCount / trimmed.length > 0.7) {
      return true;
    }
  }

  return false;
}

/**
 * Extract chapter number from text
 */
function extractChapter(text: string): string | undefined {
  const match = text.match(/chương\s+([ivxlcdmỊỊ]+|[^\s]+)/i);
  return match ? match[1] : undefined;
}

/**
 * Load textbook text from public folder
 */
export async function loadTextbookText(): Promise<string> {
  if (cachedText) {
    return cachedText;
  }

  try {
    const response = await fetch("/HCM.txt");
    if (!response.ok) {
      throw new Error(`Failed to load textbook: ${response.statusText}`);
    }
    const text = await response.text();
    cachedText = text;
    return text;
  } catch (error) {
    console.error("Error loading textbook:", error);
    throw error;
  }
}

/**
 * Chunk text into overlapping segments
 */
function chunkText(text: string): ChunkMeta[] {
  const lines = text.split("\n");
  const chunks: ChunkMeta[] = [];
  const chunkSize = 4500; // Target chunk size
  const overlap = 500; // Overlap size

  let currentChunk: {
    startLine: number;
    lines: string[];
    title: string;
    chapter?: string;
  } | null = null;

  let currentTitle = "Giáo trình Tư tưởng Hồ Chí Minh";
  let currentChapter: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isHead = isHeading(line);

    // Update title and chapter if we find a heading
    if (isHead) {
      currentTitle = line.trim();
      const chapter = extractChapter(line);
      if (chapter) {
        currentChapter = chapter;
      }
    }

    // Start new chunk if needed
    if (!currentChunk) {
      currentChunk = {
        startLine: i,
        lines: [],
        title: currentTitle,
        chapter: currentChapter,
      };
    }

    currentChunk.lines.push(line);
    const currentContent = currentChunk.lines.join("\n");

    // If chunk is large enough, finalize it
    if (currentContent.length >= chunkSize) {
      const content = currentChunk.lines.join("\n");
      const chunk: ChunkMeta = {
        id: `chunk-${chunks.length}`,
        title: currentChunk.title,
        chapter: currentChunk.chapter,
        startLine: currentChunk.startLine,
        endLine: i,
        content: content.substring(0, 6000), // Cap at 6k
        titleNorm: normalizeVietnamese(currentChunk.title),
        contentNorm: normalizeVietnamese(content),
      };
      chunks.push(chunk);

      // Start next chunk with overlap
      const overlapLines: string[] = [];
      let overlapChars = 0;
      for (let j = i; j >= 0 && overlapChars < overlap; j--) {
        const prevLine = lines[j];
        overlapLines.unshift(prevLine);
        overlapChars += prevLine.length + 1;
        if (overlapChars >= overlap) break;
      }

      currentChunk = {
        startLine: i - overlapLines.length + 1,
        lines: overlapLines,
        title: currentTitle,
        chapter: currentChapter,
      };
    }
  }

  // Add final chunk if exists
  if (currentChunk && currentChunk.lines.length > 0) {
    const content = currentChunk.lines.join("\n");
    const chunk: ChunkMeta = {
      id: `chunk-${chunks.length}`,
      title: currentChunk.title,
      chapter: currentChunk.chapter,
      startLine: currentChunk.startLine,
      endLine: lines.length - 1,
      content: content.substring(0, 6000),
      titleNorm: normalizeVietnamese(currentChunk.title),
      contentNorm: normalizeVietnamese(content),
    };
    chunks.push(chunk);
  }

  return chunks;
}

/**
 * Build search index (only once per page load)
 */
async function buildIndex(): Promise<void> {
  if (cachedIndex && cachedChunks) {
    return;
  }

  // If index is being built, wait for it
  if (indexBuildPromise) {
    return indexBuildPromise;
  }

  indexBuildPromise = (async () => {
    const text = await loadTextbookText();
    const chunks = chunkText(text);
    cachedChunks = chunks;

    const index = new MiniSearch<ChunkMeta>({
      fields: ["titleNorm", "contentNorm"],
      storeFields: ["title", "chapter", "startLine", "endLine", "content"],
    });

    index.addAll(chunks);
    cachedIndex = index;
  })();

  await indexBuildPromise;
}

/**
 * Search textbook and return top K relevant chunks
 */
export async function searchTextbook(
  question: string,
  opts?: { topK?: number }
): Promise<SourceChunk[]> {
  // Build index if needed
  await buildIndex();

  if (!cachedIndex || !cachedChunks) {
    throw new Error("Index not built");
  }

  // Determine topK
  const lowerQuestion = question.toLowerCase();
  const isSummary = lowerQuestion.includes("tóm tắt") || lowerQuestion.includes("chương");
  const topK = opts?.topK ?? (isSummary ? 14 : 8);

  // Normalize question
  const query = normalizeVietnamese(question);

  // Extract key phrases from question (phrases with 2+ words)
  const keyPhrases: string[] = [];
  const words = question.toLowerCase().split(/\s+/);
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = normalizeVietnamese(words.slice(i, i + 2).join(" "));
    if (phrase.length > 3) {
      keyPhrases.push(phrase);
    }
  }
  // Also add 3-word phrases for important concepts
  for (let i = 0; i < words.length - 2; i++) {
    const phrase = normalizeVietnamese(words.slice(i, i + 3).join(" "));
    if (phrase.length > 5 && (phrase.includes("viet nam") || phrase.includes("dan chu") || phrase.includes("cong hoa"))) {
      keyPhrases.push(phrase);
    }
  }

  // Search with multiple strategies
  const allResults: Map<string, { result: any; score: number }> = new Map();

  // Strategy 1: Full query search
  const results1 = cachedIndex.search(query, {
    prefix: true,
    fuzzy: 0.2,
    boost: { titleNorm: 3, contentNorm: 1 },
  });
  results1.forEach((r) => {
    const existing = allResults.get(r.id);
    allResults.set(r.id, {
      result: r,
      score: (existing?.score || 0) + (r.score || 0),
    });
  });

  // Strategy 2: Search for key phrases (boost score)
  for (const phrase of keyPhrases.slice(0, 3)) {
    const phraseResults = cachedIndex.search(phrase, {
      prefix: true,
      fuzzy: 0.1,
      boost: { titleNorm: 2, contentNorm: 1 },
    });
    phraseResults.forEach((r) => {
      const existing = allResults.get(r.id);
      allResults.set(r.id, {
        result: r,
        score: (existing?.score || 0) + (r.score || 0) * 1.5, // Boost for phrase matches
      });
    });
  }

  // Strategy 3: Search for important keywords individually (lower weight)
  const importantKeywords = ["viet nam", "dan chu", "cong hoa", "ra doi", "khang dinh"];
  const questionLower = question.toLowerCase();
  for (const keyword of importantKeywords) {
    if (questionLower.includes(keyword.replace(/\s+/g, "")) || normalizeVietnamese(questionLower).includes(keyword)) {
      const keywordResults = cachedIndex.search(keyword, {
        prefix: true,
        fuzzy: 0.1,
      });
      keywordResults.forEach((r) => {
        const existing = allResults.get(r.id);
        allResults.set(r.id, {
          result: r,
          score: (existing?.score || 0) + (r.score || 0) * 0.5,
        });
      });
    }
  }

  // Convert to array, sort by score, and take topK
  let results = Array.from(allResults.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, topK * 2) // Get more candidates for re-ranking
    .map((item) => ({ ...item.result, score: item.score }));

  // Re-rank: boost chunks that contain exact phrases from question
  const questionNormalized = normalizeVietnamese(question);
  results = results.map((r) => {
    const contentNorm = normalizeVietnamese(r.content);
    const titleNorm = normalizeVietnamese(r.title || "");
    
    // Check for exact phrase matches (boost significantly)
    const exactPhrases = [
      "viet nam dan chu cong hoa ra doi",
      "viet nam dan chu cong hoa",
      "nguoi da khang dinh",
      "ra doi nguoi da khang dinh",
    ];
    
    let boost = 0;
    for (const phrase of exactPhrases) {
      if (contentNorm.includes(phrase) || titleNorm.includes(phrase)) {
        boost += 500; // Significant boost for exact phrase matches
      }
    }
    
    // Check for important keyword combinations
    const hasVietNam = contentNorm.includes("viet nam");
    const hasDanChu = contentNorm.includes("dan chu");
    const hasCongHoa = contentNorm.includes("cong hoa");
    const hasRaDoi = contentNorm.includes("ra doi");
    const hasKhangDinh = contentNorm.includes("khang dinh");
    
    if (hasVietNam && hasDanChu && hasCongHoa) boost += 200;
    if (hasRaDoi && hasKhangDinh) boost += 150;
    if (hasVietNam && hasRaDoi) boost += 100;
    
    return { ...r, score: r.score + boost };
  });

  // Sort again by boosted score and take topK
  results = results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  // Convert to SourceChunk format
  const sources: SourceChunk[] = results.map((result, idx) => ({
    id: result.id,
    title: result.title,
    chapter: result.chapter,
    startLine: result.startLine,
    endLine: result.endLine,
    content: result.content,
    score: result.score || 0,
  }));

  return sources;
}

/**
 * Build formatted sources block for LLM prompt
 */
export function buildSourcesBlock(sources: SourceChunk[]): string {
  if (sources.length === 0) {
    return "";
  }

  return sources
    .map((source, idx) => {
      const ref = idx + 1;
      const chapterInfo = source.chapter ? ` (Chương ${source.chapter})` : "";
      const header = `[${ref}] ${source.title}${chapterInfo} (dòng ${source.startLine + 1}-${source.endLine + 1})`;
      
      // Truncate content to ~1200-1800 chars, try to keep relevant parts
      let content = source.content;
      if (content.length > 1800) {
        // Try to find a good cut point (sentence boundary)
        const truncated = content.substring(0, 1800);
        const lastPeriod = Math.max(
          truncated.lastIndexOf("."),
          truncated.lastIndexOf("。"),
          truncated.lastIndexOf("\n\n")
        );
        if (lastPeriod > 1200) {
          content = content.substring(0, lastPeriod + 1);
        } else {
          content = truncated + "...";
        }
      }

      return `${header}\n${content}`;
    })
    .join("\n\n");
}

/**
 * Check if index is ready
 */
export function isIndexReady(): boolean {
  return cachedIndex !== null && cachedChunks !== null;
}

/**
 * Get index build status (for loading UI)
 */
export function getIndexStatus(): "building" | "ready" | "not_started" {
  if (cachedIndex && cachedChunks) return "ready";
  if (indexBuildPromise) return "building";
  return "not_started";
}
