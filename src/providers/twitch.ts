import type { TOAuth2Provider } from '..';
import { env } from '../utils';

export const twitch = (): TOAuth2Provider => {
  return {
    clientId: env('TWITCH_OAUTH_CLIENT_ID'),
    clientSecret: env('TWITCH_OAUTH_CLIENT_SECRET'),

    auth: {
      url: 'https://id.twitch.tv/oauth2/authorize',
      params: {
        response_type: 'code',
      }
    },

    token: {
      url: 'https://id.twitch.tv/oauth2/token',
      params: {
        grant_type: 'authorization_code',
      }
    }
    
  };
};
