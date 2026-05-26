import Link from 'next/link'
import { MessageSquare, Search, Sparkles, Tags, Users } from 'lucide-react'
import { NavHeader } from '@/components/layout/nav-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Discuss - Next Code Judge',
  description: 'Community discussions for coding problems and solutions',
}

const futureFeatures = [
  {
    title: 'Problem discussions',
    description: 'Trao đổi cách tiếp cận, edge cases và lỗi thường gặp theo từng bài.',
    icon: MessageSquare,
  },
  {
    title: 'Solution sharing',
    description: 'Chia sẻ lời giải, phân tích độ phức tạp và so sánh nhiều hướng tối ưu.',
    icon: Users,
  },
  {
    title: 'AI-assisted explanations',
    description: 'Dùng AI để tóm tắt ý tưởng, giải thích code và gợi ý cải thiện.',
    icon: Sparkles,
  },
  {
    title: 'Tags and search',
    description: 'Lọc thảo luận theo chủ đề, độ khó, ngôn ngữ và trạng thái đã giải.',
    icon: Tags,
  },
]

export default function DiscussPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <section className="space-y-3">
            <Badge variant="secondary">Community</Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Discuss
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                Không gian thảo luận cộng đồng cho Next Code Judge: hỏi đáp về bài tập,
                chia sẻ hướng giải và học từ cách tiếp cận của người khác. Community
                discussions are coming soon for problem-solving, solution review, and
                practical coding insights.
              </p>
            </div>
          </section>

          <Card className="rounded-lg border-dashed">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="h-5 w-5" />
              </div>
              <CardTitle>Discussion board coming soon</CardTitle>
              <CardDescription>
                Tính năng forum chưa được bật trong MVP hiện tại. Bạn vẫn có thể luyện bài
                trong Problems và dùng AI trong Workspace để nhận gợi ý theo ngữ cảnh.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Backend thảo luận sẽ được thêm sau khi luồng làm bài, lưu submission và AI
                mentor ổn định.
              </p>
              <Button asChild>
                <Link href="/problems">Back to Problems</Link>
              </Button>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">Planned features</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {futureFeatures.map((feature) => {
                const Icon = feature.icon

                return (
                  <Card key={feature.title} size="sm" className="rounded-lg">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-sm">{feature.title}</CardTitle>
                          <CardDescription>{feature.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
