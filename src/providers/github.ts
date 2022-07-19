import type { TOAuth2Provider } from '../index';
import { env } from '../utils';

/**
 * @see https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps
 */
type TGithubParams = {
  /**
   * Suggests a specific account to use for signing in and authorizing the app.
   */
  login?: string;
  /**
   * Whether or not unauthenticated users will be offered an option to sign up for GitHub during the OAuth flow.
   * The default is true. Use false when a policy prohibits signups.
   */
  allow_signup?: boolean;
};

export function github({
  login,
  allow_signup
}: TGithubParams = {}): TOAuth2Provider {
  const authParams: TGithubParams = {};

  if (typeof login === 'string') {
    authParams.login = login;
  }

  if (typeof allow_signup === 'boolean') {
    authParams.allow_signup = allow_signup;
  }

  const provider: TOAuth2Provider = {
    clientId: env('GITHUB_OAUTH_CLIENT_ID'),
    clientSecret: env('GITHUB_OAUTH_CLIENT_SECRET'),

    auth: {
      url: 'https://github.com/login/oauth/authorize',
      params: authParams
    },

    token: {
      url: 'https://github.com/login/oauth/access_token',
      params: {}
    }
  };

  return provider;
}
