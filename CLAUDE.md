# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single personal travel-itinerary PWA for a SF + Hawaii trip (May 2026). Vanilla HTML/CSS/JS, no build step, no tests, no linter. Hosted on Netlify; data is mostly hardcoded in `app.js`.

## Commands

- **Deploy:** `./deploy.sh "commit message"` — does `git add -A`, commits if there are changes, `git push`, then `npx netlify deploy --prod --dir=. --site=f22701df-c172-451a-a370-bdfc7f9cc833`. Production URL: `https://sf-hawaii-trip-2026.netlify.app`. There is no separate build or staging step.
- **Local dev:** open `index.html` directly, or `npx netlify dev` for service-worker testing on `localhost`.
- **No `npm install`** — this repo has no `package.json`. Leaflet and Firebase are loaded from CDNs.

## Architecture

Three files do most of the work: `index.html` (shell), `app.js` (everything dynamic), `sw.js` (offline cache + tile precaching). Read all three before non-trivial changes.

### Data model

`TRIP_DATA` in `app.js` is the single source of truth: `flights`, `hotels`, `carRentals`, `bookingChecklist`, `days[]`, `cities` (map view presets per region), and `flightRoutes`. Adding a new flight/hotel/day usually means editing several of these arrays plus the marker arrays below — they are not derived from each other:

- City pins: `cityCoords` object near the map setup.
- Hotel pins: `hotelCoords` array (separate from `TRIP_DATA.hotels` — used only for map markers).
- Flight arcs: `TRIP_DATA.flightRoutes` (rendering uses curved polylines + numbered midpoint label).
- Per-day activity layers: built automatically from `day.activities` entries that have `lat`/`lng`. Consecutive duplicates and A→B→A round-trips are filtered. Adjacent activities at the same location share one marker number.

### Pacific-centered map coordinates

The map spans HKG (~114°E) to North America (~-122°W) — a Pacific-centered projection. Most marker arrays (`cityCoords`, `hotelCoords`, `cities` view presets) store **longitudes already shifted into the 0–360° range** (e.g. SFO is `237.58`, not `-122.42`). However, `TRIP_DATA.days[].activities[].lat/lng` store raw signed longitudes. The conversion `lng < 0 ? lng + 360 : lng` is applied at render time (e.g. `app.js` ~line 449, ~line 599). When adding new pins, follow whichever convention the array uses; mixing them puts markers in the wrong hemisphere.

### Service worker (`sw.js`)

Three caches with deliberate naming:

- `CORE_CACHE` is **versioned** by `CACHE_VERSION`. Bump that constant on any deploy that changes a precached asset (HTML/CSS/JS/images or pinned CDN URLs in `CORE_ASSETS`). New images or CDN deps must also be added to the `CORE_ASSETS` list.
- `RUNTIME_CACHE` and `TILE_CACHE` are **intentionally unversioned** — bumping `CACHE_VERSION` must not throw away the user's downloaded offline map tiles. The `activate` hook also migrates tiles out of any legacy versioned tile caches.
- Firebase Realtime DB hosts (`*.firebaseio.com`, `*.firebasedatabase.app`) and `/sw.js` itself are explicitly bypassed in `shouldBypass()`.
- Navigations are network-first (so deploys are picked up online); other static requests are cache-first; OSM tile URLs go to `TILE_CACHE` with subdomain (`a./b./c.tile.openstreetmap.org`) collapsed to a canonical key so the cache hits regardless of which subdomain Leaflet rotates to.

### Offline-tile precache protocol

Client (`app.js` "OFFLINE MAP CONTROLLER") and SW (`sw.js` "OFFLINE TILE MESSAGE PROTOCOL") communicate via `postMessage` with these types:

- Client → SW: `PRECACHE_TILES_START`, `PRECACHE_TILES_CANCEL`, `CLEAR_TILES`, `GET_TILE_STATS`.
- SW → client: `PRECACHE_TILES_PROGRESS`, `PRECACHE_TILES_REGION_DONE`, `PRECACHE_TILES_DONE`, `TILE_STATS`, `PRECACHE_TILES_BUSY`.

Region bounds and zoom levels live only in `sw.js` (`TILE_REGIONS`); the dialog UI in `index.html` has matching `data-region="sfo|oahu|hilo"` `<li>` items. Adding a new region means editing both, plus `MAX_TILES_PER_JOB` if the new total could exceed the safety cap.

### Firebase Realtime DB

Used only for the shared booking checklist at path `checklist/<index>` (boolean). The DB URL is hardcoded in `app.js`; no auth — anyone with the URL can write. The trip password gate (sha256 hash in `index.html`) is session-scoped UX, not security.

### View modes, theme, temperature

`localStorage` keys persist user preferences across visits: `travel-view-mode` (`mobile`/`desktop`), `travel-mobile-map-collapsed`, `theme` (`light`/`dark`), `travel-temp-unit` (`c`/`f`), `travel-offline-tile-count`. `index.html` has small inline scripts that read these **before paint** to avoid a flash of the wrong layout/theme — preserve that pattern when touching the early body classes or `<html data-theme>`.

### Current-activity highlight + flight countdown

`getCurrentActivity()` reads the device's local clock and matches it against `day.date` (M/D) and `activity.time` directly — there is no timezone math. The assumption is that the device's clock is in the destination timezone during the trip. The countdown picks the first flight in `TRIP_DATA.flights` whose departure is in the future, so it rolls forward automatically as the trip progresses.

## Conventions / things that bite

- After changing precached files, **bump `CACHE_VERSION`** in `sw.js` or returning users will keep seeing the old shell.
- New CDN-loaded `<script>`/`<link>` URLs in `index.html` must also be added to `CORE_ASSETS` in `sw.js` to stay offline-capable.
- Pacific-centered longitudes — see above; inconsistency is the #1 source of "marker is on the wrong continent" bugs.
- `deploy.sh` does `git add -A` and pushes to GitHub before the Netlify deploy. Don't run it with uncommitted unrelated changes lying around.
- `.netlify/` and `.worktrees/` are git-ignored. The Netlify state in `.netlify/state.json` carries the site ID; don't commit local Netlify config.

## Reference

- Past implementation plans: `docs/plans/*.md` and `docs/superpowers/`. They were written before changes landed and are useful for context, not as authoritative current state — the code is.
