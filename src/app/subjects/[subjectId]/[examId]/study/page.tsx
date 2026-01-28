"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fa25FeHalf1Questions, sp2025FeQuestions, su25B5FinalExamQuestions } from "@/data/exams";
import { fixSpelling } from "@/lib/parseExam";
import type { Question } from "@/lib/parseExam";

// Apply spelling fixes to all questions on load
const applySpellingFixes = (questions: Question[]): Question[] => {
  return questions.map(q => ({
    ...q,
    questionText: fixSpelling(q.questionText),
    answers: q.answers.map(a => ({
      ...a,
      content: fixSpelling(a.content),
    })),
  }));
};

// Map exam IDs to question sets (with spelling fixes applied)
const examQuestionsMap: Record<string, Question[]> = {
  "de-1": applySpellingFixes(fa25FeHalf1Questions),
  "de-2": applySpellingFixes(sp2025FeQuestions),
  "de-3": applySpellingFixes(su25B5FinalExamQuestions),
};

export default function StudyPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const examId = params.examId as string;

  const questions = examQuestionsMap[examId] || [];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, string[]>>({});

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy đề thi
          </h1>
          <Link
            href="/"
            className="text-primary hover:underline"
          >
            Quay lại
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentSelected = selectedAnswers[currentQuestion.id] || [];
  const currentRevealed = revealedAnswers[currentQuestion.id] || [];
  const correctAnswers = currentQuestion.correctAnswers;

  const handleAnswerClick = (label: string) => {
    const questionId = currentQuestion.id;
    if (showAnswers) {
      // When answers are shown, allow selecting answers
      if (currentSelected.includes(label)) {
        setSelectedAnswers((prev) => ({
          ...prev,
          [questionId]: currentSelected.filter((a) => a !== label),
        }));
      } else {
        setSelectedAnswers((prev) => ({
          ...prev,
          [questionId]: [...currentSelected, label],
        }));
      }
    } else {
      // When answers are hidden, click to reveal
      if (!currentRevealed.includes(label)) {
        const isWrong = !correctAnswers.includes(label);
        if (isWrong) {
          const allRevealed = Array.from(new Set([...currentRevealed, label, ...correctAnswers]));
          setRevealedAnswers((prev) => ({ ...prev, [questionId]: allRevealed }));
        } else {
          setRevealedAnswers((prev) => ({ ...prev, [questionId]: [...currentRevealed, label] }));
        }
      }
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((i) => i - 1);
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex((i) => i + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-primary mb-4 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Quay lại
          </Link>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {subjectId} - Study Mode
              </h1>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-gray-700 font-medium">
                    Hiển thị đáp án đúng
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showAnswers}
                      onChange={(e) => {
                        setShowAnswers(e.target.checked);
                        // Reset revealed answers when hiding answers
                        if (!e.target.checked) {
                          setRevealedAnswers({});
                        }
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`
                        w-14 h-7 rounded-full transition-colors duration-200 ease-in-out
                        ${showAnswers ? "bg-blue-500" : "bg-gray-300"}
                      `}
                    >
                      <div
                        className={`
                          w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out
                          ${showAnswers ? "translate-x-7" : "translate-x-1"}
                          mt-0.5
                        `}
                      />
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Question card - hiển thị câu hiện tại + số câu */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            <span className="text-blue-600 font-bold mr-2">
              Câu {currentQuestionIndex + 1}.
            </span>
            {currentQuestion.questionText}
          </h2>

          <div className="space-y-3">
            {currentQuestion.answers.map((answer) => {
              const isCorrect = correctAnswers.includes(answer.label);
              const isSelected = currentSelected.includes(answer.label);
              const isRevealed = currentRevealed.includes(answer.label);
              const showCorrectStatus = showAnswers ? isCorrect : (isRevealed && isCorrect);
              const showWrongStatus = showAnswers
                ? (isSelected && !isCorrect)
                : (isRevealed && !isCorrect);
              const showSelectedStatus = showAnswers ? isSelected : false;

              return (
                <div
                  key={answer.label}
                  onClick={() => handleAnswerClick(answer.label)}
                  className={`
                    rounded-lg border-2 p-4 cursor-pointer transition-all
                    ${
                      showCorrectStatus && isCorrect
                        ? "border-green-500 bg-green-50"
                        : showWrongStatus
                        ? "border-red-500 bg-red-50"
                        : showSelectedStatus
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold
                        ${
                          showCorrectStatus && isCorrect
                            ? "bg-green-500 text-white"
                            : showWrongStatus
                            ? "bg-red-500 text-white"
                            : showSelectedStatus
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700"
                        }
                      `}
                    >
                      {answer.label}
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <div
                        className={`text-gray-800 ${
                          (showCorrectStatus && isCorrect) || showWrongStatus ? "font-medium" : ""
                        }`}
                      >
                        {answer.content}
                      </div>
                      {showCorrectStatus && isCorrect && (
                        <div className="flex items-center gap-1 text-green-600 flex-shrink-0">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm font-medium">Đúng</span>
                        </div>
                      )}
                      {showWrongStatus && (
                        <div className="flex items-center gap-1 text-red-600 flex-shrink-0">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm font-medium">Sai</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination - chỉ hiển thị X/Y như Quizlet, không thanh cuộn */}
        <div className="flex items-center justify-between gap-4 bg-white rounded-lg shadow-md p-4">
          <button
            onClick={goToPrevious}
            disabled={currentQuestionIndex === 0}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${
                currentQuestionIndex === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }
            `}
          >
            ← Câu trước
          </button>

          <span className="text-gray-700 font-medium tabular-nums">
            {currentQuestionIndex + 1} / {questions.length}
          </span>

          <button
            onClick={goToNext}
            disabled={currentQuestionIndex === questions.length - 1}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${
                currentQuestionIndex === questions.length - 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }
            `}
          >
            Câu sau →
          </button>
        </div>
      </div>
    </div>
  );
}
