"use client";

import Link from "next/link";

const hcmExams = [
  { id: "de-1", name: "Đề 1" },
  { id: "de-2", name: "Đề 2" },
  { id: "de-3", name: "Đề 3" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Link
        href="/ai-declaration"
        className="fixed bottom-6 right-6 z-20 flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-lg transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900"
      >
        <span className="text-sm">⭐</span>
        AI
      </Link>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hệ thống ôn tập môn Tư tưởng Hồ Chí Minh
          </h1>
          <p className="text-lg text-gray-600">
            Chọn đề thi để bắt đầu học tập
          </p>
        </div>

        {/* Chatbot Link */}
        <div className="mb-8 max-w-4xl mx-auto">
          <Link
            href="/chatbot"
            className="block group"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 border-2 border-transparent hover:border-purple-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-1">
                      Chatbot AI - Giáo trình HCM
                    </h2>
                    <p className="text-white/90">
                      Đặt câu hỏi về giáo trình Tư tưởng Hồ Chí Minh
                    </p>
                  </div>
                </div>
                <svg
                  className="w-6 h-6 text-white group-hover:translate-x-1 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* HCM Exams */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {hcmExams.map((exam) => (
            <Link
              key={exam.id}
              href={`/subjects/HCM202/${exam.id}/study`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 border-2 border-transparent hover:border-primary">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {exam.name}
                  </h2>
                  <svg
                    className="w-6 h-6 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">
                  Đề thi HCM202
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
