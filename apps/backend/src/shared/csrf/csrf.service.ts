import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { nanoid } from 'nanoid';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CsrfService {
  constructor(private configService: ConfigService) {}

  protected createSignedToken(secret: string) {
    const token = crypto.randomBytes(64).toString('hex');
    const signedToken = crypto
      .createHmac('sha256', secret)
      .update(token)
      .digest('hex');

    return signedToken;
  }

  protected createSecret(secretLength: number = 32) {
    return nanoid(secretLength);
  }

  sendCsrfTokenToClient(req: Request, res: Response) {
    const secret = this.createSecret();
    const token = this.createSignedToken(secret);
    const csrfToken = `V4$.airbnb.com$${token}`;

    res.cookie('_csrf_token', csrfToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: this.configService.get<number>('SESSION_EXPIRATION') * 1000,
      expires: new Date(
        Date.now() +
          this.configService.get<number>('SESSION_EXPIRATION') * 1000,
      ),
    });

    req.session._csrf_token = csrfToken;
  }
}
