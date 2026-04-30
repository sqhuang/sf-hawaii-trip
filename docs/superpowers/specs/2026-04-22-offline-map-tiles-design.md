# Offline Map Tiles Design

## Summary
Extend the existing PWA so Leaflet map tiles are available offline for the three trip regions (SF Bay Area, Oʻahu, Big Island). Today the service worker caches the page shell and images but leaves tile requests untouched, so offline users see gray squares anywhere they did not manually pan while online. Add an opt-in pre-download flow plus ambient runtime caching so the map stays useful on planes, rental cars with spotty LTE, and remote stops like Mauna Kea.

## Goals
- Allow the user to pre-download tiles for all trip regions before the trip in one intentional action.
- Continue caching any tile the user views online so the map self-heals as they explore.
- Keep total tile storage within a predictable budget (target: under 30 MB for all regions).
- Respect the OpenStreetMap tile usage policy (bounded volume, attribution, sensible throttling).
- Make the download progress and storage state visible so the user can trust what is cached.

## Non-Goals
- No switch to a paid or account-gated tile provider (Mapbox, Stadia, Thunderforest).
- No support for turn-by-turn navigation or offline routing.
- No offline geocoding or search.
- No custom vector tiles or styled basemaps.
- No automatic periodic re-download or background sync.

## User Experience

### Entry point
Add a single control labeled "🗺️ 离线地图" in a low-key location:
- Place it in the `#view-mode-switch` footer area, or as a button in the map card header, whichever fits the visual weight.
- Exact placement is an implementation detail; the spec only requires it is reachable from both mobile and desktop modes without extra menus.

### Primary flow (not yet downloaded)
1. Button shows `🗺️ 离线地图 · 未下载`.
2. Tapping the button opens a lightweight dialog (modal or inline panel) with:
   - A short explanation of what gets downloaded (e.g. `SF + 夏威夷共 3 个区域，约 20 MB`).
   - A "开始下载" button.
   - A "取消" button.
3. On "开始下载":
   - The button label changes to `下载中 42%`.
   - The dialog shows region-by-region progress.
   - The user can close the dialog; progress still runs and the button keeps reporting percent.
4. On success:
   - The button label becomes `🗺️ 离线地图 · 已下载 · 23.4 MB`.
   - A toast / inline confirmation says `三个区域已缓存，离线可用`.
5. On failure (network drop, user cancels, quota exceeded):
   - Button reverts to `未下载` or `部分缓存`, with a one-line error hint.
   - Partial progress is preserved — restarting resumes from where it stopped.

### Already downloaded
- Tapping the button shows stored size and a `清除缓存` action.
- Clearing removes the offline tile cache but not the page shell cache.

### Ambient behavior (always on)
- Any tile the user loads while online is silently stored in a runtime tile cache, independent of the pre-download flow.
- This means casual panning automatically extends offline coverage without the dialog.

## Functional Requirements

### Tile identification
- The service worker matches requests to the OpenStreetMap tile origin (`tile.openstreetmap.org`) and any load-balanced subdomains (`a.`, `b.`, `c.`) and routes them through the tile-cache strategy instead of the generic runtime cache.
- A dedicated cache name `travel-tiles-<CACHE_VERSION>` isolates tiles from the page shell so they can be cleared independently.

### Region definition
The three regions are expressed as bounding boxes plus zoom ranges:

| Region        | Approximate bounding box (lat/lng corners)              | Zoom levels |
|---------------|---------------------------------------------------------|-------------|
| SF Bay Area   | northwest 37.88, -122.52 → southeast 37.40, -122.17     | 10–14       |
| Oʻahu         | northwest 21.72, -158.30 → southeast 21.22, -157.60     | 10–14       |
| Big Island    | northwest 19.95, -155.70 → southeast 19.25, -154.80     | 10–13       |

Rationale:
- SF and Oʻahu include several urban stops close together, so zoom 14 is useful.
- Big Island is geographically large; zoom 13 is enough for Mauna Kea, Volcano NP, Hilo without blowing the tile budget.
- Zoom 10 is the common low-zoom anchor so zooming out still has context.

Exact coordinates are finalized in the implementation plan. The spec fixes only the ranges and which regions exist.

### Pre-download flow
- Compute the tile list per region using slippy-map tile math: for each zoom level, map the bounding box to a `(x, y)` tile grid.
- Total tile count per region must be capped — if exceeded, the plan must either trim zoom levels or error out loudly rather than silently truncating.
- Download tiles with a configurable concurrency (default 4) and short jitter between batches to avoid hammering OSM.
- Progress is reported as `(completed, total)` per region and overall, published via a `postMessage` channel from the service worker to the page.
- Individual tile failures are logged and counted but do not abort the whole download.
- After the queue drains, the page receives a completion message with final stored count and total size.

### Runtime tile caching
- Any tile request made by Leaflet outside the pre-download flow is served cache-first, then fetched and stored on miss.
- Cache writes respect the `travel-tiles-<CACHE_VERSION>` namespace, so a single "clear offline map" action wipes both pre-downloaded and ambient tiles.

### Cache management
- Enforce a soft cap on total tile cache size (e.g. 40 MB). When exceeded, evict oldest entries (LRU) until the cap is met. Eviction is optional in v1 if the download budget already keeps us under the cap.
- Expose total stored bytes to the UI via `navigator.storage.estimate()` when available, or by tracking a counter in `IndexedDB` / `localStorage`.
- `清除缓存` deletes only the tile cache namespace; the page shell cache is unaffected.

