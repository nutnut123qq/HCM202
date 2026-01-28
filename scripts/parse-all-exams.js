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

// Parse all three exam files
const fa25Path = path.join(__dirname, '../HCM/HCM202 - FA25 - FE - Half1.txt');
const sp2025Path = path.join(__dirname, '../HCM/HCM202 - SP 2025 - FE.txt');
const su25Path = path.join(__dirname, '../HCM/HCM202 - SU25 - B5 - Final Exam.txt');

const fa25Content = fs.readFileSync(fa25Path, 'utf8');
const sp2025Content = fs.readFileSync(sp2025Path, 'utf8');
const su25Content = fs.readFileSync(su25Path, 'utf8');

const fa25Questions = parseExamFile(fa25Content);
const sp2025Questions = parseExamFile(sp2025Content);
const su25Questions = parseExamFile(su25Content);

// Create output with all three exports
const output = `// This file is auto-generated. Do not edit manually.
import type { Question } from '@/lib/parseExam';

export const fa25FeHalf1Questions: Question[] = ${JSON.stringify(fa25Questions, null, 2)};

export const sp2025FeQuestions: Question[] = ${JSON.stringify(sp2025Questions, null, 2)};

export const su25B5FinalExamQuestions: Question[] = ${JSON.stringify(su25Questions, null, 2)};
`;

// Write to exams.ts
const examsFilePath = path.join(__dirname, '../src/data/exams.ts');
fs.writeFileSync(examsFilePath, output, 'utf8');

console.log(`Parsed ${fa25Questions.length} questions from FA25 - FE - Half1`);
console.log(`Parsed ${sp2025Questions.length} questions from SP 2025 - FE`);
console.log(`Parsed ${su25Questions.length} questions from SU25 - B5 - Final Exam`);
console.log(`Total: ${fa25Questions.length + sp2025Questions.length + su25Questions.length} questions`);
