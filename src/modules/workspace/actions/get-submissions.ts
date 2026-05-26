'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import type { WorkspaceSubmission } from '@/modules/workspace/types/workspace-problem'

function getStatusLabel(status: string): string {
  return status
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export async function getCurrentUserSubmissionsForProblem(problemId: string): Promise<{
  isAuthenticated: boolean
  submissions: WorkspaceSubmission[]
}> {
  const user = await getCurrentUser()

  if (!user) {
    return {
      isAuthenticated: false,
      submissions: [],
    }
  }

  try {
    const submissions = await prisma.submission.findMany({
      where: {
        userId: user.id,
        problemId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
      select: {
        id: true,
        status: true,
        language: true,
        runtimeMs: true,
        memoryKb: true,
        errorMessage: true,
        createdAt: true,
        results: {
          select: {
            status: true,
          },
        },
      },
    })

    return {
      isAuthenticated: true,
      submissions: submissions.map((submission) => ({
        id: submission.id,
        status: submission.status,
        statusLabel: getStatusLabel(submission.status),
        language: submission.language,
        runtime: submission.runtimeMs ?? undefined,
        memory: submission.memoryKb ?? undefined,
        errorMessage: submission.errorMessage ?? undefined,
        passedTests: submission.results.filter((result) => result.status === 'ACCEPTED').length,
        totalTests: submission.results.length,
        submittedAt: submission.createdAt.toISOString(),
      })),
    }
  } catch (error) {
    console.error('[getCurrentUserSubmissionsForProblem] failed to fetch submissions:', error)
    return {
      isAuthenticated: true,
      submissions: [],
    }
  }
}
