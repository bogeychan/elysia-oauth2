import { Elysia } from 'elysia'
import oauth2, { github, TOAuth2AccessToken } from '../src'

import { randomBytes } from 'crypto'

const globalState = randomBytes(8).toString('hex')
let globalToken: TOAuth2AccessToken | undefined

const app = new Elysia()

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
		get(ctx, name) {
			return globalToken
		},
		set(ctx, name, token) {
			globalToken = token
		},
		delete(ctx, name) {
			globalToken = undefined
		}
	}
})

function userPage(user: {}, logout: string) {
	const html = `<!DOCTYPE html>
    <html lang="en">
    <body>
      User:
      <pre>${JSON.stringify(user, null, '\t')}</pre>
      <a href="${logout}">Logout</a>
    </body>
    </html>`

	return new Response(html, { headers: { 'Content-Type': 'text/html' } })
}

app
	.use(auth)
	.get('/', async (ctx) => {
		const profiles = ctx.profiles('github')

		if (await ctx.authorized('github')) {
			const user = await fetch('https://api.github.com/user', {
				headers: await ctx.tokenHeaders('github')
			})

			return userPage(await user.json(), profiles.github.logout)
		}

		const html = `<!DOCTYPE html>
    <html lang="en">
    <body>
      <h2>Login with <a href="${profiles.github.login}">Github</a></h2>
    </body>
    </html>`

		return new Response(html, { headers: { 'Content-Type': 'text/html' } })
	})
	.listen(3000)

console.log(`${app.server!.url}`)
