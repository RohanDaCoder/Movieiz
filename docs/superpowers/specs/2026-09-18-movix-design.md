# Movix Design Spec

**Date:** 2026-09-18
**Status:** Approved (all 4 sections + Biome + contracts-first + parallel execution)
**Author:** brainstorming session with project owner

## 1. Goal

Build **Movix**, a movie + TV streaming discovery and playback web app deployed as a
static site on Netlify. Content metadata comes from TMDB; playback embeds come from
CineSrc (`https://cinesrc.st/docs`), keyed by TMDB IDs.

## 2. Scope (v1)

### In scope

- Home: trending hero + rows (trending movies, trending TV, top-rated, per-genre strips;
  genre browsing is via these strips plus the discover genre filter — no dedicated genre page)
- Search with type tabs (All / Movies / TV) on `search/multi` (people results filtered out)
- Discover browse (no query): `discover/movie` + `discover/tv` with server-side filters —
  type, year, multi-select genres, min rating, sort — synced both ways with URL params
  (`/search?type=tv&year=2024&genre=18&minRating=7`) so filtered views are shareable
- Details pages for movies and TV (backdrop, meta, genres, overview, cast strip via
  `credits` append, season list for TV)
- Watch pages: CineSrc iframe player, season/episode picker for TV, resume playback,
  up-next behavior, error fallback card
- Watchlist (localStorage) and Continue Watching / history (localStorage)
- Dark cinema visual identity with crossfading grain-textured hero as signature element

### Non-goals (v1)

- User accounts / server-side persistence (localStorage only)
- Trailers, reviews, person pages, collections, watch providers
- SSR, offline support, native apps

## 3. Tech stack

