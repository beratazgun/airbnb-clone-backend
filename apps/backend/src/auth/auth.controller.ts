import { Body, Controller, Next, Param, Post, Req, Res } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  AuthFlowBodyDto,
  ResendVerificationEmailBodyDto,
  ResetPasswordBodyDto,
  SendForgotPasswordLinkBodyDto,
  SigninForWebBodyDto,
  SignupForWebBodyDto,
} from './dtos';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiQuery({
  name: 'locale',
  required: true,
  type: String,
  example: 'en',
  description: 'The user locale',
})
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  /**
   * ! signupForWeb
   */
  @Post('/signup-for-web')
  @ApiBody({ type: SignupForWebBodyDto })
  signupForWeb(
    @Body() body: SignupForWebBodyDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.authService.signupForWeb(body, req, res, next);
  }
  /**
   * ! signinForWeb
   */
  @Post('/signin-for-web')
  @ApiBody({ type: SigninForWebBodyDto })
  signinForWeb(
    @Body() body: SigninForWebBodyDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.authService.signinForWeb(body, req, res, next);
  }
  /**
   * ! authFlow
   */
  @Post('/flow')
  @ApiOperation({
    summary: 'Auth flow',
    description:
      'This endpoint is used for auth flow. This endpoint shows if user exist or not exist and suggestion methods.',
  })
  @ApiBody({ type: AuthFlowBodyDto })
  authFlow(@Body() body: AuthFlowBodyDto, @Res() res: Response) {
    return this.authService.authFlow(body, res);
  }
  /**
   * ! sendForgotPasswordLink
   */
  @Post('/forgot-password')
  @ApiOperation({
    summary: 'Send forgot password link',
    description:
      'The token is sent to user email and user can use that token to reset password.',
  })
  @ApiBody({ type: SendForgotPasswordLinkBodyDto })
  sendForgotPasswordLink(
    @Body() body: SendForgotPasswordLinkBodyDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.authService.sendForgotPasswordLink(body, req, res);
  }
  /**
   * ! resetPassword
   */
  @Post('/reset-password/:token')
  @ApiBody({ type: ResetPasswordBodyDto })
  @ApiOperation({
    summary: 'Reset password',
    description:
      'This endpoint works that if user forgot password and requested for reset password link. It should use after request for sendForgotPasswordLink endpoint.',
  })
  resetPassword(
    @Param('token') token: string,
    @Body() body: ResetPasswordBodyDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.authService.resetPassword(token, body, res, next);
  }
  /**
   * ! resendVerificationEmail
   */
  @Post('/resend-verification-email')
  @ApiOperation({
    summary: 'Resend verification email',
    description:
      'This endpoint is used for resend verification email to user email.',
  })
  resendVerificationEmail(
    @Body() body: ResendVerificationEmailBodyDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.authService.resendVerificationEmail(body, req, res);
  }
}
