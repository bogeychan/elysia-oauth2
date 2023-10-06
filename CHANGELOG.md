# 0.0.16 - 06 Oct 2023

Feature:

- make `async` optional in `Storage`

Improvement:

- added [Migration guide](./MIGRATION.md)
- added [Prettier config](./.prettierrc)

Bug fix:

- await `storage.set`

Breaking Change:

- pass `Context` to `Sate` and `Storage` instead of `Request`

  For more details checkout the [migration guide](./MIGRATION.md)

# 0.0.15 - 04 Oct 2023

Feature:

- twitch oauth2 provider [#4](https://github.com/bogeychan/elysia-oauth2/pull/4)

# 0.0.14 - 03 Oct 2023

Feature:

- add support for async state [#5](https://github.com/bogeychan/elysia-oauth2/pull/5)

# 0.0.13 - 24 Sep 2023

Bug fix:

- update to elysia 0.7.12

# 0.0.12 - 19 Sep 2023

Bug fix:

- space-delimited list of scopes [#3](https://github.com/bogeychan/elysia-oauth2/issues/3)

# 0.0.11 - 08 Sep 2023

Feature:

- update to elysia 0.6.19