| Concern | Choice |
|---|---|
| Runtime / package manager | Bun (local 1.4.2; `BUN_VERSION` pinned in Netlify env; `bun.lock` committed, no other lockfiles). All commands via `bun` / `bunx`, never `npx` |
| Scaffold | React + Vite + TypeScript (strict, `noUnusedLocals`), latest at scaffold time, versions recorded in `bun.lock` |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` plugin + `@import "tailwindcss"` |
| Components | shadcn (via `bunx shadcn@latest init` / `add`), `@` path alias to `./src` |
| Icons | `lucide-react` |
| Routing | `react-router-dom` with SPA rewrite `/* -> /index.html 200` |
| TMDB access | `@lorenzopant/tmdb` SDK (v1.25.3 verified 2026-09-18: fully typed incl. `append_to_response`, rate-limit queue, request dedup, TTL cache, typed `TMDBError`, image URL builder). Runner-up `tmdb-ts` rejected: maintained but lacks rate-limit/cache/image-builder |
| Playback | CineSrc iframe embeds (no SDK; URL contract owned by `EmbedUrlBuilder`) |
| Quality | `bun run typecheck` + Biome 2.x (`biome check` locally, `biome ci` in CI/Netlify; package pinned with `-E`) + `bun run build` |

### Dependency risk note

`@lorenzopant/tmdb` is single-maintainer (~2.6k weekly downloads). Mitigation: all SDK
contact lives behind `CatalogService`; swapping clients touches one file.

## 4. Architecture

Dependencies point inward; no cycles:

```text
routes/pages → hooks (thin adapters) → services (OOP classes) → TMDB / localStorage
                ↘ components/ui (shadcn) + components/domain      ↘ lib (single source of truth)
```

- Components and hooks never call `fetch` directly and never build URLs.
- Image URLs only via the SDK image builder. Genre id→name maps, date/year
  formatting, and rating display each live in exactly one module under `src/lib/`.
- `src/components/ui/**` (shadcn-generated) may carry scoped Biome relaxations;
  global rules stay strict. No `any` anywhere else.

## 5. Routes

| Route | Purpose |
|---|---|
| `/` | Hero (top trending backdrop, Play + Details) + content rows |
| `/search` | Debounced search + type tabs + filter bar; query params hold all state |
| `/movie/:id` | Movie details |
| `/tv/:id` | TV details + season list |
| `/watch/movie/:id` | Movie player |
| `/watch/tv/:id?s=&e=` | TV player + season/episode picker |
| `/watchlist` | Saved items grid |
| `/history` | Continue-watching grid |

## 6. Types & OOP contracts (contracts-first)

`src/lib/types.ts` owns **domain types only** (TMDB wire shapes come from the SDK,
never redeclared):

- `MediaType = 'movie' | 'tv'`
- `MediaItem = MovieItem | TvItem` (discriminated union on `mediaType`)
- `Season`, `Episode`, `Genre`
- `DiscoverQuery { type; year?; genreIds: number[]; minRating?; sort?; page }`
- `WatchProgress { mediaType; id; season?; episode?; time; duration; updatedAt }`
- `WatchlistEntry { mediaType; id; title; posterPath: string | null; addedAt }`

Services (all stateful logic lives here):

- `src/services/tmdb.ts` — singleton SDK client (`VITE_TMDB_API_KEY`,
  `language: "en-US"`, `rate_limit` + `cache` on); re-exports SDK types
- `CatalogService` — sole import for components/hooks. Normalizes movie/TV into
  `MediaItem`. Methods: `trending()`, `search()`, `discover(q: DiscoverQuery)`,
  `movieDetails()`, `tvDetails()`, `season()`, `genres()`
- `EmbedUrlBuilder` — static pure methods `movie(id, opts?)` / `episode(id, s, e, opts?)`;
  opts `{ back; autoplay; autonext; resumeSeconds }`. Sole owner of the CineSrc URL contract:
  `https://cinesrc.st/embed/movie/{tmdb_id}`,
  `https://cinesrc.st/embed/tv/{id}?s={season}&e={episode}`
- `LocalStore<T>` — generic typed localStorage base (`movix:` namespace, JSON-safe).
  `WatchlistStore` (toggle/isSaved) and `ProgressStore` (upsert keyed by
  `type:id:s:e`; prune entries >90% watched or older than 60 days) extend it
- Hooks (`useTrending`, `useSearch`, `useDiscover`, `useDetails`, `useWatchlist`,
  `useProgress`) are thin adapters exposing `{ data, loading, error }`

Contract discipline for parallel work: agents treat `types.ts` + `services/` as
read-only. Needed contract changes stop the stream and go through the coordinator.

## 7. Pages, components & player behavior

- `HomePage`: hero + `MediaRow` strips (horizontal scroll, poster cards)
- `SearchPage`: 500 ms debounced input; text → multi-search + client type tabs;
  empty → discover browse with filter bar
- `DetailsPage`: shared layout for movie/TV; backdrop header, meta row
  (year, runtime / season count, rating, genres), overview, cast strip, season list,
  Play button
- `WatchPage`: `PlayerFrame` (16:9 responsive iframe,
  `allow="autoplay; fullscreen; picture-in-picture"`, click-to-play facade,
  lazy-mount) + `SeasonEpisodePicker` (TV) + up-next
- `WatchlistPage`, `HistoryPage`: grids with remove/clear
- Shared: `MediaCard` (poster, rating badge, watchlist toggle), `MediaRow`,
  `MediaGrid` (+ skeletons), `RatingBadge`, `GenrePills`, `EmptyState`, `ErrorState`
  on shadcn `button/dialog/select/slider/skeleton/tabs`

`PlayerController` class (not the component) owns playback logic:

- URL from `EmbedUrlBuilder` with `back=<details-url>`, `autonext=true` (TV),
  `t=<savedSeconds>` with default `continueprompt` when resuming
- Origin-checked (`https://cinesrc.st`) `postMessage` handling:
  `timeupdate` → throttled 5 s `ProgressStore.upsert`;
  `ended` → complete/prune;
  `nextepisode` with `internalNavigation: true` → sync picker without iframe remount;
  `error` → fallback card (retry + back-to-details)

## 8. Visual direction

- Near-black `#0a0a0f` base, marquee-gold accent, slate surfaces (4–6 CSS-var tokens)
- Condensed display face for hero/titles, grotesque for body, tabular numerals for
  ratings (exact faces locked at implementation; self-hosted via Bun)
- Full-bleed hero with gradient-to-base melt; rank numerals on Top-10 row
- Signature: crossfading trending backdrops with film-grain overlay + marquee-glow Play
- Copy in plain verbs ("Play", "Save", "Resume"); errors state cause + action

## 9. Deploy & env (Netlify)

- `netlify.toml`: `command = "bun run build"`, `publish = "dist"`,
  `[[redirects]] from = "/*" to = "/index.html" status = 200`
- `VITE_TMDB_API_KEY` (Bearer read token) set in Netlify UI; `.env.example` commits
  the key name only. Frontend keys ship in the bundle — acceptable for TMDB read-only
  tokens; restrict the token in TMDB settings (documented here, not a secret leak)
- Bun auto-detected via `bun.lock`; `BUN_VERSION` pinned

## 10. Prerequisites & open items

1. **TMDB API key** (owner): register at themoviedb.org/settings/api, agree to terms,
   create a read access token. Needed before any data work; blocks nothing else
   (scaffold, design system, player shell proceed with mock/empty states)
2. Font pairing: locked during implementation (frontend-design pass)
3. shadcn base color + radius: chosen at `init` time, recorded here on change

## 11. Execution plan (contracts-first, parallel streams)

1. Sequential: scaffold (Vite + Tailwind + shadcn + Biome + router + env) then type
   contracts + service signatures; review; `typecheck` green
2. Parallel (one agent per domain, fixed file scope, contracts read-only):
   - Stream 1: Home + Details
   - Stream 2: Search + Discover
   - Stream 3: Watch experience
   - Stream 4: Watchlist + History
3. Integrate: conflict check, full `typecheck + biome ci + build`, spot review

## 12. Research log (verified 2026-09-18)

- CineSrc embed spec, customization params, player events/methods — cinesrc.st/docs
- TMDB trending/all, search/multi, movie details, TV details, season details,
  genre movie list, configuration (images), discover/movie (30+ filters) —
  developer.themoviedb.org
- Tailwind v4 Vite plugin setup; shadcn Vite setup — Context7 (sequential `bunx` only;
  parallel `bunx` triggers Windows `EBUSY` cache-copy failures; stale
  `%TEMP%/bunx-*-ctx7@latest` dirs cause repeats — delete and retry)
- Netlify Vite deploys, `_redirects`/`netlify.toml` syntax, Bun build support
  (auto-detect via `bun.lock`/`bun.lockb`, `BUN_VERSION`) — docs.netlify.com + netlify/build
- `@lorenzopant/tmdb` v1.25.3 + `tmdb-ts` v2.3.0 — npm + GitHub README
- Biome v2 install/configure/CI via Bun — biomejs.dev
