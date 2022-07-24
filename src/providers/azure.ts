import type { TOAuth2Provider } from '../index';
import { env } from '../utils';

/**
 * @see https://docs.microsoft.com/en-us/graph/auth-v2-user
 */
type TAzureParams<Tenant extends string, Prompt extends string> = {
  /**
   * Used to control who can sign into the application
   */
  tenant?: 'common' | 'organizations' | 'consumers' | Tenant;
  /**
   * Used to control the prompt behavior
   */
  prompt?:
    | 'none'
    | 'login'
    | 'select_account'
    | 'consent'
    | 'admin_consent'
    | Prompt;
  /**
   * Used to provides a hint about the `tenant` or `domain` the user should use to sign in
   */
  domain_hint?: string;
  /**
   * Used to pre-fill the `username` or `email` field of the sign-in page for the user
   */
  login_hint?: string;
};

export function azure<Tenant extends string, Prompt extends string>({
  tenant,
  domain_hint,
  login_hint,
  prompt
}: TAzureParams<Tenant, Prompt> = {}): TOAuth2Provider {
  const authParams: TAzureParams<Tenant, Prompt> = {};

  if (typeof domain_hint === 'string') {
    authParams.domain_hint = domain_hint;
  }

  if (typeof login_hint === 'string') {
    authParams.login_hint = login_hint;
  }

  if (typeof prompt === 'string') {
    authParams.prompt = prompt;
  }

  const provider: TOAuth2Provider = {
    clientId: env('AZURE_OAUTH_CLIENT_ID'),
    clientSecret: env('AZURE_OAUTH_CLIENT_SECRET'),

    auth: {
      url: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
      params: authParams
    },

    token: {
      url: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
      params: {}
    }
  };

  return provider;
}
