import {
  Body,
  Controller,
  Get,
  Next,
  Param,
  Post,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserService } from './user.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthorizationGuard } from '../core/guards/Authorization.guard';
import {
  EmergencyContactBodyDto,
  UpdateEmailBodyDto,
  UpdatePasswordBodyDto,
} from './dtos';

@ApiQuery({
  name: 'locale',
  required: true,
  type: String,
  example: 'en-EN',
  description: 'The user locale',
})
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  /**
   * ! confirmEmail
   */
  @Post('/confirm-email/:token')
  @ApiOperation({
    summary: 'Confirm the email',
    description: 'This endpoint is used to confirm the email',
  })
  confirmEmail(
    @Param('token') token: string,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.userService.confirmEmail(token, res, next);
  }

  /**
   * ! getMe
   */
  @ApiOperation({
    summary: 'Get the user profile',
  })
  @UseGuards(AuthorizationGuard)
  @Get('/me')
  getMe(@Req() req: Request, @Res() res: Response) {
    return this.userService.getMe(req, res);
  }

  /**
   * ! signout
   * */
  @ApiOperation({
    summary: 'Sign out the user',
  })
  @Post('/account/signout')
  @UseGuards(AuthorizationGuard)
  signout(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.userService.signout(req, res, next);
  }

  @Post('/update-password')
  @UseGuards(AuthorizationGuard)
  updatePassword(
    @Body() body: UpdatePasswordBodyDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.userService.updatePassword(body, req, res, next);
  }

  /**
   * ! createEmergencyContactMutation
   */
  @Post('/emergency-contact')
  @UseGuards(AuthorizationGuard)
  createEmergencyContact(
    @Body() body: EmergencyContactBodyDto,
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    return this.userService.createEmergencyContact(body, req, res, session);
  }

  /**
   * ! updateEmail
   */
  @Post('/update-email')
  @UseGuards(AuthorizationGuard)
  updateEmail(
    @Body() body: UpdateEmailBodyDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return this.userService.updateEmail(body, req, res, next);
  }
}
