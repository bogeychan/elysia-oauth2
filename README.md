# @bogeychan/elysia-oauth2

A plugin for [elysia](https://github.com/elysiajs/elysia) for server-side [OAuth 2.0 Authorization Code Flow](https://www.oauth.com/oauth2-servers/server-side-apps/authorization-code/)

## Installation

```bash
bun add @bogeychan/elysia-oauth2
```

## Usage

```ts
import { Elysia } from 'elysia';
import oauth2, { github } from '@bogeychan/elysia-oauth2';

import { randomBytes } from 'crypto';

const globalState = randomBytes(8).toString('hex');
let globalToken = null;

// typescript type support
const app = new Elysia();

const auth = oauth2({
  profiles: {
    // define multiple OAuth 2.0 profiles
    github: {
      provider: github(),
      scope: ['user']
    }
  },
  state: {
    // custom state verification between requests
    check(req, name, state) {
      return state === globalState;
    },
    generate(req, name) {
      return globalState;
    }
  },
  storage: {
    // storage of users' access tokens is up to you
    async get(req, name) {
      return globalToken;
    },
    async set(req, name, token) {
      globalToken = token;
    },
    async delete(req, name) {
      globalToken = null;
    }
  }
});

function userPage(user: {}, logout: string) {
  const html = `<!DOCTYPE html>
    <html lang="en">
    <body>
      User:
      <pre>${JSON.stringify(user, null, '\t')}</pre>
      <a href="${logout}">Logout</a>
    </body>
    </html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}

app
  .use(auth)
  .get('/', async (ctx) => {
    // get login, callback, logout urls for one or more OAuth 2.0 profiles
    const profiles = ctx.profiles('github');

    // check if one or more OAuth 2.0 profiles are authorized
    if (await ctx.authorized('github')) {
      const user = await fetch('https://api.github.com/user', {
        // ... and use the Authorization header afterwards
        headers: await ctx.tokenHeaders('github')
      });

      return userPage(await user.json(), profiles.github.logout);
    }

    // Render login page
    const html = `<!DOCTYPE html>
    <html lang="en">
    <body>
      <h2>Login with <a href="${profiles.github.login}">Github</a></h2>
    </body>
    </html>`;

    return new Response(html, { headers: { 'Content-Type': 'text/html' } });
  })
  .listen(3000);

console.log('Listening on http://localhost:3000');
```

## Where are the client credentials?

1. Generate a `client id` and `client secret` for an [OAuth app on Github](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app)
2. Use `http://localhost:3000/login/github/authorized` as your `Authorization callback URL`
3. Create an `.env` file based on the previously generated client credentials:
   ```env
   GITHUB_OAUTH_CLIENT_ID=client id
   GITHUB_OAUTH_CLIENT_SECRET=client secret
   ```
4. [bun.js](https://bun.sh/) automatically loads environment variables from `.env` files

If you are unsure which URL should be used as `Authorization callback URL` call `ctx.profiles()` without an argument to get all URLs of all registered OAuth 2.0 Profiles:

```ts
app
  .use(auth)
  .get('/', (ctx) => {
    return ctx.profiles();
  })
  .listen(3000);
```

## Use predefined OAuth 2.0 providers

```ts
import { azure, discord, github, ... } from '@bogeychan/elysia-oauth2';
```

- All available providers are listed inside the [providers](./src/providers) folder.

- Checkout the [examples](./examples) folder on github for further use cases such as the [sqlite module of bun.js](https://github.com/oven-sh/bun#bunsqlite-sqlite3-module).

## Define your own OAuth 2.0 provider

```ts
import oauth2, { TOAuth2Provider } from '@bogeychan/elysia-oauth2';

function myGithub(): TOAuth2Provider {
  return {
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',

    auth: {
      url: 'https://github.com/login/oauth/authorize',
      params: {
        allow_signup: true
      }
    },

    token: {
      url: 'https://github.com/login/oauth/access_token',
      params: {}
    }
  };
}

const auth = oauth2({
  profiles: {
    github: {
      provider: myGithub(),
      scope: ['user']
    }
  }
  // ...
});
```

## Author

[bogeychan](https://github.com/bogeychan)

## License

[MIT](LICENSE)
