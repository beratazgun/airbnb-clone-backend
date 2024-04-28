import {
  Body,
  Controller,
  Get,
  Next,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { GoogleAuthGuard } from '../core/guards/GoogleAuth.guard';
import { NextFunction, Response, Request } from 'express';
import { GoogleAuthService } from './google-auth.service';
import { ApiOkResponse, ApiTags, ApiOAuth2, ApiQuery } from '@nestjs/swagger';
import { GoogleSigninCompleteRegistrationBodyDto } from './dtos/GoogleSigninCompleteRegistrationBody.dto';

@ApiTags('google-auth')
@Controller('google-auth')
export class GoogleAuthController {
  constructor(private googleAuthService: GoogleAuthService) {}

  /**
   * ! googleSigninPage
   */
  @ApiOkResponse({ description: 'Redirect to google signin page.' })
  @UseGuards(GoogleAuthGuard)
  @Get('/signin')
  googleSigninPage() {}

  /**
   * ! googleSigninCallback
   */
  @UseGuards(GoogleAuthGuard)
  @Get('/oa2/callback')
  googleSigninCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.googleAuthService.googleSigninCallback(req, res, next);
  }

  /**
   * ! googleSigninCompleteRegistration
   */
  @Post('/oa2/registration')
  @ApiQuery({
    name: 'locale',
    required: true,
    type: String,
    example: 'en',
    description: 'The User locale',
  })
  googleSigninCompleteRegistration(
    @Body() body: GoogleSigninCompleteRegistrationBodyDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.googleAuthService.googleSigninCompleteRegistration(
      body,
      req,
      res,
      next,
    );
  }
}
