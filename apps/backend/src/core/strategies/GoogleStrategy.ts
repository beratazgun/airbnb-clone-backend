import { Injectable, Req } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { DoneCallback } from 'passport';
import { Strategy, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: DoneCallback,
  ) {
    const { name, emails, photos, _json } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      profileImage: photos[0].value,
      accessToken,
      locale: _json.locale,
    };

    return user;
  }
}
