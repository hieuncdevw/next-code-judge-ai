# Nhật ký Sửa lỗi (Debug Notes)

Tài liệu này ghi lại các lỗi thực tế gặp phải trong quá trình thiết lập và phát triển hệ thống **Next Code Judge AI**, cùng với nguyên nhân, cách xử lý và bài học rút ra.

---

## 1. Các lỗi liên quan đến Gemini / AI Agent

### 1.1. Lỗi cấu hình sai lệch biến môi trường Gemini (Gemini Env Variable Mismatch)
* **Thời điểm gặp lỗi**: Quá trình thiết lập ban đầu để kết nối với Gemini AI.
* **Lỗi / biểu hiện**: Trợ lý AI không phản hồi hoặc trả về lỗi thiếu API Key, dù biến `GEMINI_API_KEY` đã được khai báo trong tệp `.env`.
* **Nguyên nhân**: Thư viện `@ai-sdk/google` mặc định tìm kiếm biến môi trường `GOOGLE_GENERATIVE_AI_API_KEY`. Tuy nhiên, mã nguồn API Route lại kiểm tra biến `GEMINI_API_KEY` hoặc gặp lỗi gõ sai chính tả thành `GOOGLE_GENERATION_API_KEY`.
* **Cách xử lý**: Cấu hình sử dụng `GOOGLE_GENERATIVE_AI_API_KEY` làm biến môi trường chính, bổ sung `GEMINI_API_KEY` làm tên thay thế (alias) tùy chọn, và loại bỏ hoàn toàn biến viết sai chính tả `GOOGLE_GENERATION_API_KEY`.
* **Ghi chú / bài học**: Luôn kiểm tra tài liệu chính thức của SDK để biết chính xác biến môi trường mặc định mà thư viện yêu cầu trước khi cấu hình.

### 1.2. Lỗi cấu hình mô hình Gemini (Gemini Model Config)
* **Thời điểm gặp lỗi**: Khi cần thử nghiệm hoặc chuyển đổi phiên bản mô hình AI (ví dụ: chuyển đổi từ các phiên bản Flash sang Pro hoặc cập nhật mô hình mới).
* **Lỗi / biểu hiện**: Không thể linh hoạt thay đổi mô hình được gọi, gây khó khăn cho việc quản lý chi phí và chất lượng câu trả lời.
* **Nguyên nhân**: Tên mô hình AI được khai báo trực tiếp (hardcode) trong mã nguồn thay vì lấy động từ cấu hình.
* **Cách xử lý**: Đưa tên mô hình vào biến môi trường `GEMINI_MODEL` và thiết lập giá trị mặc định là `gemini-3.5-flash` để đảm bảo hệ thống luôn hoạt động ngay cả khi biến môi trường không được đặt.
* **Ghi chú / bài học**: Mọi tham số cấu hình có tính chất thay đổi theo thời gian hoặc theo môi trường cần được cấu hình thông qua biến môi trường để tránh phải build lại mã nguồn khi thay đổi.

### 1.3. Lỗi định dạng toán học trong phản hồi của AI (AI Response Formatting Issue)
* **Thời điểm gặp lỗi**: Khi kiểm tra giao diện hiển thị câu trả lời từ AI Agent trên Workspace.
* **Lỗi / biểu hiện**: Các công thức toán học hoặc ký hiệu độ phức tạp thuật toán được hiển thị dưới dạng mã LaTeX thô như `$O(N)$` hoặc `\mathbf{}` trên màn hình, gây rối mắt và mất thẩm mỹ.
* **Nguyên nhân**: Mô hình Gemini tự động trả về định dạng LaTeX cho các biểu thức toán học, trong khi giao diện UI hiển thị văn bản thuần (plain text) hoặc Markdown cơ bản chưa hỗ trợ render LaTeX đầy đủ.
* **Cách xử lý**: Cập nhật lại System Prompt của AI Agent, yêu cầu rõ ràng không sử dụng cú pháp LaTeX trong các câu trả lời. Thay vào đó, sử dụng định dạng mã nội dòng (inline code) như `` `O(n)` `` hoặc `` `O(1)` ``.
* **Ghi chú / bài học**: Việc định hình cấu trúc và định dạng câu trả lời của AI thông qua System Prompt là rất quan trọng để đảm bảo tính đồng bộ với khả năng hiển thị của giao diện người dùng.

