"use client";

import Link from "next/link";

const subjects = [
  {
    id: "HCM202",
    name: "HCM202",
    exams: [
      { id: "fa25-fe-half1", name: "FA25 - FE - Half1" },
      { id: "sp2025-fe", name: "SP 2025" },
    ],
  },
  {
    id: "MLN131",
    name: "MLN131",
    exams: [
      { id: "fa25-re", name: "FA25 RE" },
      { id: "su25-re", name: "SU25 RE" },
      { id: "su25-fe", name: "SU25 FE" },
      { id: "su25sbtk", name: "SU25SBTK" },
      { id: "sp25-fe", name: "SP25 FE" },
    ],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hệ thống quản lý đề thi
          </h1>
          <p className="text-lg text-gray-600">
            Chọn môn học để xem danh sách đề thi
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/subjects/${subject.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 border-2 border-transparent hover:border-primary">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {subject.name}
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
                <p className="text-sm text-gray-500 mb-2">
                  {subject.exams.length} đề thi
                </p>
                <div className="flex flex-wrap gap-2">
                  {subject.exams.slice(0, 2).map((exam) => (
                    <span
                      key={exam.id}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {exam.name}
                    </span>
                  ))}
                  {subject.exams.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{subject.exams.length - 2} đề khác
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
