"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const subjectsData: Record<
  string,
  { name: string; exams: { id: string; name: string }[] }
> = {
  HCM202: {
    name: "HCM202",
    exams: [
      { id: "fa25-fe-half1", name: "FA25 - FE - Half1" },
      { id: "sp2025-fe", name: "SP 2025" },
    ],
  },
  MLN131: {
    name: "MLN131",
    exams: [
      { id: "fa25-re", name: "FA25 RE" },
      { id: "su25-re", name: "SU25 RE" },
      { id: "su25-fe", name: "SU25 FE" },
      { id: "su25sbtk", name: "SU25SBTK" },
      { id: "sp25-fe", name: "SP25 FE" },
    ],
  },
};

export default function SubjectPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const subject = subjectsData[subjectId];

  if (!subject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy môn học
          </h1>
          <Link
            href="/"
            className="text-primary hover:underline"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-primary mb-8 transition-colors"
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
          Quay lại trang chủ
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {subject.name}
            </h1>
            <p className="text-gray-600">
              Danh sách đề thi ({subject.exams.length} đề)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subject.exams.map((exam) => (
              <Link
                key={exam.id}
                href={`/subjects/${subjectId}/${exam.id}/study`}
                className="block"
              >
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 border-2 border-transparent hover:border-primary cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {exam.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Đề thi {subject.name}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
