# FE-HCM

Dự án frontend quản lý đề thi HCM, sử dụng Next.js 16.

## Tính năng

- Trang home hiển thị 2 môn học: HCM202, MLN131
- Trang chi tiết môn học hiển thị danh sách đề thi

## Cài đặt

```bash
npm install
```

## Chạy dự án

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

## Cấu trúc dự án

```
FE-HCM/
├── src/
│   └── app/
│       ├── layout.tsx
│       ├── page.tsx          # Trang home
│       ├── globals.css
│       └── subjects/
│           └── [subjectId]/
│               └── page.tsx  # Trang chi tiết môn học
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.js
```