---

## 2. Các lỗi liên quan đến Judge0

### 2.1. Lỗi Internal Error 13 khi chạy Judge0 bằng Docker trên Windows
* **Thời điểm gặp lỗi**: Chạy thử nghiệm hệ thống chấm bài Judge0 tự lưu trữ (self-hosted) thông qua Docker Desktop trên Windows.
* **Lỗi / biểu hiện**: Server Judge0 phản hồi tốt, gửi yêu cầu chấm bài nhận được token bình thường, nhưng worker xử lý luôn trả về lỗi `Internal Error (status 13)`. Kiểm tra logs của container Judge0 worker thấy báo lỗi:
  ```text
  Failed to create control group /sys/fs/cgroup/memory/box-X/
  chown: cannot access '/box'
  No such file or directory @ rb_sysopen - /box/script.js
  ```
* **Nguyên nhân**: Công cụ sandbox `isolate` của Judge0 phụ thuộc vào cơ chế quản lý tài nguyên cgroup v1 của Linux. Docker Desktop trên Windows (sử dụng WSL2) mặc định kích hoạt cgroup v2, gây ra xung đột và khiến sandbox không thể tạo được môi trường bảo mật để chạy code.
* **Cách xử lý**: Đưa ra quyết định không sử dụng Docker Desktop trên Windows để chạy local Judge0 cho việc phát triển. Thay vào đó, sử dụng dịch vụ Judge0 trên RapidAPI cho mục đích thử nghiệm/demo, hoặc tự triển khai trên máy ảo/máy chủ chạy Linux (VPS/VM) hỗ trợ cgroup v1 cho môi trường production.
* **Ghi chú / bài học**: Sandbox bảo mật sâu như Judge0 đòi hỏi sự tương thích rất chặt chẽ về nhân hệ điều hành (Kernel) và cgroups. Cần lưu ý sự khác biệt này khi phát triển trên môi trường Windows Docker.

### 2.2. Lỗi không khớp ID ngôn ngữ (Judge0 Language ID Mismatch)
* **Thời điểm gặp lỗi**: Khi chạy chấm bài thử nghiệm các ngôn ngữ JavaScript, Python, C++, Java trên môi trường Judge0 local.
* **Lỗi / biểu hiện**: Mã nguồn gửi đi bị biên dịch hoặc thực thi sai môi trường, báo lỗi cú pháp hoặc lỗi hệ thống từ Judge0.
* **Nguyên nhân**: Mã nguồn sử dụng cấu hình ID cũ (ví dụ: JavaScript là 93, Python là 92). Trong khi đó, phiên bản Judge0 local (1.13.0) sử dụng bộ ID tiêu chuẩn khác:
  - JavaScript Node.js = 63
  - Python 3.8.1 = 71
  - Java = 62
  - C++ GCC 9.2 = 54
  - TypeScript = 74
* **Cách xử lý**: Cập nhật lại chính xác bảng ánh xạ ID ngôn ngữ trong các tệp tin `src/modules/workspace/actions/run-code.ts` và `src/modules/workspace/utils/verify-judge0.ts` (hoặc các file kiểm tra tương ứng).
* **Ghi chú / bài học**: Bộ ID ngôn ngữ của Judge0 thay đổi tùy thuộc vào phiên bản cài đặt. Tốt nhất nên truy vấn API `/languages` của Judge0 để đồng bộ dữ liệu ID thực tế thay vì cấu hình cứng.

