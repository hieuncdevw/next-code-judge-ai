# UI Guidelines

File này mô tả các quy ước giao diện, theme, layout và navigation của dự án Next Code Judge AI.

---

## 1. Color Theme & Dark Mode

Dự án sử dụng **Tailwind CSS** kết hợp **ShadCN UI** với hệ thống CSS custom properties để hỗ trợ dark mode qua `next-themes`.

### Theme toggle

`ThemeProvider` được đặt trong `src/app/layout.tsx`:

```tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

Toggle được đặt trong `NavHeader` — click icon `Moon`/`Sun` gọi `setTheme(theme === 'dark' ? 'light' : 'dark')`.

### Màu difficulty

Mỗi level bài tập có badge màu riêng, dùng nhất quán ở mọi component:

| Difficulty | Background | Text |
|---|---|---|
| Easy | `bg-emerald-100 dark:bg-emerald-950` | `text-emerald-800 dark:text-emerald-200` |
| Medium | `bg-amber-100 dark:bg-amber-950` | `text-amber-800 dark:text-amber-200` |
| Hard | `bg-red-100 dark:bg-red-950` | `text-red-800 dark:text-red-200` |

> **Quy tắc:** Không dùng `bg-easy/10 text-easy` — Tailwind custom color `easy/medium/hard` chưa được cấu hình trong project này. Dùng `emerald/amber/red` cụ thể.

### Semantic color tokens (CSS variables)

Các token từ ShadCN UI được dùng thay cho màu cứng:

```
bg-background        — nền trang
bg-card              — nền card / panel
bg-muted             — nền muted (code block, gutter)
text-foreground      — text chính
text-muted-foreground — text phụ
border-border        — border
bg-primary           — primary button
text-primary-foreground
```

---

## 2. Typography

- Font hệ thống: **Geist** (Google Font) cho text thường, **Geist Mono** cho code.
- Code blocks dùng `font-mono text-xs` với `line-height: 1.5rem`.
- Heading trong trang detail: `text-2xl font-bold text-foreground`.
- Heading phụ trong panel: `text-xs font-semibold text-muted-foreground uppercase tracking-wider`.

---

## 3. Navigation — NavHeader

Component: `src/components/layout/nav-header.tsx`

### Active highlight

Dùng `usePathname()` từ `next/navigation` để highlight link hiện tại:

```tsx
const pathname = usePathname()
const isActive = href === '/home'
  ? pathname === '/home'
  : pathname.startsWith(href)

className={cn(
  'text-sm font-medium transition-colors',
  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
)}
```

### Nav links

| Label | href | Active khi |
|---|---|---|
| Home | `/home` | `pathname === '/home'` |
| Problems | `/problems` | `pathname.startsWith('/problems')` |
| Discuss | `/discuss` | `pathname.startsWith('/discuss')` |
| Workspace | `/workspace` | `pathname.startsWith('/workspace')` |

### NavHeader được dùng ở

- `src/app/home/page.tsx`
- `src/app/problems/page.tsx`
- `src/app/problems/[slug]/page.tsx`
- `src/app/workspace/page.tsx`

> **Lưu ý:** `Header` cũ (`src/components/layout/header.tsx`) chỉ dùng cho internal prototype. Các trang chính dùng `NavHeader`.

---

## 4. Layout — Workspace Page

### Chuỗi flex kế thừa (quan trọng)

Workspace cần fill đúng viewport mà không tràn. Mọi flex ancestor phải có `min-h-0`:

```
h-screen flex flex-col          ← workspace/page.tsx root div
  NavHeader (shrink-0)
  flex-1 min-h-0 overflow-hidden ← wrapper div
    CodeWorkspace (h-full flex flex-col min-h-0)
      sub-header (shrink-0)
      flex-1 min-h-0 overflow-hidden ← ResizablePanelGroup wrapper
        ResizablePanel (left — ProblemPanel)
          h-full flex flex-col min-h-0
            tab bar (shrink-0)
            TabsContent (flex-1 min-h-0 overflow-y-auto) ← scrolls here
        ResizablePanel (right — EditorPanel + ConsolePanel)
          EditorPanel (h-full flex flex-col min-h-0)
          ConsolePanel (h-full flex flex-col min-h-0)
