# kushop

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Roles

New accounts are members by default. Bootstrap the first administrator by setting an existing member's `dutyId` to `admin` in the database. Administrators can promote and demote other members from the Database page; the last administrator cannot be demoted.

```sql
UPDATE "members" SET "dutyId" = 'admin' WHERE "memEmail" = 'admin@example.com';
```

The login-page admin sign-in is development-only. Set `ENABLE_DEV_ADMIN_BYPASS=true`, `DEV_ADMIN_EMAIL`, and `DEV_ADMIN_PASSCODE` in the server `.env`. The configured email must belong to an existing admin member; the session uses that database account. It is rejected whenever `NODE_ENV=production`.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
