import type { TOAuth2UrlParams, TOAuth2Scope, TOAuth2AccessToken } from '..';

export function env(name: string) {
  if (!(name in process.env)) {
    throw new Error(
      `.env variable '${name}' is required but could not be found`
    );
  }
  return process.env[name];
}

export function buildUrl(
  url: string,
  params: TOAuth2UrlParams,
  scope?: TOAuth2Scope
) {
  const _url = new URL(url);

  if (scope) {
    _url.searchParams.append('scope', scope.join(' '));
  }

  for (const [name, value] of Object.entries(params)) {
    _url.searchParams.append(name, value.toString());
  }

  return _url.href;
}

export function redirect(location: string) {
  return new Response('', {
    status: 302,
    statusText: 'Found',
    headers: { Location: location }
  });
}

/**
 * Used for Twitch only
 * 
 * @param token 
 * @returns 
 */
export async function validateToken(token?: TOAuth2AccessToken) {
  const response = await fetch('https://id.twitch.tv/oauth2/validate', {
    headers: {Authorization: `OAuth ${token.access_token}`}
  })

  
  if (response.ok) {
    const data = await response.json()
    return {...token, ...data};
  }

  return false
}

export function isTokenValid(token?: TOAuth2AccessToken) {
  if (!token) {
    return false;
  }
  const now = Date.now() / 1000;
  const expiry = token.created_at + token.expires_in;
  if (now < expiry) {
  return token;}

  return false
}

