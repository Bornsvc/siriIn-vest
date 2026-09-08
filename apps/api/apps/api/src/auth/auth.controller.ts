import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PublicUser } from '../users/user.entity';
import { AuthService } from './auth.service';
import { AuthenticatedUser, AuthSession } from './auth.types';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { CurrentUser } from './guards/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Transport only: the pipe has already validated the body, the service owns
 * every decision, and the filter owns every failure.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  signUp(@Body() dto: SignUpDto): Promise<AuthSession> {
    return this.auth.signUp(dto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() dto: SignInDto): Promise<AuthSession> {
    return this.auth.signIn(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser): Promise<PublicUser> {
    return this.auth.profile(user.id);
  }
}