```

> **Lý do `min-h-0`:** Trong CSS Flexbox, `flex-1` có `min-height: auto` theo mặc định — element sẽ không co lại nhỏ hơn nội dung. `min-h-0` ghi đè về `0`, cho phép scroll đúng.

### ResizablePanelGroup

- Dùng `react-resizable-panels` qua ShadCN UI.
- Panel trái (ProblemPanel): `defaultSize={35} minSize={25} maxSize={50}`.
- Panel phải (EditorPanel + ConsolePanel): `defaultSize={65}`.
- AI Chat panel: `defaultSize={25}`, chỉ hiển thị khi `showAIChat === true`.
- Dùng `withHandle` trên `ResizableHandle` để có nút kéo rõ hơn.

---

## 5. ProblemPanel

Component: `src/modules/workspace/components/problem-panel.tsx`

### Props

```ts
interface ProblemPanelProps {
  problem: WorkspaceProblem | null
}
```

Type `WorkspaceProblem` định nghĩa tại `src/modules/workspace/types/workspace-problem.ts`.

### Nội dung render khi có problem

1. **Title + difficulty badge** — inline, flex-wrap.
2. **Tags** — span badges, `bg-muted text-muted-foreground`.
3. **Description** — `whitespace-pre-wrap`, `text-sm leading-relaxed`.
4. **Sample test cases** — loop qua `problem.testCases`, hiển thị Input/Output trong `bg-muted rounded-lg`.
5. **Constraints** — `pre` với `whitespace-pre-wrap font-mono`.
6. **Time / Memory limits** — footer nhỏ, `text-xs text-muted-foreground`, border-top.

### Fallback khi `problem = null`

```tsx
<div className="flex flex-col items-center justify-center h-full gap-3 text-center">
  <p className="text-sm text-muted-foreground">No problem selected.</p>
  <p className="text-xs text-muted-foreground">
    Open a problem from the <a href="/problems">Problems</a> list to start coding.
  </p>
</div>
```

### Tabs

- **Description** — nội dung bài toán (scroll được).
- **Submissions** — placeholder, chưa có API (`[TODO]`).

---

## 6. CodeWorkspace Sub-header

Component: `src/modules/workspace/components/code-workspace.tsx`

Sub-header nằm giữa NavHeader và ResizablePanelGroup:

```
[ Title + difficulty badge ]         [ Submit ]  [ Ask AI ]
```

### Submit button

- Màu: `bg-primary text-primary-foreground hover:bg-primary/90`.
- Handler: `handleSubmit()` — hiện là placeholder (`console.log`), sẽ kết nối Judge0 API sau.
- Vị trí: góc phải sub-header, **không** đặt trong ConsolePanel (đã bỏ).

### Ask AI button

- Màu: `bg-blue-600 hover:bg-blue-700 text-white`.
- Toggle hiển thị/ẩn `AIChatPanel` ở phía phải workspace.

---

## 7. EditorPanel — Scroll sync

Component: `src/modules/workspace/components/editor-panel.tsx`

Line-number gutter và textarea được sync cuộn bằng `useRef` + `onScroll`:

```tsx
const syncScroll = useCallback(() => {
  if (lineNumbersRef.current && textareaRef.current) {
    lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
  }
}, [])

<textarea onScroll={syncScroll} ... />
```

Line-height dùng nhất quán `1.5rem` cho cả gutter và textarea để số line khớp với code.

---

## 8. ProblemsTable — Clickable rows

Component: `src/modules/problems/components/problems-table.tsx`

Mỗi title cell wrap bằng `Link` tới `/problems/[slug]`:

```tsx
<Link
  href={`/problems/${problem.slug}`}
  className="hover:text-primary transition-colors hover:underline underline-offset-4"
>
  {problem.title}
