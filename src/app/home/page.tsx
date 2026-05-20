import { NavHeader } from "@/components/layout/nav-header";

import { WelcomeBanner } from "@/modules/dashboard/components/welcome-banner";
import { RecentActivityFeed } from "@/modules/dashboard/components/recent-activity-feed";
import { ContributionHeatmap } from "@/modules/dashboard/components/contribution-heatmap";
import { GlobalLeaderboard } from "@/modules/dashboard/components/global-leaderboard";

import { DailyChallengeCard } from "@/modules/problems/components/daily-challenge-card";

import { AIMentorTip } from "@/modules/ai/components/ai-mentor-tip";

export const metadata = {
  title: 'Home - Next Code Judge',
  description: 'Your learning dashboard for coding problems',
}

export default function HomePage() {
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
              problemId="1"
            />

            {/* Recent Submissions */}
            <RecentActivityFeed />
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
