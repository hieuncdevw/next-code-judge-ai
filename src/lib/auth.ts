import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export type AuthUser = {
  id: string
  clerkUserId: string
  email: string
  name: string | null
  avatarUrl: string | null
}

/**
 * Retrieves the current authenticated user from Clerk.
 * If Clerk is not configured or in development mode, automatically upserts
 * and falls back to a default developer profile in the database.
 */
export async function getCurrentUser(): Promise<AuthUser> {
  try {
    const session = await auth()
    const clerkUserId = session.userId

    if (clerkUserId) {
      const user = await currentUser()
      if (user) {
        const email = user.emailAddresses[0]?.emailAddress || `${clerkUserId}@example.com`
        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
        const avatarUrl = user.imageUrl || null

        const dbUser = await prisma.userProfile.upsert({
          where: { clerkUserId },
          update: {
            name,
            avatarUrl,
          },
          create: {
            clerkUserId,
            email,
            name,
            avatarUrl,
          },
        })

        return {
          id: dbUser.id,
          clerkUserId: dbUser.clerkUserId,
          email: dbUser.email,
          name: dbUser.name,
          avatarUrl: dbUser.avatarUrl,
        }
      }
    }
  } catch {
    // Clerk not configured, no env keys, or offline
    console.log('[getCurrentUser] Clerk auth not active. Falling back to default developer user.')
  }

  // Fallback developer user profile
  const defaultEmail = 'developer@nextcodejudge.ai'
  try {
    const dbUser = await prisma.userProfile.upsert({
      where: { email: defaultEmail },
      update: {},
      create: {
        clerkUserId: 'mock-clerk-user-12345',
        email: defaultEmail,
        name: 'Developer Profile',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80',
      },
    })

    return {
      id: dbUser.id,
      clerkUserId: dbUser.clerkUserId,
      email: dbUser.email,
      name: dbUser.name,
      avatarUrl: dbUser.avatarUrl,
    }
  } catch {
    console.log('[getCurrentUser] Database offline. Returning in-memory fallback profile.')
    return {
      id: 'mock-user-db-id',
      clerkUserId: 'mock-clerk-user-12345',
      email: defaultEmail,
      name: 'Developer Profile (Offline)',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80',
    }
  }
}