</Link>
```

Filter/search/pagination state được giữ ở `ProblemsPageClient` (Client Component).

---

## 9. Problem Detail Page — Start Coding button

Route: `src/app/problems/[slug]/page.tsx` (Server Component)

Top bar có hai thành phần:

```
← Back to Problems              [ Start Coding →]
```

```tsx
<Button asChild size="sm" className="gap-2">
  <Link href={`/workspace?problem=${problem.slug}`}>
    <Code2 className="h-4 w-4" />
    Start Coding
  </Link>
</Button>
```

Click "Start Coding" → `/workspace?problem=[slug]` → Server Component đọc `searchParams`, gọi `getProblemBySlug`, truyền data xuống `CodeWorkspace`.

---

## 10. Luồng dữ liệu Server → Client

### /problems page

```
page.tsx (async Server Component)
  └── getProblems()          ← Prisma query: isPublished=true, orderBy createdAt desc
  └── <ProblemsPageClient problems={...}>  (Client Component, 'use client')
        ├── useState: searchQuery, selectedDifficulty, selectedTopic, currentPage
        ├── <FilterBar />
        ├── <ProblemsTable problems={...} />   ← nhận data + filter state
        └── <Pagination totalPages={computed} />
```

### /workspace?problem=[slug] page

```
page.tsx (async Server Component)
  └── await searchParams      ← Next.js 15: searchParams là Promise
  └── getProblemBySlug(slug)  ← Prisma query, trả null nếu không tồn tại
  └── <CodeWorkspace problem={...}>  (Client Component, 'use client')
        └── <ProblemPanel problem={...}>
```

> **Next.js 15 breaking change:** `searchParams` là `Promise<{...}>`, phải `await` hoặc dùng `React.use()`.

---

## 11. [TODO] — Chưa hoàn thành

- [ ] `Submissions` tab trong ProblemPanel: chưa có API — hiển thị "No submissions yet".
- [ ] `handleSubmit` trong CodeWorkspace: placeholder `console.log` — cần kết nối Judge0 API.
- [ ] `handleRunCode` trong ConsolePanel: dùng `setTimeout` giả lập — cần kết nối Judge0 API.
- [ ] Filter tags trong FilterBar: danh sách topics hardcoded — nên load động từ DB.
- [ ] `Discuss` page: route `/discuss` chưa được tạo.
- [ ] `Contests` page: link trong NavHeader cũ, không có trong nav mới — xem xét thêm hoặc bỏ.
- [ ] Auth (Clerk): chưa tích hợp — các trang hiện tại không yêu cầu đăng nhập.
- [ ] `solved` status trên ProblemsTable: đã bỏ icon Check/Circle vì chưa có auth context.

---

## 5a. ProblemPanel - Submissions tab (da hoan thanh)

> **Cap nhat:** Submissions tab da duoc implement day du, khong con la `[TODO]`.

### Props hien tai

```ts
interface ProblemPanelProps {
  problem: WorkspaceProblem | null
  submissions: SubmissionResult[]  // <-- them prop nay
}
```

`submissions` duoc truyen tu `CodeWorkspace` sau moi lan Run Code.

### Hien thi trong Submissions tab

- **Badge mau** theo `SubmissionResult.status`:
  - `ACCEPTED` -> emerald
  - `WRONG_ANSWER` -> rose
  - `COMPILE_ERROR` -> amber
  - `RUNTIME_ERROR` -> orange
  - `TIME_LIMIT_EXCEEDED` -> purple
- **Timestamp** dinh dang `vi-VN`.
- **Runtime** (Clock icon) + **Memory** (Cpu icon): chi hien khi co.
- **Error message**: `pre` block, `whitespace-pre-wrap overflow-x-auto`.
- **Counter badge** tren tab trigger: `{submissions.length}` khi > 0.
- **Inactive tab** an bang `data-[state=inactive]:hidden` (khong chiem layout).

---

## 6a. CodeWorkspace - Shared state architecture

> **Cap nhat:** State `code`, `language`, `submissions` da duoc lift len `CodeWorkspace`.

### State ownership

```
CodeWorkspace (Client Component)
├── code: string           (useState - default code JavaScript)
├── language: string       (useState - default 'javascript')
├── submissions: SubmissionResult[]  (useState - append moi nhat len dau)
├── showAIChat: boolean    (useState)
│
├── EditorPanel  <- nhan: code, language, onCodeChange, onLanguageChange, onShowAI
├── ConsolePanel <- nhan: code, language, problemId, onSubmissionResult
└── ProblemPanel <- nhan: problem, submissions
```

### Ask AI button

- Dat trong sub-header `CodeWorkspace` (khong phai EditorPanel rieng).
- Icon `HelpCircle` trong EditorPanel header cung trigger AI panel qua `onShowAI` prop.
- Label: "Ask AI" khi dong, "Close AI" khi mo.
- Mau: `bg-blue-600 hover:bg-blue-700 text-white`.

### Submit button

- Da bo khoi CodeWorkspace sub-header trong phien ban hien tai.
- Hành dong chinh chi co **Run Code** trong ConsolePanel (full-width, emerald).

---

## 7a. EditorPanel - Controlled component (update)

> **Cap nhat:** EditorPanel khong con co local state cho `code` va `language`.

### Interface

```ts
interface EditorPanelProps {
  code: string
  language: string
  onCodeChange: (code: string) => void
  onLanguageChange: (language: string) => void
  onShowAI: () => void
}
```

### Layout ben trong

```
EditorPanel (h-full flex flex-col min-h-0)
  header (shrink-0)
    Select language (w-40 h-8)
    Settings icon button
    HelpCircle icon button (trigger AI)
  body (flex-1 min-h-0 overflow-hidden flex)
    line-number gutter (shrink-0 overflow-hidden bg-muted)
    textarea (flex-1 overflow-y-auto overflow-x-auto resize-none)
