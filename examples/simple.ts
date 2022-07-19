import KingWorld from 'kingworld';
import oauth2, { github } from '../src/index';

import { randomBytes } from 'crypto';

// @ts-ignore -> https://github.com/oven-sh/bun/issues/749
const globalState = randomBytes(8).toString('hex');
let globalToken = null;

const app = new KingWorld<{ store: {}; request: {} }>();

const auth = oauth2({
  profiles: {
    github: {
      provider: github(),
      scope: ['user']
    }
  },
  state: {
    check(req, name, state) {
      return state === globalState;
    },
    generate(req, name) {
      return globalState;
    }
  },
  storage: {
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
    const profiles = ctx.profiles('github');

    if (await ctx.authorized('github')) {
      const user = await fetch('https://api.github.com/user', {
        headers: await ctx.tokenHeaders('github')
      });

      return userPage(await user.json(), profiles.github.logout);
    }

    const html = `<!DOCTYPE html>
    <html lang="en">
    <body>
      <h2>Login with <a href="${profiles.github.login}">Github</a></h2>
    </body>
    </html>`;

    return new Response(html, { headers: { 'Content-Type': 'text/html' } });
  })
  .listen(3000);

console.log(`http://localhost:3000`);
