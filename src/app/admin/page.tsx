import Link from 'next/link'
import { Activity, Database, FileCode2, ShieldCheck, Users } from 'lucide-react'
import { NavHeader } from '@/components/layout/nav-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Admin Dashboard - Next Code Judge',
  description: 'Admin tools planned for problem, test case, submission, and user management',
}

const adminSections = [
  {
    title: 'Problem Management',
    description: 'Create, edit, publish, and archive coding problems after admin permissions are implemented.',
    icon: FileCode2,
    status: 'Coming soon',
  },
  {
    title: 'Test Case Management',
    description: 'Manage sample and hidden test cases, expected outputs, and validation coverage safely.',
    icon: Database,
    status: 'Planned',
  },
  {
    title: 'Submission Monitoring',
    description: 'Review submission status, runtime trends, Judge0 failures, and queue health.',
    icon: Activity,
    status: 'Coming soon',
  },
  {
    title: 'User Management',
    description: 'Inspect user profiles, roles, activity, and moderation signals without exposing unsafe actions.',
    icon: Users,
    status: 'Planned',
  },
]

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <section className="space-y-3">
            <Badge variant="secondary">MVP skeleton</Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Admin Dashboard
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                A safe admin placeholder for the MVP demo. Full CRUD, role checks, and
                moderation workflows will be added later; this page intentionally exposes
                no destructive controls.
              </p>
            </div>
          </section>

          <Card className="rounded-lg border-dashed">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle>Admin tools are planned</CardTitle>
              <CardDescription>
                This skeleton documents the intended admin surface while keeping the current
                demo read-only and safe.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                No create, update, delete, or moderation action is available on this page.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" asChild>
                  <Link href="/home">Back to Home</Link>
                </Button>
                <Button asChild>
                  <Link href="/problems">Go to Problems</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <section className="grid gap-3 sm:grid-cols-2">
            {adminSections.map((section) => {
              const Icon = section.icon

              return (
                <Card key={section.title} size="sm" className="rounded-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-sm">{section.title}</CardTitle>
                          <CardDescription>{section.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {section.status}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </section>
        </div>
      </main>
    </div>
  )
}
