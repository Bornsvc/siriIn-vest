import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/guards/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { Profile } from './profile.types';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  /**
   * Everything the signed-in shell draws: the greeting, the avatar initials in
   * the top bar, and the identity card on the account screen.
   *
   * `GET /auth/me` stays what it was — the narrow "is this token any good"
   * check. This is the one a screen calls.
   */
  @Get()
  current(@CurrentUser() user: AuthenticatedUser): Promise<Profile> {
    return this.profile.current(user.id);
  }
}
