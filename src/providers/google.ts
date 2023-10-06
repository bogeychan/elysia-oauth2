import type { TOAuth2Provider } from '..'
import { env } from '../utils'

/**
 * @see https://developers.google.com/identity/protocols/oauth2/web-server#httprest_1
 */
type TGoogleParams<AccessType extends string, Prompt extends string> = {
	/**
	 * Indicates whether your application can refresh access tokens when the user is not present at the browser
	 */
	access_type?: 'online' | 'offline' | AccessType
	/**
	 * Enables applications to use incremental authorization to request access to additional scopes in context
	 */
	include_granted_scopes?: boolean
	/**
	 * Used to pre-fill the `username` or `email` field of the sign-in page for the user
	 */
	login_hint?: string
	/**
	 * Used to control the prompt behavior
	 */
	prompt?: 'none' | 'consent' | 'select_account' | Prompt
}

export function google<AccessType extends string, Prompt extends string>({
	access_type,
	include_granted_scopes,
	login_hint,
	prompt
}: TGoogleParams<AccessType, Prompt> = {}): TOAuth2Provider {
	const authParams: TGoogleParams<AccessType, Prompt> = {}

	if (typeof access_type === 'string') {
		authParams.access_type = access_type
	}

	if (typeof include_granted_scopes === 'boolean') {
		authParams.include_granted_scopes = include_granted_scopes
	}

	if (typeof login_hint === 'string') {
		authParams.login_hint = login_hint
	}

	if (typeof prompt === 'string') {
		authParams.prompt = prompt
	}

	const provider: TOAuth2Provider = {
		clientId: env('GOOGLE_OAUTH_CLIENT_ID'),
		clientSecret: env('GOOGLE_OAUTH_CLIENT_SECRET'),

		auth: {
			url: 'https://accounts.google.com/o/oauth2/v2/auth',
			params: authParams
		},

		token: {
			url: 'https://accounts.google.com/o/oauth2/token',
			params: {}
		}
	}

	return provider
}
