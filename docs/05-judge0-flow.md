# Quy trình xử lý và chấm bài qua Judge0 (Judge0 Flow)

Tài liệu này mô tả chi tiết quy trình thực thi mã nguồn của người dùng từ giao diện Workspace, cách đóng gói dữ liệu gửi tới Judge0 API, cơ chế phân luồng xử lý trên môi trường đám mây và nội bộ, cũng như cách ánh xạ kết quả trở lại cơ sở dữ liệu.

---

## 1. Quy trình thực thi mã nguồn tổng quan (Overall Execution Flow)

Quy trình xử lý một yêu cầu chạy code hoặc nộp bài diễn ra qua các bước tuần tự sau:

1. **Workspace UI**: Người dùng viết mã nguồn trong trình biên tập và nhấn nút **Run Code** hoặc **Submit**.
2. **ConsolePanel**: Trạng thái giao diện chuyển sang chế độ tải (loading), hiển thị con quay và vô hiệu hóa nút bấm thực thi.
3. **runCode Server Action**: Yêu cầu chứa thông tin bài tập, ngôn ngữ và mã nguồn được gửi tới Server Action của Next.js.
4. **Judge0 API**: Server Action định dạng lại yêu cầu, mã hóa mã nguồn sang Base64 và gửi tới cổng API Judge0 (chạy local hoặc qua RapidAPI).
5. **Polling (Kiểm tra trạng thái)**: Hệ thống thực hiện gửi yêu cầu kiểm tra (poll) liên tục tới Judge0 bằng token cho đến khi mã nguồn hoàn tất xử lý.
6. **Result Mapping (Ánh xạ kết quả)**: Phản hồi từ Judge0 được giải mã Base64 và ánh xạ sang các trạng thái kết quả của hệ thống Next Code Judge AI.
7. **DB Persistence (Lưu trữ CSDL)**: Kết quả chấm bài (`Submission` và `TestCaseResult`) được lưu trữ đồng bộ vào PostgreSQL.
8. **Submissions Tab**: Giao diện cập nhật lịch sử nộp bài mới nhất, hiển thị các huy hiệu trạng thái (Status Badges), thời gian chạy và dung lượng bộ nhớ tiêu thụ.

---

## 2. Định dạng dữ liệu (Payload & Request Format)

### 2.1. Payload gửi từ Client lên Server Action
Dữ liệu gửi từ giao diện Workspace lên Server Action có cấu trúc JSON:
```json
{
  "problemId": "string",
  "language": "javascript | python | java | cpp | typescript",
  "code": "string"
}
```

### 2.2. Định dạng yêu cầu gửi tới Judge0 API
Khi giao tiếp với API Judge0, toàn bộ mã nguồn và dữ liệu kiểm thử được mã hóa Base64 để tránh lỗi ký tự đặc biệt. Yêu cầu gửi đi bao gồm các trường sau:
* `source_code`: Mã nguồn đã mã hóa Base64.
* `language_id`: ID ngôn ngữ tương ứng trong hệ thống Judge0.
* `stdin`: Dữ liệu đầu vào của testcase (mã hóa Base64).
* `expected_output`: Kết quả đầu ra kỳ vọng của testcase (mã hóa Base64).
* `base64_encoded`: Thiết lập bằng `true` để thông báo cho Judge0 giải mã dữ liệu trước khi chạy.

---

## 3. Bảng ánh xạ ID Ngôn ngữ (Language ID Mapping)

Hệ thống Next Code Judge AI sử dụng bộ định danh ngôn ngữ tiêu chuẩn của phiên bản **Judge0 local 1.13.0**:

| Ngôn ngữ | ID Judge0 | Phiên bản chi tiết |
| :--- | :---: | :--- |
| **C++** | `54` | GCC 9.2.0 |
| **Java** | `62` | OpenJDK 13.0.1 |
| **JavaScript** | `63` | Node.js 12.14.0 |
| **Python** | `71` | Python 3.8.1 |
| **TypeScript** | `74` | TypeScript 3.7.4 |

---

## 4. Cơ chế hoạt động trên môi trường RapidAPI (RapidAPI Mode)

Khi sử dụng dịch vụ Judge0 đám mây thông qua RapidAPI, hệ thống sẽ tự động tối ưu hóa để tương thích với các ràng buộc về giới hạn tần suất (Rate Limits) của gói miễn phí:

* **Tự động nhận diện (Detection)**: Hệ thống kiểm tra nếu cấu hình `JUDGE0_API_URL` chứa chuỗi ký tự `rapidapi.com`.
* **Thực thi tuần tự (Sequential Execution)**: Thay vì gửi đồng thời tất cả các testcase bằng `Promise.all` (dễ gây quá tải và nhận lỗi `429 Too Many Requests`), hệ thống thực hiện gửi tuần tự từng testcase một.
* **Khoảng trễ gửi bài (Submission Delay)**: Bổ sung khoảng nghỉ `RAPIDAPI_SUBMIT_DELAY_MS = 1200` (1.2 giây) giữa các lần tạo token mới trên RapidAPI.
* **Khoảng trễ kiểm tra kết quả (Polling Delay)**: Bổ sung khoảng nghỉ `RAPIDAPI_POLL_DELAY_MS = 1000` (1 giây) giữa mỗi lần kiểm tra trạng thái token.

