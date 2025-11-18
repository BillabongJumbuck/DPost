This repository is a Vue 3 + TypeScript single-page app built with Vite and pnpm. The file below gives focused, actionable guidance for AI coding agents to be productive quickly in this codebase.

Quick setup
- `pnpm install` : install dependencies (project uses `pnpm` as declared in `package.json`).
- `pnpm dev` : run the dev server (`vite`).
- `pnpm build` : production build (runs `vue-tsc --build` then `vite build`).
- `pnpm run type-check` : run `vue-tsc` incremental type checks.

Project big picture
- Frontend-only UI: entry `src/main.ts` mounts `App.vue` which renders `src/Layout/DefualtLayout.vue`.
- Routing: `src/router/index.ts` controls views (`src/views/*`). Add new pages there.
- UI library: Element Plus is used with auto-imports (see `vite.config.ts` -> `unplugin-auto-import` and `unplugin-vue-components`). Do not manually add imports for ElementPlus components that are already auto-resolved.
- Styling: Tailwind + SCSS. Global styles are in `src/assets/index.css` and `src/assets/scss/`.

Key configuration and conventions
- Path alias: `@` -> `src` (configured in `vite.config.ts`). Use `@/components/...` or `@/views/...`.
- API base: `src/config/api.ts` defines `BASE_URL` for server endpoints.
- Runtime API override: some services (e.g. `src/services/auto.ts`) read `import.meta.env.VITE_API_BASE_URL` — tests and CI may rely on this env var. When adding integration endpoints prefer using `src/config/api.ts` for app-level endpoints, or follow existing `buildURL`/`VITE_API_BASE_URL` pattern for optional proxying.
- Error handling: services use `fetch` and generally parse `response.text()` then `JSON.parse` safely; follow the same pattern when adding HTTP helpers to keep consistent error messages.

Source layout and hotspots (examples)
- Entry: `src/main.ts` — global plugins: Element icons, `vue-tippy`, router.
- Layout: `src/App.vue` (renders `DefualtLayout.vue`) and `src/Layout/DefualtLayout.vue` (note the misspelling `DefualtLayout` — keep exact name when editing).
- Features grouped under `src/components/`: `Auto/`, `Rest/`, `Lenses/`, `Hopp/` — add related components into these folders.
- Services: `src/services/auto.ts` — canonical example of API interactions and typed payload/response objects.
- Schema and validation: `src/schema/jsonSchemaValidator.ts` and `src/schema/schema.json` — use these for request/response validation logic.
- Models and utilities: `src/utility/model/` and `src/utility/helper/` — utilities such as `jsoncPretty.ts`, `contenttypes.ts`, `useCodemirror.ts` contain patterns for working with editor components.

Developer workflow notes
- Type safety: `pnpm run type-check` must pass as part of the build pipeline. New types should be added under `src/utility/model` or alongside the related feature.
- Formatting/linting: `pnpm run lint` and `pnpm run format` are available (prettier + eslint). Keep to existing code style and avoid reformatting unrelated files.
- Devtools: `vite-plugin-vue-devtools` is included in dev only — safe to use when debugging locally but avoid adding dev-only dependencies to production code.

Patterns agents should follow
- Prefer using existing composables and helpers in `src/components/Auto/composables` and `src/utility/helper` instead of creating duplicates.
- When editing UI, check `unplugin-auto-import` and `unplugin-vue-components` in `vite.config.ts` to avoid adding manual imports for ElementPlus UI.
- Keep network code consistent with `src/services/auto.ts`: use typed payloads/responses, FormData for file uploads, and consistent error messages.
- Use `@/` alias for imports; do not mix relative deep paths when the alias is available.

Files to check when making common changes
- Add new route/view: `src/router/index.ts`, `src/views/` and update `src/Layout/DefualtLayout.vue` navigation if needed.
- Add API endpoint: put config in `src/config/api.ts` and implement calls in `src/services/*` following existing fetch patterns.
- Add UI component: `src/components/<feature>/` and register usage in the view; rely on auto-import for ElementPlus UI.

Other notes & gotchas
- The layout filename `DefualtLayout.vue` is misspelled intentionally in the repo; keep names exact to avoid import breakage.
- The repo uses `pnpm` specifically (see `packageManager` in `package.json`) — use `pnpm` to reproduce the environment.
- Many files are TypeScript + Vue Single File Components; follow existing `lang="ts"` conventions.

If anything in these instructions is unclear or you'd like more detail about a specific area (routing, API patterns, or UI conventions), tell me which area to expand and I'll iterate.
