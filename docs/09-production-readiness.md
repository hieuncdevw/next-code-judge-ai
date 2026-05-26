# Báo cáo Sẵn sàng Sản xuất (Production Readiness Report)

Tài liệu này đánh giá tính sẵn sàng cho môi trường production của dự án **Next Code Judge AI**, bao gồm kết quả kiểm thử biên dịch, trạng thái tích hợp dịch vụ, và các lưu ý quan trọng khi vận hành thực tế.

---

## 1. Tài liệu liên quan (Related Documents)

Để hiểu rõ hơn về các thành phần kỹ thuật chi tiết của hệ thống, vui lòng tham khảo các tài liệu chuyên sâu dưới đây:
* **Quy trình chấm bài**: [Quy trình chấm bài qua Judge0 (docs/05-judge0-flow.md)](file:///d:/next-code-judge-ai/docs/05-judge0-flow.md)
* **Thiết kế Trợ lý AI**: [Thiết kế Trợ lý AI (docs/06-ai-agent-design.md)](file:///d:/next-code-judge-ai/docs/06-ai-agent-design.md)
* **Nhật ký sửa lỗi**: [Nhật ký Sửa lỗi (docs/08-debug-notes.md)](file:///d:/next-code-judge-ai/docs/08-debug-notes.md)
* **Tài liệu Prompts**: [docs/11-prompts.md](file:///d:/next-code-judge-ai/docs/11-prompts.md) là bộ sưu tập các System Prompt cũ dùng để tham khảo lịch sử.

---

## 2. Trạng thái Kiểm tra & Biên dịch (Compilation Verification)

Các lệnh kiểm tra chất lượng mã nguồn và xây dựng bản build sản xuất đã được thực thi và xác nhận hoàn tất thành công.

| Loại kiểm tra | Lệnh thực thi | Trạng thái | Chi tiết kết quả |
| :--- | :--- | :---: | :--- |
| **TypeScript Check** | `npx tsc --noEmit` | ✅ ĐẠT | Không phát hiện lỗi kiểu dữ liệu (0 errors). Tất cả imports, models và Server Actions đều được kiểm tra kiểu chặt chẽ. |
| **Linter Check** | `npm run lint` | ✅ ĐẠT | Mã nguồn tuân thủ đầy đủ các quy tắc định dạng và tiêu chuẩn của dự án. |
| **Production Build** | `npm run build` | ✅ ĐẠT | Biên dịch ứng dụng Next.js thành công. Các trang tĩnh được prerender suôn sẻ mà không bị chặn bởi lỗi cơ sở dữ liệu. |

---

## 3. Trạng thái Tích hợp Dịch vụ (Service Integrations)

Tất cả các thành phần cốt lõi và tích hợp bên thứ ba đã được kiểm thử và xác nhận hoạt động ổn định.

### 3.1. Trợ lý AI (Gemini AI Agent)
* **Luồng truyền dữ liệu thực tế (Real Streaming)**: Đã xác minh tính năng truyền dữ liệu dạng luồng (streaming) hoạt động chính xác. API Route `/api/ai/chat` sử dụng `ReadableStream` để đẩy từng token về giao diện người dùng theo thời gian thực.
* **Trải nghiệm người dùng (UX)**: Ô nhập liệu được vô hiệu hóa khi AI đang trả lời, con trỏ nhấp nháy hiển thị sinh động và khung chat tự động cuộn xuống cuối khi có tin nhắn mới.
* **Ngữ cảnh (Context Injection)**: Đã kiểm chứng việc AI nhận biết đầy đủ thông tin bài tập hiện tại (tiêu đề, mô tả, ràng buộc), mã nguồn hiện tại trong trình biên tập và ngôn ngữ đang chọn để đưa ra các gợi ý và giải thích chính xác.
* *Chi tiết xem tại:* [Thiết kế Trợ lý AI (docs/06-ai-agent-design.md)](file:///d:/next-code-judge-ai/docs/06-ai-agent-design.md)

### 3.2. Hệ thống Chấm bài (Judge0 Sandbox)
* **Kết nối qua RapidAPI**: Xác minh cuộc gọi thực tế qua cổng RapidAPI diễn ra trơn tru đối với gói Judge0 CE.
* **Mở rộng tập dữ liệu (Dataset Expansion)**: Tập dữ liệu bài tập đã được mở rộng lên **15 bài tập** (6 Dễ, 6 Trung bình, 3 Khó).
  - **3 bài tập cốt lõi (Executable)**: \`two-sum\`, \`valid-parentheses\`, \`palindrome-number\` đã được tích hợp driver chấm bài đầy đủ trên Judge0.
  - **12 bài tập mở rộng (Display-only)**: Hiển thị đầy đủ thông tin chi tiết (đề bài, ví dụ, ràng buộc, template code, ca kiểm thử mẫu) trên giao diện Workspace. Khi chạy code, hệ thống sẽ trả về trạng thái chỉ hiển thị \`DISPLAY_ONLY\` kèm thông báo hướng dẫn thân thiện, không gọi API Judge0 hay ghi cơ sở dữ liệu.
* **Xử lý các trạng thái chấm bài**:
  - **Accepted (AC)**: Trả về kết quả chính xác khi mã nguồn vượt qua mọi testcase.
  - **Wrong Answer (WA)**: Hiển thị đúng sự sai lệch giữa kết quả thực tế (Actual Output) và kết quả kỳ vọng (Expected Output).
  - **Syntax Error / Runtime Error**: Nhận diện tốt lỗi cú pháp (SyntaxError) trong Node.js và hiển thị chi tiết thông báo lỗi từ stderr.
* **Cơ chế chống nghẽn (Rate Limit Guard)**: Xác minh cơ chế thực thi tuần tự (sequential execution) kết hợp với khoảng trễ (\`RAPIDAPI_SUBMIT_DELAY_MS\` và \`RAPIDAPI_POLL_DELAY_MS\`) hoạt động hoàn hảo, không còn xảy ra lỗi 429 trên môi trường RapidAPI Free/Basic.
* *Chi tiết xem tại:* [Quy trình chấm bài qua Judge0 (docs/05-judge0-flow.md)](file:///d:/next-code-judge-ai/docs/05-judge0-flow.md)

### 3.3. Xác thực & Cơ sở dữ liệu (Auth & DB Sync)
* **Quy tắc bảo mật bắt buộc**:
  - Người dùng chưa đăng nhập (guest) có thể xem danh sách bài tập và chi tiết bài tập công khai.
  - Tuy nhiên, việc chạy thử code, nộp bài, hoặc xem lịch sử bài nộp cá nhân đòi hỏi phải đăng nhập thành công. Hành động chạy/nộp bài chưa xác thực sẽ trả về lỗi `'UNAUTHORIZED'` ("Login Required") trực tiếp từ Server Action và không được gọi Judge0 hay ghi vào cơ sở dữ liệu.
* **Lưu trữ CSDL**: Kết quả chấm bài (`Submission` và `TestCaseResult`) được lưu trữ đồng bộ vào PostgreSQL đối với người dùng đã xác thực. Khi kết quả là `ACCEPTED`, tiến trình của người dùng được cập nhật trong bảng `ProblemProgress`.
* **Xác thực người dùng**: Đồng bộ hóa chính xác người dùng đăng nhập qua Clerk với bảng `UserProfile` trong cơ sở dữ liệu.
* **Giao diện xác thực Clerk (Clerk Auth UI)**: Đã tích hợp các thành phần giao diện của Clerk (`SignInButton`, `SignUpButton`, `UserButton` kết hợp với `<Show>`) ở chế độ modal trong thanh tiêu đề điều hướng (`NavHeader`) và giao diện chạy thử code (`ConsolePanel` - nút đăng nhập trong cảnh báo unauthenticated) giúp người dùng thực hiện đăng nhập hoặc đăng ký một cách tiện lợi trực tiếp trên trang.
* **Cơ chế chịu lỗi & Hồ sơ nhà phát triển (Fallbacks)**:
  - Khi cơ sở dữ liệu ngoại tuyến (Offline): Hệ thống tự động chuyển sang sử dụng danh sách bài tập tĩnh (`MOCK_PROBLEMS`, `MOCK_PROBLEM_ROWS`), đảm bảo giao diện không bị sập.
  - Hồ sơ nhà phát triển mặc định (`developer@nextcodejudge.ai`) chỉ được phép kích hoạt khi ứng dụng chạy ở môi trường local development (`NODE_ENV === "development"`) và cờ `ALLOW_DEV_AUTH_FALLBACK === "true"` được bật rõ ràng. Nếu Clerk keys đã được cấu hình và người dùng chưa đăng nhập, hệ thống sẽ trả về trạng thái unauthenticated (null), không tự động login profile dev.

| Chỉ mục bảo mật & Đồng bộ | Hành vi / Quy tắc nghiệp vụ kỳ vọng | Trạng thái kiểm chứng | Chi tiết kết quả kiểm chứng |
| :--- | :--- | :---: | :--- |
| **Bảo vệ xác thực (Auth enforcement)** | Yêu cầu đăng nhập trước khi chạy code, nộp bài, hoặc xem lịch sử cá nhân. | **PASS** | Kiểm tra quyền của người dùng và chặn các luồng nghiệp vụ nhạy cảm ngay từ Server Action. |
| **Chặn nộp bài khách (Guest submit blocking)** | Khách hàng chưa đăng nhập bị chặn không cho gửi code tới Judge0 và không lưu bất cứ bản ghi nào vào DB. | **PASS** | `runCode` trả về sớm trạng thái `UNAUTHORIZED` khi phát hiện phiên làm việc của khách, hoàn toàn không gọi dịch vụ ngoài. |
| **An toàn Fallback (Developer fallback safety)** | Chỉ cho phép sử dụng Developer Profile khi thỏa mãn đồng thời hai biến môi trường cục bộ (`NODE_ENV=development` và `ALLOW_DEV_AUTH_FALLBACK=true`). Nếu có cấu hình Clerk keys nhưng chưa đăng nhập, trả về `null` thay vì fallback. | **PASS** | Đã được kiểm chứng nghiêm ngặt thông qua kịch bản kiểm thử tự động `verify-auth-rules.ts`. |
| **Đồng bộ CSDL thực tế (Real Clerk user persistence)** | Lưu thông tin người dùng Clerk thật, lịch sử nộp bài thật và tiến độ học tập thật vào cơ sở dữ liệu PostgreSQL. | **PENDING** | Chờ cấu hình đầy đủ biến môi trường Clerk thực tế trên môi trường chạy thử nghiệm hoặc sản xuất để tiến hành xác thực. |
| **Mở rộng tập dữ liệu (Dataset Expansion)** | Tập dữ liệu bài tập được mở rộng lên 15 bài để kiểm thử tìm kiếm, lọc và phân trang. | **PASS** | Đã cập nhật tệp seed.ts và cấu trúc dữ liệu fallback đồng bộ cho cả 15 bài tập. |
| **Xác minh dữ liệu tĩnh ngoại tuyến (Offline fallback)** | Danh sách bài tập vẫn hoạt động bình thường qua dữ liệu mock tĩnh khi database ngoại tuyến. | **PASS** | Đã kiểm chứng việc tìm kiếm, lọc theo tag, độ khó và phân trang chạy mượt mà ngay cả khi database bị ngắt kết nối. |
| **Khởi tạo dữ liệu thật (Real DB seed execution)** | Chạy tệp seed để đẩy toàn bộ dữ liệu 15 bài tập vào cơ sở dữ liệu thật bằng lệnh `npx prisma db seed`. | **PENDING** | Đang chờ PostgreSQL được kích hoạt hoạt động để thực hiện lệnh seed. Hiện tại tệp seed.ts đã cài đặt cơ chế upsert để tránh trùng lặp. |
| **Phạm vi chấm bài Judge0 (Judge0 execution)** | Hỗ trợ chấm điểm tự động thông qua Judge0 đối với các bài tập. | **PASS (3 core)** | Chỉ xác minh chạy code thành công cho 3 bài tập cốt lõi (Two Sum, Valid Parentheses, Palindrome Number) nhờ driver wrapper trong Server Action. |
| **Chế độ chỉ hiển thị (Display-only protection)** | 12 bài tập mở rộng được chặn chạy thử code an toàn để tránh lỗi thiếu driver wrapper. | **PASS (12 new)** | 12 bài tập mới tự động trả về lỗi `DISPLAY_ONLY` kèm hướng dẫn tiếng Việt, không gọi Judge0 API và không ghi cơ sở dữ liệu. |

* *Chi tiết lịch sử sửa các lỗi này xem tại:* [Nhật ký Sửa lỗi (docs/08-debug-notes.md)](file:///d:/next-code-judge-ai/docs/08-debug-notes.md)

### 3.4. Giao diện Người dùng (Workspace & Navigation)
* **Giao diện Workspace**:
  - Quản lý trạng thái các tab (Description, Submissions, Results) sử dụng cơ chế ẩn lớp (`hidden`) thay vì hủy gắn kết (unmount) component, giúp giữ nguyên trạng thái viết code và kết quả của người dùng.
  - Trình soạn thảo `EditorPanel` được điều khiển đồng bộ trạng thái (controlled state) với component cha, tự động đổi code mẫu khi chuyển ngôn ngữ hoặc bài tập.
  - Thanh cuộn của trình soạn thảo và gutter số dòng hoạt động đồng bộ hoàn hảo thông qua tham chiếu ref.
* **Điều hướng**:
  - Daily Challenge Card trên Dashboard và Recent Activity Feed sử dụng đường dẫn dựa trên `problemSlug` thay vì ID, điều hướng chính xác tới `/workspace?problem={slug}`.
  - Khả năng tự phục hồi: Nếu truy cập vào bài tập không tồn tại hoặc slug rỗng, hệ thống tự động chuyển hướng hoặc fallback về bài tập mặc định `two-sum`.

---

## 4. Các lưu ý quan trọng khi triển khai Production (Production Notes)

> [!WARNING]
> **Chi phí của gói RapidAPI Basic:**
> Gói miễn phí hoặc cơ bản của Judge0 trên RapidAPI có thể bắt đầu tính phí theo lượt gọi (pay-per-use) nếu vượt quá hạn mức tháng. Cần giám sát chặt chẽ số lượng submission trên môi trường production.

> [!IMPORTANT]
> **Triển khai máy chủ Judge0 tự lưu trữ (Self-hosted Judge0):**
> Để tối ưu hóa chi phí và hiệu năng khi chạy thực tế với lượng người dùng lớn, nên tự triển khai Judge0 trên một máy chủ Linux VPS hoặc VM riêng biệt.
> - **Lưu ý đặc biệt:** Không sử dụng Docker Desktop trên môi trường Windows cho production, do Docker Windows chạy trên WSL2 sử dụng cgroup v2, không tương thích với sandbox `isolate` của Judge0 (yêu cầu cgroup v1). Máy chủ production phải là hệ điều hành Linux thuần túy (ví dụ Ubuntu Server 20.04/22.04) có hỗ trợ cgroup v1.

> [!TIP]
> **Cấu hình Biến môi trường trên Vercel:**
> Hãy đảm bảo các biến môi trường sau đây được thiết lập đầy đủ và chính xác trên môi trường Hosting (Vercel):
> - `DATABASE_URL`: Đường dẫn kết nối CSDL PostgreSQL production.
> - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`: Khóa xác thực Clerk.
> - `GOOGLE_GENERATIVE_AI_API_KEY`: API Key kết nối với Google Gemini.
> - `GEMINI_MODEL`: Đặt thành mô hình phù hợp (mặc định là `gemini-3.5-flash`).
> - `JUDGE0_API_URL` & `JUDGE0_API_KEY`: Cấu hình endpoint chấm bài.
> - `JUDGE0_RAPIDAPI_HOST`: Thiết lập nếu sử dụng dịch vụ thông qua RapidAPI.

## 5. Backlog sau Clawpatch Review

Các mục dưới đây chưa bắt buộc cho bản dev/local hiện tại, nhưng nên xử lý trước khi production thật hoặc khi có thời gian bổ sung test.

### Production hardening

- Thay AI chat rate limiter từ in-memory `Map` sang shared storage như Redis, Upstash, PostgreSQL hoặc platform rate limit service.
- Bổ sung raw request body streaming cap cho `/api/ai/chat`, không chỉ dựa vào `Content-Length`.
- Chuẩn hóa error state khi production database outage thay vì trả empty catalog nếu cần hiển thị lỗi dịch vụ rõ ràng.

### Test coverage

- Thêm test runner.
- Viết test cho:
  - Auth fallback / Clerk session.
  - `/api/ai/chat` validation, unauthorized, rate limit.
  - `runCode` testcase selection và Judge0 failure.
  - Dashboard / RecentActivityFeed status rendering.

### UX / correctness backlog

- Preserve editor code theo từng problem/language để tránh mất code khi đổi language.
- Cải thiện debounce search URL sync để tránh race với typing nhanh.
- Chặn in-flight submission race khi user đổi problem trong lúc run đang chạy nếu cần nâng độ chắc chắn.
- Refine `Button` / `Badge` `asChild` typing cho polymorphic props.

### Xác minh Clerk real-session

Trạng thái: **NEEDS RETEST**

Giao diện Clerk phía client có thể hiển thị user đã đăng nhập, nhưng xác thực phía server trong môi trường local vẫn trả về signed-out. Lý do gần nhất là `session-token-expired-refresh-invalid-session-token`.

Kết luận hiện tại:
- `src/proxy.ts` đã được Next.js 16 nhận diện.
- Clerk middleware headers có mặt.
- Clerk cookies đi tới server.
- Env keys đã được cấu hình ở test mode.
- Real Clerk browser session cần test lại bằng browser/profile sạch hoặc deployment domain.

### Tóm tắt trạng thái MVP hiện tại

- DB migration: **PASS**.
- Seed 15 problems: **PASS**.
- DB persistence via local dev fallback: **PASS**.
- Real Clerk browser session: **NEEDS RETEST**.
- Các finding Clawpatch còn lại được đưa vào backlog, gồm production hardening, shared storage cho AI rate limit, bổ sung test và các cải thiện UX/correctness.
