const fs = require('fs');
const path = require('path');

// Simple parser (simplified version of parseExam.ts logic)
function parseExamFile(content) {
  const lines = content.split('\n');
  const questions = [];
  
  let i = 0;
  let questionIndex = 1;
  
  while (i < lines.length) {
    // Skip empty lines at the start
    while (i < lines.length && !lines[i].trim()) {
      i++;
    }
    
    if (i >= lines.length) break;
    
    // Collect question text (can be multiple lines)
    const questionLines = [];
    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line) {
        i++;
        break;
      }
      // Check if this is an answer option (A. ...)
      if (/^[A-Z]\.\s/.test(line)) {
        break;
      }
      questionLines.push(line);
      i++;
    }
    
    if (questionLines.length === 0) {
      continue;
    }
    
    const questionText = questionLines.join(' ');
    
    // Skip empty line before answers
    while (i < lines.length && !lines[i].trim()) {
      i++;
    }
    
    // Collect answers
    const answers = [];
    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line) {
        i++;
        continue;
      }
      
      // Check if this is an answer option
      const match = line.match(/^([A-Z])\.\s(.+)$/);
      if (match) {
        const label = match[1];
        const content = match[2];
        answers.push({ label, content });
        i++;
        // Skip empty line after answer if exists
        if (i < lines.length && !lines[i].trim()) {
          i++;
        }
      } else {
        // Not an answer, might be the correct answer line
        break;
      }
    }
    
    // Skip empty lines before correct answer
    while (i < lines.length && !lines[i].trim()) {
      i++;
    }
    
    // Find correct answer(s)
    const correctAnswers = [];
    if (i < lines.length) {
      const answerLine = lines[i].trim();
      // Check if this line contains answer (A, B, C, D or A,B,C)
      const answerMatch = answerLine.match(/^([A-Z](?:,\s*[A-Z])*)\s*$/);
      if (answerMatch) {
        const answerStr = answerMatch[1];
        const answerLabels = answerStr.split(',').map(a => a.trim());
        correctAnswers.push(...answerLabels);
        i++;
      }
    }
    
    if (questionText && answers.length > 0 && correctAnswers.length > 0) {
      questions.push({
        id: `q${questionIndex}`,
        questionText,
        answers,
        correctAnswers,
      });
      questionIndex++;
    }
  }
  
  return questions;
}

// Simple spelling fix function (basic version)
function fixSpelling(text) {
  if (!text) return text;
  
  const corrections = {
    // Fix duplicate characters first
    "vị kỷỷ": "vị kỷ",
    "vị kỷỷỳ": "vị kỳ",
    "kỷỷ": "kỷ",
    "kỷỷỳ": "kỳ",
    // Multi-word phrases (longer first)
    "Chủ nghĩa vị k": "Chủ nghĩa vị kỷ",
    "chủ nghĩa vị k": "chủ nghĩa vị kỷ",
    "Đời sống moi": "Đời sống mới",
    "chi biết": "chỉ biết",
    "Chi biết": "Chỉ biết",
    "chi thấy": "chỉ thấy",
    "Chi thấy": "Chỉ thấy",
    "sau đay": "sau đây",
    "Sau đay": "Sau đây",
    "tính chat": "tính chất",
    "Tính chat": "Tính chất",
    "vấn đe": "vấn đề",
    "Vấn đe": "Vấn đề",
    "luan điểm": "luận điểm",
    "Luan điểm": "Luận điểm",
    "trừ bò": "trừ bỏ",
    "Trừ bò": "Trừ bỏ",
    "đoi song": "đời sống",
    "Đoi song": "Đời sống",
    "tinh than": "tinh thần",
    "Tinh than": "Tinh thần",
    "lào": "lao",
    "Lào": "Lao",
    "xa hoi": "xã hội",
    "Xa hoi": "Xã hội",
    // Single words
    "cac": "các", "nao": "nào", "phai": "phải", "Phai": "Phải",
    "noi": "nói", "Noi": "Nói", "ve": "về", "Ve": "Về",
    "cua": "của", "Cua": "Của", "nen": "nền", "Nen": "Nền",
    "la": "là", "La": "Là", "yeu to": "yếu tố", "Yeu to": "Yếu tố",
    "van hoa": "văn hóa", "Van hoa": "Văn hóa", "mot": "một", "Mot": "Một",
    "thuoc": "thuộc", "Thuoc": "Thuộc",
  };
  
  let fixed = text;
  
  // Fix duplicate characters first
  fixed = fixed.replace(/kỷỷ+/g, 'kỷ');
  fixed = fixed.replace(/kỳỳ+/g, 'kỳ');
  
  // Sort by length descending to match longer phrases first
  const sortedKeys = Object.keys(corrections).sort((a, b) => b.length - a.length);
  
    // Only replace once per key to avoid double replacements
    for (const key of sortedKeys) {
      const isPhrase = key.includes(' ');
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // For phrases or words that might be part of other words, don't use word boundary
      // For single words that should be exact matches, use word boundary
      const useWordBoundary = !isPhrase && !['lào', 'Lào'].includes(key);
      const pattern = useWordBoundary
        ? new RegExp(`\\b${escapedKey}\\b`, 'g')
        : new RegExp(escapedKey, 'g');
      
      fixed = fixed.replace(pattern, (match) => {
        const correction = corrections[key];
        // Preserve case of first letter
        if (match[0] === match[0].toUpperCase()) {
          return correction.charAt(0).toUpperCase() + correction.slice(1);
        }
        return correction;
      });
    }
  
  return fixed;
}

// Read and parse
const filePath = path.join(__dirname, '../HCM/HCM202 - FA25 - FE - Half1.txt');
const content = fs.readFileSync(filePath, 'utf8');
const questions = parseExamFile(content);

// Output as TypeScript (no spelling fixes - file has been corrected directly)
const output = `// This file is auto-generated. Do not edit manually.
import type { Question } from '@/lib/parseExam';

export const fa25FeHalf1Questions: Question[] = ${JSON.stringify(questions, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/data/exams.ts'), output, 'utf8');
console.log(`Parsed ${questions.length} questions`);
