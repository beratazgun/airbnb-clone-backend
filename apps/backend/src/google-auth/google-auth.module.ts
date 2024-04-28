import { Module } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';
import { GoogleAuthController } from './google-auth.controller';
import { GoogleStrategy } from '../core/strategies/GoogleStrategy';

@Module({
  controllers: [GoogleAuthController],
  providers: [GoogleAuthService, GoogleStrategy],
})
export class GoogleAuthModule {}