### Attribution
- Leaflet already shows the `© OpenStreetMap` attribution. No change required, but the pre-download dialog should mention OpenStreetMap as the source so the user understands why we cap volume.

## Technical Considerations

### OSM tile usage policy
- The OpenStreetMap Foundation's tile usage policy forbids bulk downloads distributed via app stores but allows modest caching for personal apps.
- The plan must document current policy status and add a polite `User-Agent` signature on pre-download requests where the fetch API permits (browsers may override, but the intent is captured).
- If future scaling is needed, the implementation plan should call out switching to a provider with an explicit tile-download allowance.

### Browser storage quotas
- Service Worker cache is subject to the origin storage quota (browser-dependent, often 50–60% of free disk on modern browsers).
- iOS Safari is more restrictive (~50 MB baseline for PWAs not installed to home screen).
- The 30 MB target keeps us safely under iOS thresholds.
- The implementation plan should test `navigator.storage.persist()` to prevent eviction under memory pressure.

### Service worker message channel
- Pre-download is driven from the page (so the user gesture that triggers it has permission context) but executed in the service worker (so it can write directly to the Cache Storage).
- Use `postMessage` with a typed command protocol (`PRECACHE_TILES_START`, `PRECACHE_TILES_PROGRESS`, `PRECACHE_TILES_DONE`, `CLEAR_TILES`).

### Leaflet integration
- No Leaflet-specific library required. The existing `L.tileLayer(...).addTo(map)` call already hits the URLs the service worker intercepts — no page-side code change is needed for runtime caching to work.
- Pre-download is driven from the page but does not require Leaflet; it only needs the tile URL template and the region math.

## Implementation Approach

Keep the implementation inside the existing single-page structure plus `sw.js`. The spec assumes no new build step.

### index.html
- Add the "离线地图" button with a state machine in the trip header or map card.
- Add a modest dialog / panel implemented with the existing visual language.
- Add the page-side controller that posts commands to the service worker and listens for progress messages.
- Surface storage size via `navigator.storage.estimate()`.

### sw.js
- Add a tile-matching fetch handler that uses a dedicated cache name.
- Add a `message` handler for `PRECACHE_TILES_START` / `CLEAR_TILES` commands.
- Implement tile enumeration (slippy math) and concurrency-limited download.

### manifest / icons
- No change required.

## Edge Cases

- **Quota exceeded during download**: stop gracefully, report which regions completed, leave completed regions in cache.
- **Network drop mid-download**: pause at current progress; a subsequent `开始下载` continues by skipping tiles already cached (cache hits make the request a no-op).
- **OSM origin temporarily 5xx**: log and skip the tile; the user can re-run download to fill gaps.
- **User clears cache via OS-level site data reset**: PWA loses all cache; next launch re-precaches page shell but tiles remain "未下载" until the user opts in.
- **User in low-storage device mode**: `navigator.storage.persist()` may be denied; document this and warn the user in the dialog.
- **Multiple tabs open**: prevent overlapping downloads by ignoring `PRECACHE_TILES_START` if an active job exists and posting `PRECACHE_TILES_BUSY` back.
- **Service worker update during download**: the in-flight job runs in the old SW instance; the new SW takes over next launch. Acceptable — not worth the complexity to migrate mid-flight.

## Testing Plan

Manual verification:

1. **First download on wifi**
   - Open page, confirm button reads `未下载`.
   - Click, confirm dialog shows three regions and rough size estimate.
   - Start download; progress counts up; dialog is dismissible and button still updates.
   - On completion, stored size is within 15–30 MB; button reads `已下载 · X.X MB`.

2. **Offline browsing after download**
   - Go offline (devtools throttling or airplane mode).
   - Open page; map renders without gray tiles in each of: SF (Fisherman's Wharf → SFO), Oʻahu (Waikiki → Kualoa → Byodo), Big Island (Hilo → Mauna Kea → Volcano NP) for zoom levels 10–14 (or 10–13 for Big Island).
   - Zooming past the cached range shows gray tiles gracefully — no crash.

3. **Ambient caching**
   - With offline tile cache cleared, online-pan across a new area (e.g. SFO airport detail at zoom 15).
   - Go offline; that specific area now renders without gray.

4. **Clear cache**
   - Tap `清除缓存`; confirm tile cache is emptied, page shell cache remains, and the button reverts to `未下载`.

5. **Partial failure recovery**
   - Start download, disable wifi mid-way; observe graceful stop.
   - Re-enable wifi and restart download; it completes without re-fetching the already-cached tiles (verified via network tab — cache hits produce no outgoing request).

6. **Storage quota enforcement**
   - Using devtools, simulate quota pressure or manually fill storage; confirm download aborts before the browser's hard eviction kicks in.

## Acceptance Criteria

- A user on wifi can download all three trip regions in one dialog-driven action and see progress.
- After download, the map is fully usable offline for each trip region at the stated zoom ranges.
- The existing page shell, checklist sync, and other PWA behaviors are unaffected — offline tiles are additive.
- Total tile cache stays under 30 MB under normal conditions.
- The user can inspect stored size and wipe the tile cache without affecting other PWA data.
- OpenStreetMap attribution remains visible; no bulk download policy is violated.