```

---

## 10a. Data flow update - /workspace page (sau khi implement)

```
page.tsx (async Server Component)
  await searchParams           <- Next.js 15: searchParams la Promise
  resolvedSlug = slug[0] | slug | undefined
  problem = resolvedSlug
    ? getProblemBySlug(resolvedSlug)  <- Prisma: tra null neu slug khong ton tai
    : null

  <CodeWorkspace problem={problem}>   (Client Component 'use client')
    useState: code, language, submissions[], showAIChat
    |
    +-- <ProblemPanel problem submissions>
    |       TabsContent Description: hien full content hoac fallback
    |       TabsContent Submissions: lich su SubmissionResult[]
    |
    +-- <EditorPanel code language onCodeChange onLanguageChange onShowAI>
    |       Controlled textarea, line number sync
    |
    +-- <ConsolePanel code language problemId onSubmissionResult>
    |       useTransition -> runCode() Server Action
    |       TabsContent TestCases: mock test cases
    |       TabsContent Result: status banner + stats + error + per-test
    |
    +-- [showAIChat] <AIChatPanel onClose>
            fetch POST /api/ai/chat -> ReadableStream streaming
            onKeyDown (khong phai onKeyPress)
            blinking cursor, auto-scroll, disable input khi streaming
```

---

## 11a. [TODO] Update - Workflow da hoan thanh

Cac hang trong muc 11 [TODO] da duoc cap nhat:

| Item | Trang thai truoc | Trang thai hien tai |
|---|---|---|
| Submissions tab trong ProblemPanel | `[TODO]` placeholder | ✅ Hien thi lich su submissions |
| `handleSubmit` trong CodeWorkspace | placeholder console.log | ✅ Da bo, chi con Run Code |
| `handleRunCode` trong ConsolePanel | `setTimeout` mock | ✅ `runCode()` Server Action that |
| AI Agent streaming | `setTimeout` mock | ✅ Route Handler ReadableStream |
| `onKeyPress` deprecated | Con dung | ✅ Da doi sang `onKeyDown` |
| `min-h-0` AIChatPanel | Thieu | ✅ Da them |

Van con `[TODO]`:
- [ ] Filter tags trong FilterBar: danh sach topics hardcoded.
- [ ] `Discuss` page: route `/discuss` chua duoc tao.
- [ ] Auth (Clerk): chua tich hop.
- [ ] `solved` status tren ProblemsTable: can auth context.
- [ ] Judge0 API that: hien tai `runCode()` gia lap.
- [ ] AI provider that (OpenAI/Gemini): hien tai gia lap bang `buildReply()`.

