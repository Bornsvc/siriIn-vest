import { Injectable } from '@nestjs/common';
import { unauthenticated } from '../auth/auth.errors';
import { PrismaService } from '../prisma/prisma.service';
import { KycStatus, Profile } from './profile.types';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * One query. The latest submission comes back as a nested `take: 1` rather
   * than a second round trip, so adding this to the app shell costs one
   * statement however many screens read it.
   */
  async current(userId: string): Promise<Profile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        kycSubmissions: {
          select: { status: true },
          orderBy: { submittedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      // A signed token for an account that is gone.
      throw unauthenticated('Your session is no longer valid. Sign in again.');
    }

    return {
      id: user.id,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      initials: initialsOf(user.fullName),
      kycStatus: kycStatusOf(user.status, user.kycSubmissions[0]?.status),
      joinedAt: user.createdAt.toISOString(),
    };
  }
}

/**
 * `users.status` is the settled answer; a check still with the reviewer is the
 * only thing that turns it into a waiting state.
 */
function kycStatusOf(
  status: 'unverified' | 'verified',
  latestSubmission: 'in_review' | 'approved' | 'rejected' | undefined,
): KycStatus {
  if (status === 'verified') return 'verified';
  return latestSubmission === 'in_review' ? 'pending' : 'unverified';
}

/**
 * First and last initial. Split on code points, not code units, so a name
 * outside the Latin alphabet does not come back as half a character.
 */
function initialsOf(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';

  const first = [...words[0]][0] ?? '';
  const last = words.length > 1 ? ([...words[words.length - 1]][0] ?? '') : '';

  return (first + last).toUpperCase();
}
