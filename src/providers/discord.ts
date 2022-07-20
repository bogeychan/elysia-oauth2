import type { TOAuth2Provider } from '../index';
import { env } from '../utils';

/**
 * @see https://discord.com/developers/docs/topics/oauth2
 */
type TDiscordParams<Prompt extends string> = {
  /**
   * Used to control the prompt behavior
   */
  prompt?: 'consent' | 'none' | Prompt;
};

export function discord<Prompt extends string>({
  prompt
}: TDiscordParams<Prompt> = {}): TOAuth2Provider {
  const authParams: TDiscordParams<Prompt> = {};

  if (typeof prompt === 'string') {
    authParams.prompt = prompt;
  }

  const provider: TOAuth2Provider = {
    clientId: env('DISCORD_OAUTH_CLIENT_ID'),
    clientSecret: env('DISCORD_OAUTH_CLIENT_SECRET'),

    auth: {
      url: 'https://discord.com/api/oauth2/authorize',
      params: authParams
    },

    token: {
      url: 'https://discord.com/api/oauth2/token',
      params: {}
    }
  };

  return provider;
}
