import type { TOAuth2Provider } from '..'
import { env } from '../utils'

/**
 * @see https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#authorization-code-grant-flow
 */
type TTwitchParams = {
	/**
	 * Set to true to force the user to re-authorize your app’s access to their resources. The default is false.
	 */
	force_verify?: boolean
}

export type TTwitchToken = {
	client_id: string
	login: string
	scopes: string[]
	user_id: string
	expires_in: number
}

export type TTwitchTokenValidationResult = {
	status: 200 | 401 | number
	message?: string
	token?: TTwitchToken
}

/**
 * @example
 *
 * const twitchProvider = twitch();
 *
 * // ...
 *
 * const tokenHeaders = await ctx.tokenHeaders('twitch');
 *
 * if ((await validateToken(tokenHeaders)).status === 200) {
 *    const user = await fetch('https://api.twitch.tv/helix/users', {
 *        headers: { 'Client-Id': twitchProvider.clientId, ...tokenHeaders }
 *    });
 * }
 *
 * @see https://dev.twitch.tv/docs/authentication/validate-tokens
 */
export async function validateToken(headers: {
	Authorization: string
}): Promise<TTwitchTokenValidationResult> {
	const response = await fetch('https://id.twitch.tv/oauth2/validate', {
		headers
	})

	if (response.status !== 200 && response.status !== 401) {
		throw response
	}

	const isJson = response.headers
		.get('Content-Type')
		?.startsWith('application/json')

	if (!isJson) {
		throw response
	}

	const json = await response.json()

	if (response.status === 200) {
		return {
			status: 200,
			token: json
		}
	}

	return json
}

export function twitch({ force_verify }: TTwitchParams = {}): TOAuth2Provider {
	const authParams: TTwitchParams = {}

	if (typeof force_verify === 'boolean') {
		authParams.force_verify = force_verify
	}

	return {
		clientId: env('TWITCH_OAUTH_CLIENT_ID'),
		clientSecret: env('TWITCH_OAUTH_CLIENT_SECRET'),

		auth: {
			url: 'https://id.twitch.tv/oauth2/authorize',
			params: authParams
		},

		token: {
			url: 'https://id.twitch.tv/oauth2/token',
			params: {}
		}
	}
}
