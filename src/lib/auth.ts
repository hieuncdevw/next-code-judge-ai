import { auth, currentUser } from '@clerk/nextjs/server'

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
export async function getCurrentUser(): Promise<AuthUser | null> {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const clerkSecretKey = process.env.CLERK_SECRET_KEY
  const isClerkConfigured = !!(clerkPublishableKey && clerkSecretKey)

  try {
    const { isAuthenticated, userId } = await auth()

    if (isAuthenticated && userId) {
      const user = await currentUser()
      if (user) {
        const email = user.primaryEmailAddress?.emailAddress
          || user.emailAddresses.find((emailAddress) => emailAddress.id === user.primaryEmailAddressId)?.emailAddress
          || user.emailAddresses[0]?.emailAddress
          || `${userId}@example.com`
        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
        const avatarUrl = user.imageUrl || null

        try {
          const { prisma } = await import('@/lib/prisma')
          const dbUser = await prisma.userProfile.upsert({
            where: { clerkUserId: userId },
            update: {
              email,
              name,
              avatarUrl,
            },
            create: {
              clerkUserId: userId,
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
        } catch (dbErr) {
          console.warn('[getCurrentUser] Database profile sync failed (Prisma init or DB offline):', dbErr)
          if (isClerkConfigured) {
            return null
          }
        }
      }
    }

    // If Clerk is configured but no user is signed in, return null (do not fall back to developer profile)
    if (isClerkConfigured) {
      console.log('[getCurrentUser] Clerk keys configured but no user is signed in. Returning null.')
      return null
    }
  } catch (e) {
    // Clerk not configured, no env keys, or offline
    console.log('[getCurrentUser] Clerk auth not active or failed:', e)
    if (isClerkConfigured) {
      return null
    }
  }

  // Developer fallback profile may only be used when:
  // NODE_ENV === "development" and ALLOW_DEV_AUTH_FALLBACK === "true"
  const isDev = process.env.NODE_ENV === 'development'
  const allowDevFallback = process.env.ALLOW_DEV_AUTH_FALLBACK === 'true'

  if (isDev && allowDevFallback) {
    // Fallback developer user profile
    const defaultEmail = 'developer@nextcodejudge.ai'
    const fallbackUser = {
      id: 'mock-user-db-id',
      clerkUserId: 'mock-clerk-user-12345',
      email: defaultEmail,
      name: 'Developer Profile (Offline)',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80',
    }

    try {
      const { prisma } = await import('@/lib/prisma')
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
    } catch (prismaErr) {
      console.log('[getCurrentUser] Database offline or DATABASE_URL missing. Returning in-memory fallback profile:', prismaErr)
      return fallbackUser
    }
  }

  return null
}
