import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/guards/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestUploadDto } from './dto/request-upload.dto';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { KycService } from './kyc.service';
import { KycSubmissionView } from './kyc.types';
import { UploadTicket } from '../storage/object-storage';

/** Everything here is about the caller's own check. There is no other subject. */
@Controller('kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kyc: KycService) {}

  /**
   * One signed URL, for one photo. The browser puts the file straight into the
   * bucket with it; ten megabytes of photograph never touch this process.
   */
  @Post('uploads')
  @HttpCode(HttpStatus.CREATED)
  requestUpload(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RequestUploadDto,
  ): Promise<UploadTicket> {
    return this.kyc.requestUpload(user.id, dto);
  }

  @Post('submissions')
  @HttpCode(HttpStatus.CREATED)
  submit(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitKycDto,
  ): Promise<KycSubmissionView> {
    return this.kyc.submit(user.id, dto);
  }

  @Get('submissions/me')
  latest(@CurrentUser() user: AuthenticatedUser): Promise<KycSubmissionView> {
    return this.kyc.latest(user.id);
  }
}
