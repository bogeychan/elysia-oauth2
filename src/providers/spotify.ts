import type { TOAuth2Provider } from '..'
import { env } from '../utils'

/**
 * @see https://developer.spotify.com/documentation/general/guides/authorization/code-flow
 */
type TSpotifyParams = {
	/**
	 * Whether or not to force the user to approve the app again.
	 */
	show_dialog?: boolean
}

export function spotify({ show_dialog }: TSpotifyParams = {}): TOAuth2Provider {
	const authParams: TSpotifyParams = {}

	if (typeof show_dialog === 'boolean') {
		authParams.show_dialog = show_dialog
	}

	const provider: TOAuth2Provider = {
		clientId: env('SPOTIFY_OAUTH_CLIENT_ID'),
		clientSecret: env('SPOTIFY_OAUTH_CLIENT_SECRET'),

		auth: {
			url: 'https://accounts.spotify.com/authorize',
			params: authParams
		},

		token: {
			url: 'https://accounts.spotify.com/api/token',
			params: {}
		}
	}

	return provider
}
