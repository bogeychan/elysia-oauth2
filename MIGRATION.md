# Migration Guide

## v0.0.15 to v0.0.16

### `Context` is passed to `Storage` and `State` instead of `Request`

Use:

```ts
const auth = oauth2({
	// ...
	state: {
		check({ request }, name, state) {
			// ...
		},
		generate({ request }, name) {
			// ...
		}
	},
	storage: {
		get({ request }, name) {
			// ...
		},
		set({ request }, name, token) {
			// ...
		},
		delete({ request }, name) {
			// ...
		}
	}
})
```

Instead of:

```ts
const auth = oauth2({
	// ...
	state: {
		check(req, name, state) {
			// ...
		},
		generate(req, name) {
			// ...
		}
	},
	storage: {
		get(req, name) {
			// ...
		},
		set(req, name, token) {
			// ...
		},
		delete(req, name) {
			// ...
		}
	}
})
```