### 2.3. Lỗi RapidAPI Judge0 trả về 403 Forbidden
* **Thời điểm gặp lỗi**: Khi chuyển đổi từ Judge0 tự cài đặt sang sử dụng dịch vụ Judge0 CE trên RapidAPI.
* **Lỗi / biểu hiện**: Các yêu cầu chấm bài gửi đến RapidAPI đều bị từ chối với mã lỗi `403 Forbidden`.
* **Nguyên nhân**: Tài khoản chưa đăng ký (subscribe) gói dịch vụ Judge0 CE trên RapidAPI, cấu hình sai API Key hoặc thiếu các HTTP Header bắt buộc là `x-rapidapi-key` và `x-rapidapi-host`.
* **Cách xử lý**: Đăng ký gói Judge0 CE trên RapidAPI (chọn gói Free hoặc Basic), và cập nhật đầy đủ các biến môi trường:
  ```env
  JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
  JUDGE0_API_KEY=your_rapidapi_key
  JUDGE0_RAPIDAPI_HOST=judge0-ce.p.rapidapi.com
  ```
  Đảm bảo mã nguồn Server Action đã cấu hình các header này khi thực hiện các cuộc gọi HTTP API.
* **Ghi chú / bài học**: Tích hợp các dịch vụ qua cổng RapidAPI luôn yêu cầu định dạng API Key và Host Header riêng. Hãy chắc chắn rằng headers đã được thêm đầy đủ.

### 2.4. Lỗi giới hạn tần suất gọi API (RapidAPI Judge0 429 Too Many Requests)
* **Thời điểm gặp lỗi**: Khi chạy nhiều testcase đồng thời hoặc bấm chạy mã nguồn liên tiếp trên gói dịch vụ miễn phí của RapidAPI.
* **Lỗi / biểu hiện**: Hệ thống nhận phản hồi lỗi `429 Too Many Requests` từ RapidAPI. Giao diện Workspace hiển thị thông báo lỗi hệ thống hoặc không hiển thị kết quả các testcase.
* **Nguyên nhân**: Gói dịch vụ Judge0 CE Free trên RapidAPI áp dụng giới hạn số lượng yêu cầu nghiêm ngặt trên mỗi giây. Việc sử dụng `Promise.all` để gửi song song tất cả các testcase đã vượt qua ngưỡng giới hạn này của API.
* **Cách xử lý**:
  - Nhận diện nếu URL API chứa tên miền `rapidapi.com`.
  - Thay đổi cơ chế thực thi: chuyển từ chạy song song `Promise.all` sang chạy tuần tự (sequential) từng testcase một.
  - Bổ sung khoảng trễ gửi bài: `RAPIDAPI_SUBMIT_DELAY_MS = 1200` (1.2 giây giữa mỗi lần gửi).
  - Bổ sung khoảng trễ kiểm tra kết quả: `RAPIDAPI_POLL_DELAY_MS = 1000` (1 giây giữa các lượt poll).
  - Bắt lỗi mã trạng thái 429 để trả về trạng thái hiển thị `"Rate Limited"` cùng hướng dẫn rõ ràng trên giao diện.
* **Ghi chú / bài học**: Đối với các API bên thứ ba có giới hạn rate limit chặt chẽ, việc chuyển đổi sang mô hình xử lý tuần tự kết hợp với độ trễ (throttling/debounce) là bắt buộc để đảm bảo tính ổn định.

