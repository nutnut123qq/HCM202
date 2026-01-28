import Link from "next/link";

const promptSamples = [
  "Tạo bố cục trang công bố sử dụng AI với các mục rõ ràng",
  "Thiết kế card hiển thị từng phần cam kết liêm chính học thuật",
  "Tạo nút điều hướng nhỏ ở góc trang chủ",
  "Cải thiện khả năng đọc với spacing và phân cấp tiêu đề",
  "Đề xuất biểu tượng phù hợp cho từng mục nội dung",
  "Tối ưu màu sắc để trang mang cảm giác học thuật, trang trọng",
];

export default function AiDeclarationPage() {
  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_#fff7e7,_#f6efe2_40%,_#e7eef2_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(120deg,rgba(15,23,42,0.04)_0%,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(300deg,rgba(15,23,42,0.03)_0%,rgba(15,23,42,0.03)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-14 sm:px-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600 transition-colors hover:text-slate-900"
          >
            <span className="text-lg">↩</span>
            Trang chủ
          </Link>
          <div className="rounded-full border border-slate-300/70 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 shadow-sm">
            AI Usage
          </div>
        </div>

        <header className="rounded-3xl border border-slate-200/70 bg-white/70 p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.5)] backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-600">
                ⭐ KHAI BÁO SỬ DỤNG AI
              </p>
              <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-slate-900 sm:text-4xl">
                Cam kết liêm chính học thuật
              </h1>
            </div>
            <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white shadow-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                Dự án
              </p>
              <p className="mt-2 text-lg font-semibold">HCM202</p>
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-sm text-slate-600 sm:text-base">
            Trang này tóm tắt cách AI được sử dụng trong quá trình xây dựng dự
            án. Mục tiêu là minh bạch vai trò của công cụ hỗ trợ kỹ thuật và
            bảo đảm các nội dung học thuật do nhóm tự biên soạn.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-7 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.6)]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛠️</span>
              <h2 className="text-lg font-bold">1. Công cụ đã sử dụng</h2>
            </div>
            <p className="mt-4 text-sm text-slate-700">
              Trợ lý AI (Codex/GPT) được dùng để hỗ trợ viết mã, chỉnh sửa giao
              diện, và tổ chức cấu trúc trang. AI chỉ đóng vai trò hỗ trợ kỹ
              thuật trong quá trình phát triển ứng dụng.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <h2 className="text-lg font-bold">2. Mục đích sử dụng</h2>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>▸ Hỗ trợ lập trình giao diện và cấu trúc trang.</li>
              <li>▸ Gợi ý cách tổ chức layout, component, và luồng điều hướng.</li>
              <li>
                ▸ AI <span className="font-semibold text-slate-900">không</span>{" "}
                tạo nội dung học thuật, câu hỏi, hay kiến thức chuyên môn.
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-7 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.6)]">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <h2 className="text-lg font-bold">3. Kết quả AI đã sinh ra</h2>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>✓ Mã nguồn React/TypeScript cho các thành phần giao diện.</li>
                <li>✓ Bố cục trang hiển thị đề thi và các trang phụ trợ.</li>
                <li>✓ Gợi ý cấu trúc Tailwind CSS và lớp tiện ích.</li>
                <li>✓ Cải thiện UX như nút điều hướng, hiển thị trạng thái.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-slate-900 p-7 text-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.8)]">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📝</span>
                <h2 className="text-lg font-bold">Ví dụ lệnh đã dùng (Prompts)</h2>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                {promptSamples.map((prompt) => (
                  <li key={prompt} className="flex items-start gap-2">
                    <span className="text-amber-300">•</span>
                    <span>{prompt}</span>
                  </li>
                ))}
                <li className="flex items-start gap-2">
                  <span className="text-amber-300">•</span>
                  <span>... và nhiều lệnh hỗ trợ khác trong quá trình phát triển</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-7 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.6)]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✍️</span>
            <h2 className="text-lg font-bold">4. Phần nhóm tự biên soạn</h2>
          </div>
          <p className="mt-4 text-sm text-slate-700">
            100% nội dung học thuật bao gồm câu hỏi, đáp án, và kiến thức môn
            học được nhóm tự nghiên cứu, biên soạn từ giáo trình và tài liệu giảng
            dạy. AI không tham gia tạo nội dung chuyên môn.
          </p>
        </section>

        <section className="rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-white to-amber-100 p-7 shadow-[0_20px_50px_-40px_rgba(217,119,6,0.5)]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤝</span>
            <h2 className="text-lg font-bold text-amber-900">
              5. Cam kết liêm chính học thuật
            </h2>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-amber-900/90">
            <li>
              ⚠️ AI chỉ là công cụ hỗ trợ kỹ thuật; không thay thế việc nghiên cứu
              và biên soạn nội dung học thuật của nhóm.
            </li>
            <li>
              ✓ Mọi kiến thức chuyên môn, câu hỏi, nội dung giảng dạy đều do nhóm
              tự chịu trách nhiệm và kiểm duyệt.
            </li>
            <li>
              ✓ Sản phẩm cuối cùng được nhóm rà soát, đảm bảo tính chính xác về
              học thuật.
            </li>
          </ul>
        </section>

        <footer className="text-center text-xs uppercase tracking-[0.3em] text-slate-500">
          Minh bạch &mdash; Tôn trọng học thuật &mdash; Trách nhiệm với tri thức
        </footer>
      </div>
    </div>
  );
}
