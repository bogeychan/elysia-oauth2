import type { TOAuth2Provider } from '../index';
import { env } from '../utils';

/**
 * @see https://github.com/reddit-archive/reddit/wiki/OAuth2
 */
type TRedditParams<Duration extends string> = {
  duration?: 'temporary' | 'permanent' | Duration;
};

export function reddit<Duration extends string>({
  duration
}: TRedditParams<Duration> = {}): TOAuth2Provider {
  const authParams: TRedditParams<Duration> = {};

  if (typeof duration === 'string') {
    authParams.duration = duration;
  }

  const provider: TOAuth2Provider = {
    clientId: env('REDDIT_OAUTH_CLIENT_ID'),
    clientSecret: env('REDDIT_OAUTH_CLIENT_SECRET'),

    auth: {
      url: 'https://www.reddit.com/api/v1/authorize',
      params: authParams
    },

    token: {
      url: 'https://www.reddit.com/api/v1/access_token',
      params: {}
    }
  };

  return provider;
}