### 2.5. Lỗi cú pháp JavaScript (SyntaxError) trả về lỗi thực thi (Runtime Error)
* **Thời điểm gặp lỗi**: Khi chạy thử nghiệm code JavaScript (Node.js) có chứa lỗi cú pháp rõ ràng.
* **Lỗi / biểu hiện**: Judge0 trả về kết quả lỗi với mã trạng thái `status 11` (Runtime Error - NZEC) thay vì `status 6` (Compile Error), gây hiểu nhầm cho người dùng.
* **Nguyên nhân**: Do Node.js là môi trường runtime thông dịch nên không trải qua bước biên dịch độc lập. Khi gặp lỗi cú pháp, Node.js sẽ báo lỗi ngay khi bắt đầu thực thi chương trình và kết thúc với exit code khác 0, khiến Judge0 phân loại nó thành lỗi thực thi (Runtime Error).
* **Cách xử lý**: Điều chỉnh kịch bản xác thực để phát hiện nếu `stderr` hoặc `compileOutput` chứa chuỗi ký tự `"SyntaxError"`, hệ thống sẽ tự động ánh xạ hoặc xử lý hiển thị lỗi đó như một lỗi biên dịch (Compile Error / status 6).
* **Ghi chú / bài học**: Các ngôn ngữ thông dịch (JavaScript, Python) có cách báo lỗi cú pháp khác biệt so với các ngôn ngữ biên dịch (C++, Java). Cần phân tích nội dung thông báo lỗi (`stderr`) để đưa ra trạng thái chính xác.

---

## 3. Các lỗi liên quan đến Môi trường & Hệ thống

### 3.1. Lỗi sập luồng chấm bài khi Cơ sở dữ liệu ngoại tuyến (Database Offline)
* **Thời điểm gặp lỗi**: Khi phát triển ngoại tuyến (offline) hoặc khi cơ sở dữ liệu PostgreSQL tạm thời mất kết nối.
* **Lỗi / biểu hiện**: Khi người dùng nhấn "Run Code" hoặc "Submit", ứng dụng báo lỗi Server Error 500 và toàn bộ tiến trình chấm bài bị dừng lại, mặc dù sandbox Judge0 vẫn đang chạy tốt.
* **Nguyên nhân**: Logic lưu trữ lịch sử chấm bài (`Submission` và `TestCaseResult`) vào cơ sở dữ liệu được đặt chung trong luồng xử lý đồng bộ của Server Action. Khi kết nối CSDL bị lỗi, biệt lệ (exception) không được bắt đúng cách dẫn tới sập cả Server Action.
* **Cách xử lý**: Bọc phần logic ghi dữ liệu vào CSDL trong một khối `try/catch` riêng biệt. Nếu ghi CSDL thất bại, hệ thống chỉ ghi nhận log lỗi ở phía server và tiếp tục trả về kết quả chạy code từ Judge0 cho người dùng. Đồng thời, cấu hình cho phép lấy bài tập mẫu từ bộ nhớ tạm `MOCK_PROBLEMS` để so khớp.
* **Ghi chú / bài học**: Thiết kế hệ thống chịu lỗi (fault-tolerant) bằng cách không để các tác vụ phụ trợ (như lưu lịch sử/logs) chặn đứng hoặc làm hỏng luồng nghiệp vụ chính của người dùng.

### 3.2. Lỗi sập ứng dụng khi chưa cấu hình Clerk Authentication
* **Thời điểm gặp lỗi**: Khi khởi chạy ứng dụng lần đầu ở máy trạm local mà chưa thiết lập tài khoản hoặc cấu hình Clerk API Keys.
* **Lỗi / biểu hiện**: Trang chủ hoặc trang Workspace bị crash ngay từ khâu xác thực người dùng, không cho phép truy cập giao diện.
* **Nguyên nhân**: Logic đồng bộ hóa thông tin người dùng `UserProfile` yêu cầu thông tin xác thực hợp lệ từ Clerk Middleware. Khi thiếu API Keys, Middleware hoặc API gọi từ Clerk sẽ ném ra lỗi làm sập tiến trình render trang.
* **Cách xử lý**: Thiết lập cơ chế fallback xác thực tự động. Khi phát hiện thiếu khóa Clerk hoặc kết nối xác thực lỗi, hệ thống sẽ tự động bỏ qua và đăng nhập người dùng dưới dạng hồ sơ nhà phát triển giả lập (`developer@nextcodejudge.ai`), cho phép tiếp tục sử dụng ứng dụng ngoại tuyến.
* **Ghi chú / bài học**: Phát triển phần mềm cần hỗ trợ chế độ offline hoặc giả lập thông minh (mocking) để tối ưu năng suất làm việc của lập trình viên khi không có kết nối dịch vụ bên thứ ba.

