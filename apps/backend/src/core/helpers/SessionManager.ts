import { TSessionData } from '@backend/src/types/express-session';
import { Request } from 'express';
import { omit } from 'lodash';

interface ISetSessionParams {
  req: Request;
  sessionData: TSessionData;
}

export class SessionManager {
  static setSession({ req, sessionData }: ISetSessionParams) {
    const data = {
      ...omit(sessionData, ['authStrategyToUser', 'userPreference']),
      userPreference: {
        language: {
          ...omit(sessionData.userPreference.language, ['id']),
        },
        currency: {
          ...omit(sessionData.userPreference.currency, ['id']),
        },
        country: {
          ...omit(sessionData.userPreference.country, ['id', 'regionID']),
        },
      },
      strategyName: sessionData.authStrategyToUser.authStrategy.strategyName,
      providerAccessToken: sessionData.authStrategyToUser.accessToken,
    };

    req.session.user = data;
  }
}
