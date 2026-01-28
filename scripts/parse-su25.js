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

// Read and parse SU25 file
const filePath = path.join(__dirname, '../HCM/HCM202 - SU25 - B5 - Final Exam.txt');
const content = fs.readFileSync(filePath, 'utf8');
const questions = parseExamFile(content);

// Read existing exams.ts file
const examsFilePath = path.join(__dirname, '../src/data/exams.ts');
const existingContent = fs.readFileSync(examsFilePath, 'utf8');

// Add new export for SU25 questions
const newExport = `\n\nexport const su25B5FinalExamQuestions: Question[] = ${JSON.stringify(questions, null, 2)};\n`;

// Append to existing file
fs.appendFileSync(examsFilePath, newExport, 'utf8');
console.log(`Parsed ${questions.length} questions and added to exams.ts`);