### 3.3. Lỗi Build dự án (Prerendering) thất bại do kết nối Database ngoại tuyến
* **Thời điểm gặp lỗi**: Khi chạy lệnh đóng gói ứng dụng `npm run build`.
* **Lỗi / biểu hiện**: Quá trình build của Next.js bị dừng lại ở giai đoạn tạo trang tĩnh (static page generation / prerendering) với lỗi kết nối cơ sở dữ liệu bị từ chối.
* **Nguyên nhân**: Các trang như Workspace hoặc Dashboard cố gắng truy vấn dữ liệu từ database ở thời điểm build thông qua Server Components mà không có cơ chế bắt lỗi hoặc fallback thích hợp.
* **Cách xử lý**: Bổ sung xử lý `try/catch` xung quanh các lệnh truy vấn dữ liệu trong Server Components và sử dụng dữ liệu tĩnh `MOCK_PROBLEMS` hoặc `MOCK_PROBLEM_ROWS` khi phát hiện kết nối DB thất bại. Điều này giúp quá trình build hoàn tất và các trang sẽ tự động tải lại dữ liệu động khi chạy thực tế.
* **Ghi chú / bài học**: Trong Next.js, giai đoạn build có thể không có kết nối tới cơ sở dữ liệu thực tế. Phải luôn đảm bảo các trang tĩnh hoặc các server component có thể chịu lỗi kết nối và sử dụng dữ liệu mock làm phương án dự phòng.

### 3.4. Lỗi tự động sử dụng Hồ sơ Nhà phát triển khi chưa Xác thực (Developer Profile Auth Fallback Leak)
* **Thời điểm gặp lỗi**: Khi phát triển các tính năng yêu cầu bảo mật nghiêm ngặt hoặc triển khai ứng dụng lên môi trường production.
* **Lỗi / biểu hiện**: Người dùng chưa đăng nhập (unauthenticated/guest) vẫn có thể chạy code, nộp bài và dữ liệu submissions được lưu trữ vào CSDL dưới tên người dùng `developer@nextcodejudge.ai`, gây rò rỉ dữ liệu hoặc sai lệch kết quả chấm bài của người dùng thật.
* **Nguyên nhân**: Hàm `getCurrentUser()` ban đầu được thiết kế để tự động tạo/trả về hồ sơ nhà phát triển giả lập khi Clerk auth không hoạt động hoặc không có phiên đăng nhập hợp lệ. Cơ chế fallback này không phân biệt giữa môi trường phát triển cục bộ và môi trường production, cũng như không kiểm tra rõ ràng cờ cấu hình cho phép fallback.
* **Cách xử lý**:
  - Cấu hình chỉ cho phép sử dụng Developer Profile khi thỏa mãn đồng thời hai điều kiện: `NODE_ENV === "development"` và `ALLOW_DEV_AUTH_FALLBACK === "true"`.
  - Nếu Clerk keys được định cấu hình nhưng không có phiên đăng nhập hợp lệ (ví dụ: người dùng chưa đăng nhập), hàm `getCurrentUser()` sẽ trả về `null` thay vì fallback sang hồ sơ dev.
  - Enforce kiểm tra ở đầu hàm `runCode` Server Action: nếu user là `null`, trả về kết quả trạng thái `'UNAUTHORIZED'` ("Login Required") kèm thông báo lỗi tiếng Việt mà không gửi yêu cầu chấm bài tới Judge0 và không thực hiện bất kỳ hoạt động ghi database nào.
  - Cập nhật UI của `ConsolePanel`, `ProblemPanel` và `RecentActivityFeed` để kiểm tra cờ `isAuthenticated`, ẩn thông tin testcase/breakdown đối với người dùng unauthenticated và hiển thị yêu cầu đăng nhập thân thiện.
