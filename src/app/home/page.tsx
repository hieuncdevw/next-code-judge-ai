import { NavHeader } from "@/components/layout/nav-header";

import { WelcomeBanner } from "@/modules/dashboard/components/welcome-banner";
import { RecentActivityFeed } from "@/modules/dashboard/components/recent-activity-feed";
import { ContributionHeatmap } from "@/modules/dashboard/components/contribution-heatmap";
import { GlobalLeaderboard } from "@/modules/dashboard/components/global-leaderboard";

import { DailyChallengeCard } from "@/modules/problems/components/daily-challenge-card";

import { AIMentorTip } from "@/modules/ai/components/ai-mentor-tip";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: 'Home - Next Code Judge',
  description: 'Your learning dashboard for coding problems',
}

function formatRelativeTime(createdAt: Date): string {
  const diffMs = Date.now() - createdAt.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffMins > 0) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
  return 'Just now'
}

export default async function HomePage() {
  let submissions: { id: string; problemTitle: string; problemSlug: string; status: 'accepted' | 'wrong_answer'; executionTime: number; timestamp: string }[] | undefined = undefined;

  try {
    const user = await getCurrentUser()
    const dbSubmissions = await prisma.submission.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { problem: true },
      take: 5,
    })

    if (dbSubmissions.length > 0) {
      submissions = dbSubmissions.map((sub) => ({
        id: sub.id,
        problemTitle: sub.problem.title,
        problemSlug: sub.problem.slug,
        status: sub.status === 'ACCEPTED' ? 'accepted' : 'wrong_answer' as const,
        executionTime: sub.runtimeMs ?? 0,
        timestamp: formatRelativeTime(sub.createdAt),
      }))
    }
  } catch (err) {
    console.error('[HomePage] failed to fetch recent submissions:', err)
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <WelcomeBanner username="Developer" streak={5} />

        {/* Main Grid Layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section (66% width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Challenge */}
            <DailyChallengeCard 
              title="Two Sum"
              difficulty="Easy"
              acceptanceRate={47.3}
              description="Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target."
              problemSlug="two-sum"
            />

            {/* Recent Submissions */}
            <RecentActivityFeed submissions={submissions} />
          </div>

          {/* Right Section (33% width) */}
          <div className="space-y-6">
            {/* Contribution Heatmap */}
            <ContributionHeatmap />

            {/* Leaderboard */}
            <GlobalLeaderboard currentUserRank={127} />

            {/* AI Mentor Tip */}
            <AIMentorTip />
          </div>
        </div>
      </main>
    </div>
  )
}