---

## 5. Ánh xạ trạng thái kết quả (Status Mapping)

Mã trạng thái trả về từ Judge0 được hệ thống ánh xạ sang các định nghĩa kết quả tương ứng:

| Mã Judge0 | Trạng thái hệ thống | Ý nghĩa |
| :---: | :--- | :--- |
| **3** | `Accepted` | Mã nguồn chạy chính xác và vượt qua toàn bộ testcase. |
| **4** | `Wrong Answer` | Kết quả thực tế chạy ra không khớp với kết quả kỳ vọng. |
| **5** | `Time Limit Exceeded` | Mã nguồn chạy vượt quá thời gian tối đa cho phép. |
| **6** | `Compile Error` | Gặp lỗi biên dịch mã nguồn. |
| **7 - 12** | `Runtime Error` | Gặp lỗi trong quá trình thực thi (ví dụ: NZEC, tràn bộ nhớ, lỗi phân đoạn). |
| **13** | `Internal Error` | Lỗi nội bộ từ sandbox của Judge0. |

---

## 6. Các lưu ý kỹ thuật đặc thù (Technical Notes)

### 6.1. Xử lý lỗi cú pháp của JavaScript
Đối với JavaScript (môi trường Node.js), do đặc tính của ngôn ngữ thông dịch, các lỗi cú pháp nghiêm trọng (như `SyntaxError`) đôi khi không được Judge0 báo về dưới dạng `Compile Error` (status 6) mà trả về dưới dạng `Runtime Error` (status 11 - NZEC) do Node.js kết thúc chương trình lỗi ở giai đoạn khởi chạy. 
* **Giải pháp khắc phục**: Kịch bản kiểm tra tự động quét thông tin trong `stderr` hoặc `compileOutput`. Nếu phát hiện từ khóa `"SyntaxError"`, kết quả sẽ được nhận diện và xử lý tương đương như một lỗi biên dịch để hiển thị thân thiện trên UI.

### 6.2. Lỗi chạy Docker cục bộ trên Windows
* **Vấn đề**: Khi chạy Judge0 tự lưu trữ (self-hosted) thông qua Docker Desktop trên Windows sử dụng nhân WSL2, sandbox bảo mật `isolate` của Judge0 thường sập hoàn toàn ở phía worker và trả về `status 13 (Internal Error)`. Nguyên nhân do Docker Desktop trên Windows sử dụng cơ chế quản lý tài nguyên cgroup v2, trong khi `isolate` yêu cầu cgroup v1.
* **Khuyến nghị cấu hình**:
  - **Môi trường Phát triển / Demo**: Khuyến khích sử dụng dịch vụ **RapidAPI Judge0 CE** để tích hợp nhanh chóng và ổn định.
  - **Môi trường Sản xuất (Production)**: Bắt buộc tự lưu trữ Judge0 trên máy chủ Linux thực tế (VPS/VM Ubuntu/Debian) được cấu hình cgroup v1.

---

## 7. Quy trình xử lý với bài tập chỉ hiển thị (DISPLAY_ONLY Flow)

Với việc mở rộng tập dữ liệu, hiện tại có **15 bài tập** sẵn sàng cho việc hiển thị danh sách, chi tiết đề bài và giao diện Workspace. Tuy nhiên, hệ thống áp dụng cơ chế phân loại khả năng thực thi và chấm bài như sau:

- **Bài tập có thể chạy code (Executable Problems - 3 bài)**: Gồm 3 bài tập cốt lõi là `two-sum`, `valid-parentheses`, và `palindrome-number`. Những bài này đã được tích hợp trình bao bọc driver riêng trong `run-code.ts` để đọc dữ liệu qua `stdin`, gọi hàm lời giải và in kết quả ra `stdout` để Judge0 chấm điểm.
- **Bài tập chỉ xem (Display-only Problems - 12 bài)**: Gồm 12 bài tập mới được thêm vào. Đối với 12 bài tập này:
  1. Hệ thống thực hiện kiểm tra trạng thái đăng nhập trước tiên.
  2. Nếu đã đăng nhập thành công, Server Action sẽ kiểm tra slug của bài tập. Vì các bài tập này chưa được hỗ trợ chạy code, hệ thống sẽ trả về ngay trạng thái đặc biệt `DISPLAY_ONLY` cùng thông báo: *"Bài này hiện chỉ hỗ trợ xem đề. Chạy code chỉ khả dụng cho Two Sum, Valid Parentheses và Palindrome Number."*
  3. Server Action **không thực hiện gọi đến Judge0 API** và **không ghi dữ liệu nộp bài (Submission/TestCaseResult)** vào cơ sở dữ liệu để tối ưu tài nguyên.
  4. Giao diện Workspace UI (`ConsolePanel`) nhận trạng thái này và hiển thị dưới dạng một thông báo chỉ dẫn (Info banner) thân thiện thay vì hiển thị dưới dạng lỗi biên dịch hoặc lỗi runtime.
  
> [!NOTE]
> Việc xây dựng driver wrapper và bổ sung testcase hoàn chỉnh trên Judge0 cho 12 bài tập này là một tác vụ trong tương lai (Future Task) khi cần nâng cấp tính năng chạy code cho toàn bộ dataset.

