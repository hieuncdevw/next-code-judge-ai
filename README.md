# Next Code Judge AI

## Tên đề tài

Phát triển hệ thống luyện tập lập trình trực tuyến tích hợp chấm bài tự động và trợ lý AI.

## Mô tả

Next Code Judge AI là hệ thống luyện tập lập trình cho phép người dùng xem danh sách bài tập, đọc chi tiết bài, viết code trong workspace, chạy thử qua Judge0, lưu lịch sử nộp bài vào database và nhận hỗ trợ từ AI theo ngữ cảnh bài đang làm.

## Công nghệ sử dụng

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Shadcn-style UI
- Clerk
- Prisma
- PostgreSQL
- Judge0
- AI SDK với Gemini/OpenAI

## Các route hiện có

- `/home`: Trang dashboard học tập.
- `/problems`: Danh sách bài tập.
- `/problems/[slug]`: Trang chi tiết bài tập.
- `/workspace`: Workspace giải bài, viết code, chạy code, xem kết quả và lịch sử nộp bài.
- `/discuss`: Trang placeholder cho thảo luận cộng đồng.
- `/admin`: Trang placeholder cho Admin Dashboard.

## Tính năng đã triển khai

- Danh sách bài tập.
- Trang chi tiết bài tập.
- Workspace giải bài với đề bài, editor, console và kết quả chạy code.
- Chạy code qua Judge0 cho các bài core được hỗ trợ.
- Lưu lịch sử nộp bài vào database gồm `Submission`, `TestCaseResult` và `ProblemProgress`.
- Hiển thị lịch sử nộp bài trong workspace theo user và bài hiện tại.
- AI chat đã được nối context từ workspace gồm thông tin bài, ngôn ngữ và code hiện tại.
- Trang Discuss placeholder cho MVP/demo.
- Trang Admin placeholder cho MVP/demo, chưa có thao tác CRUD phá hủy dữ liệu.
- Seed 15 bài tập.

## Trạng thái xác minh

- Prisma migration: **PASS**.
- Seed 15 bài tập: **PASS**.
- DB persistence qua local dev fallback: **PASS**.
- Real Clerk browser session: **NEEDS RETEST** do lỗi local `session-token-expired-refresh-invalid-session-token`.

## Giới hạn hiện tại

- Chỉ một số bài core hỗ trợ chạy code đầy đủ: `two-sum`, `valid-parentheses`, `palindrome-number`.
- Các bài còn lại đang ở chế độ display-only.
- Real Clerk session cần test lại bằng browser/profile sạch hoặc deployment domain.
- Production AI rate limit bằng shared storage là backlog.
- Discuss backend và Admin CRUD chưa được triển khai.

## Lệnh phát triển

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
npm run verify
```

## Script kiểm tra cục bộ

- `scratch/verify-db-persistence-dev-fallback.ts`: Kiểm tra lưu database qua local dev fallback.
- `scratch/verify-judge0.ts`: Kiểm tra kết nối và chạy code qua Judge0.
- `scratch/verify-ai-stream.ts`: Kiểm tra luồng phản hồi AI.
