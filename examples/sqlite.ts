import { Elysia } from 'elysia';
import oauth2, {
  azure,
  discord,
  github,
  spotify,
  reddit,
  google,
  twitch,
  validateToken
} from '../src';

import { randomBytes } from 'crypto';
import { Database } from 'bun:sqlite';

const db = new Database(':memory:');

db.run(
  'CREATE TABLE IF NOT EXISTS storage (uuid TEXT, name TEXT, token TEXT, PRIMARY KEY(uuid, name))'
);

const uuid = '1f46b510-e674-4ae7-b6fc-d0872c9a4252';

const states = new Set();

const app = new Elysia();

const twitchProvider = twitch();

const auth = oauth2({
  profiles: {
    azure: {
      provider: azure({ tenant: 'consumers' }),
      scope: ['User.Read']
    },
    github: {
      provider: github(),
      scope: ['user']
    },
    discord: {
      provider: discord({ prompt: 'none' }),
      scope: ['identify']
    },
    spotify: {
      provider: spotify(),
      scope: ['user-read-private']
    },
    reddit: {
      provider: reddit(),
      scope: ['identity']
    },
    google: {
      provider: google(),
      scope: ['https://www.googleapis.com/auth/userinfo.profile']
    },
    twitch: {
      provider: twitchProvider,
      scope: ['user:read:follows']
    }
  },
  state: {
    check(req, name, state) {
      if (states.has(state)) {
        states.delete(state);
        return true;
      }

      return false;
    },
    generate(req, name) {
      const state = randomBytes(8).toString('hex');
      states.add(state);
      return state;
    }
  },
  storage: {
    async get(req, name) {
      console.log(`get token: ${name}`);

      const token = (
        db
          .query('SELECT token FROM storage WHERE uuid = ? AND name = ?')
          .get(uuid, name) as { token: string }
      )?.token;

      if (!token) {
        return;
      }

      return JSON.parse(token);
    },
    async set(req, name, token) {
      console.log(`new token: ${name}`);

      db.run(
        'INSERT OR REPLACE INTO storage (uuid, name, token) VALUES (?, ?, ?)',
        [uuid, name, JSON.stringify(token)]
      );
    },
    async delete(req, name) {
      db.run('DELETE FROM storage WHERE uuid = ? AND name = ?', [uuid, name]);
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
    const profiles = ctx.profiles();

    if (await ctx.authorized('azure')) {
      // https://docs.microsoft.com/en-us/graph/api/user-get
      const user = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: await ctx.tokenHeaders('azure')
      });

      return userPage(await user.json(), profiles.azure.logout);
    }

    if (await ctx.authorized('github')) {
      // https://docs.github.com/en/rest/users/users#get-the-authenticated-user
      const user = await fetch('https://api.github.com/user', {
        headers: await ctx.tokenHeaders('github')
      });

      return userPage(await user.json(), profiles.github.logout);
    }

    if (await ctx.authorized('discord')) {
      // https://discord.com/developers/docs/resources/user#get-current-user
      const user = await fetch('https://discord.com/api/v10/users/@me', {
        headers: await ctx.tokenHeaders('discord')
      });

      return userPage(await user.json(), profiles.discord.logout);
    }

    if (await ctx.authorized('spotify')) {
      // https://developer.spotify.com/documentation/web-api/reference/#/operations/get-current-users-profile
      const user = await fetch('https://api.spotify.com/v1/me', {
        headers: await ctx.tokenHeaders('spotify')
      });

      return userPage(await user.json(), profiles.spotify.logout);
    }

    if (await ctx.authorized('reddit')) {
      // https://www.reddit.com/dev/api/oauth/#GET_api_v1_me
      const user = await fetch('https://oauth.reddit.com/api/v1/me', {
        headers: await ctx.tokenHeaders('reddit')
      });

      return userPage(await user.json(), profiles.reddit.logout);
    }

    if (await ctx.authorized('google')) {
      // https://cloud.google.com/identity-platform/docs/reference/rest/v1/UserInfo
      const user = await fetch(
        'https://www.googleapis.com/oauth2/v1/userinfo',
        {
          headers: await ctx.tokenHeaders('google')
        }
      );

      return userPage(await user.json(), profiles.google.logout);
    }

    if (await ctx.authorized('twitch')) {
      const tokenHeaders = await ctx.tokenHeaders('twitch');

      if ((await validateToken(tokenHeaders)).status === 200) {
        // https://dev.twitch.tv/docs/api/reference/#get-users
        const user = await fetch('https://api.twitch.tv/helix/users', {
          headers: { 'Client-Id': twitchProvider.clientId, ...tokenHeaders }
        });

        return userPage(await user.json(), profiles.twitch.logout);
      }
    }

    const html = `<!DOCTYPE html>
    <html lang="en">
    <body>
      Login:
      <ul>
        ${Object.entries(profiles)
          .map(([name, { login }]) => `<li><a href="${login}">${name}</a></li>`)
          .join('\n')}
      </ul>
    </body>
    </html>`;

    return new Response(html, { headers: { 'Content-Type': 'text/html' } });
  })
  .listen(3000);

console.log(`http://localhost:3000`);

