import type { Session, SessionData } from 'express-session';
import {
  AuthStrategy,
  AuthStrategyToUser,
  LocaleCodes,
  Users,
} from '@prisma/client';

type TUserPreference = Omit<
  {
    language: Omit<Language, 'id'>;
    currency: Omit<Currency, 'id'>;
    country: Omit<Country, 'id'>;
  },
  'id' | 'currencyID' | 'languageID' | 'timezonesID' | 'userID'
>;

export type TSessionData = Omit<Users, 'languageID'> & {
  authStrategyToUser: AuthStrategyToUser & {
    authStrategy: AuthStrategy;
  };
} & {
  userPreference: {
    language: Omit<Language, 'id'>;
    currency: Omit<Currency, 'id'>;
    country: Omit<Country, 'id'>;
  };
};

declare module 'express-session' {
  interface SessionData {
    user: Partial<TSessionData>;
    _csrf_token: string;
  }

  interface Session {
    user: Partial<TSessionData>;
    _csrf_token: string;
  }
}