* **Ghi chú / bài học**: Cơ chế giả lập (mocking) phục vụ quá trình phát triển rất tiện lợi nhưng phải được kiểm soát bằng biến môi trường rõ ràng và không bao giờ được phép rò rỉ lên production. Các tác vụ ghi dữ liệu nhạy cảm (như lưu submission kết quả chấm bài) phải luôn được bảo vệ bởi xác thực hợp lệ.
* **Lưu ý / Tình trạng hiện tại**: Việc xác thực cơ chế lưu trữ cơ sở dữ liệu với phiên đăng nhập thực tế của người dùng qua Clerk vẫn đang ở trạng thái **PENDING** và cần được kiểm chứng khi cấu hình đầy đủ các khóa môi trường Clerk (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` và `CLERK_SECRET_KEY`) trên môi trường chạy thực tế.

### 3.5. Tích hợp Giao diện Xác thực Clerk & Khắc phục Trải nghiệm Người dùng Chưa Xác thực
* **Thời điểm thực hiện**: Quá trình tích hợp giao diện đăng nhập/đăng ký Clerk và tối ưu hóa luồng nộp bài.
* **Lỗi / biểu hiện**: Giao diện trước đây hiển thị avatar tĩnh chữ "U" và không cung cấp nút đăng nhập/đăng ký trực quan. Khi chạy code ở trạng thái unauthenticated, kết quả trả về là "Login Required" nhưng ConsolePanel vẫn hiển thị số testcases dạng "0/0 tests" và không cung cấp nút đăng nhập nhanh, khiến người dùng lúng túng.
* **Nguyên nhân**:
  - Giao diện Header (`NavHeader`) chưa tích hợp các thành phần của Clerk (`SignInButton`, `SignUpButton`, `UserButton`).
  - Giao diện hiển thị kết quả lỗi (`ConsolePanel`) chưa ẩn các trường số lượng testcase khi trạng thái là `'UNAUTHORIZED'` và thiếu cơ chế đăng nhập nhanh.
  - Phiên bản `@clerk/nextjs` (7.4.0) sử dụng React 19 không hỗ trợ các thẻ `<SignedIn>` và `<SignedOut>` trực tiếp trên client boundary, thay vào đó phải sử dụng component `<Show>` với prop `when`. Đồng thời prop `afterSignOutUrl` không còn được hỗ trợ trên `<UserButton>`.
* **Cách xử lý**:
  - Chuyển đổi sang sử dụng `<Show when="signed-in">` và `<Show when="signed-out">` từ `@clerk/nextjs` để tương thích hoàn toàn với thư viện Clerk mới mà không gây lỗi compile.
  - Loại bỏ thuộc tính `afterSignOutUrl` trên `<UserButton>` để tránh lỗi TypeScript.
  - Điều chỉnh `ConsolePanel` để ẩn hoàn toàn số lượng testcase ("0/0 tests") và per-test breakdown đối với trạng thái `'UNAUTHORIZED'`.
  - Tích hợp thêm nút "Đăng nhập" (sử dụng `<SignInButton mode="modal">`) trực tiếp bên trong hộp cảnh báo lỗi của `ConsolePanel`.
* **Ghi chú / bài học**:
  - Khi cập nhật thư viện bên thứ ba (như Clerk), luôn kiểm tra kỹ tài liệu và các thay đổi lớn (breaking changes) về API.
  - Cung cấp cơ chế gọi hành động (Call-to-Action) tại đúng thời điểm và ngữ cảnh xuất hiện lỗi (ví dụ: nút đăng nhập xuất hiện ngay khi báo lỗi yêu cầu đăng nhập) sẽ cải thiện đáng kể trải nghiệm người dùng.



