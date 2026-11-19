# bb-web-shell

App (type **spa**) built with [shared-lib-web](https://www.npmjs.com/package/shared-lib-web).
App key (base name): **BOTNBOLT** — storage keys `BOTNBOLT-TOKEN`, `BOTNBOLT-LANG` ...

```bash
npm install
npm run dev      # http://localhost:4000
npm run build    # -> dist/
```

- `public/env.js` — runtime settings: `REACT_APP_BOTNBOLT_API_BASE_URL` (no rebuild needed)
- `src/config.ts` — the app config (app key, languages, themes, layout, http, menu)
- `src/modules/<module>/` — pages: `<module>.page.tsx`, `components/`, `hooks/`
# poc-shared-lib-web-spa
