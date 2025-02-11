import { Elysia } from 'elysia'
import { html, Html } from '@elysiajs/html'
import oauth2, {
	github,
	type InferContext,
	type TOAuth2AccessToken
} from '@bogeychan/elysia-oauth2'

import { randomBytes } from 'crypto'

const globalState = randomBytes(8).toString('hex')
let globalToken = null

const mySessionPLugin = new Elysia().derive({ as: 'global' }, (ctx) => ({
	session: {
		getOAuthToken(name: string): TOAuth2AccessToken {
			return globalToken
		},
		setOAuthToken(name: string, token: TOAuth2AccessToken) {
			globalToken = token
		},
		deleteOAuthToken(name: string) {
			globalToken = null
		}
	}
}))

const app = new Elysia().use(mySessionPLugin)

const auth = oauth2({
	profiles: {
		github: {
			provider: github(),
			scope: ['user']
		}
	},
	state: {
		check(ctx, name, state) {
			return state === globalState
		},
		generate(ctx, name) {
			return globalState
		}
	},
	storage: {
		get(ctx: InferContext<typeof app>, name) {
			return ctx.session.getOAuthToken(name)
		},
		set(ctx: InferContext<typeof app>, name, token) {
			ctx.session.setOAuthToken(name, token)
		},
		delete(ctx: InferContext<typeof app>, name) {
			ctx.session.deleteOAuthToken(name)
		}
	}
})

app
	.use(auth)
	.use(html())
	.get('/', async (ctx) => {
		const profiles = ctx.profiles('github')

		if (await ctx.authorized('github')) {
			const user = await fetch('https://api.github.com/user', {
				headers: await ctx.tokenHeaders('github')
			})

			return userPage(await user.json(), profiles.github.logout)
		}

		return loginPage(profiles.github.login)
	})
	.listen(3000)

console.log(`http://${app.server!.hostname}:${app.server!.port}`)

const loginPage = (login: string) => (
	<html lang="en">
		<body>
			<h2>
				Login with <a href={login}>Github</a>
			</h2>
		</body>
	</html>
)

const userPage = (user: {}, logout: string) => (
	<html lang="en">
		<body>
			User:
			<pre>${JSON.stringify(user, null, '\t')}</pre>
			<a href={logout}>Logout</a>
		</body>
	</html>
)
