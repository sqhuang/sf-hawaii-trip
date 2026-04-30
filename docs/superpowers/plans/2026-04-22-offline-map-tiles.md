# Offline Map Tiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the user pre-download OSM tiles for SF / Oʻahu / Big Island so the map stays useful offline, and cache any tile they view online as a bonus.

**Architecture:** Extend the existing service worker with a dedicated `travel-tiles-<VERSION>` cache. Canonicalize `a/b/c.tile.openstreetmap.org` to a single host before cache match/put so Leaflet's subdomain rotation does not cause cache misses. Drive the download from the page via a message protocol (`PRECACHE_TILES_START`, `CLEAR_TILES`, `GET_TILE_STATS`), with the SW doing slippy-math tile enumeration and a 4-way concurrent download queue.

**Tech Stack:** Existing `sw.js`, `index.html`, Leaflet, Cache Storage, `navigator.serviceWorker`, `postMessage`, `localStorage`.

---

## File Structure

### Existing files to modify
- `sw.js` — add tile cache, canonicalization, tile request handler, message protocol, slippy math, downloader.
- `index.html` — add offline-map button inside `#map-panel`, dialog overlay, CSS, page-side controller with SW messaging, button state machine.

### No new runtime files
Everything stays inline in the same two files. The existing `manifest.webmanifest` / `icon.svg` are unchanged.

---

### Task 1: SW tile cache and message protocol

**Files:**
- Modify: `sw.js` (top-level + `fetch` + add `message` handler)
- Test: DevTools Application → Service Workers + Cache Storage

- [ ] **Step 1: Add tile cache constant and subdomain canonicalizer**

Add near the top of `sw.js`, right after `RUNTIME_CACHE`:

```javascript
const TILE_CACHE = `travel-tiles-${CACHE_VERSION}`;

function isOsmTileRequest(url) {
  return url.hostname === 'tile.openstreetmap.org' ||
    /^[abc]\.tile\.openstreetmap\.org$/.test(url.hostname);
}

function canonicalTileUrl(url) {
  // Leaflet rotates a./b./c. subdomains. Collapse them so the cache key is
  // shared regardless of which subdomain actually served the response.
  if (/^[abc]\.tile\.openstreetmap\.org$/.test(url.hostname)) {
    const canonical = new URL(url.toString());
    canonical.hostname = 'tile.openstreetmap.org';
    return canonical.toString();
  }
  return url.toString();
}
```

- [ ] **Step 2: Teach the activate handler to keep the tile cache across versions**

Replace this block in `sw.js`:

```javascript
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CORE_CACHE && key !== RUNTIME_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});
```

With this block:

```javascript
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CORE_CACHE && key !== RUNTIME_CACHE && key !== TILE_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});
```

- [ ] **Step 3: Route tile requests to the tile cache**

Replace this section inside `self.addEventListener('fetch', ...)`:

```javascript
  const url = new URL(request.url);
  if (shouldBypass(url)) return;

  // Navigations (top-level HTML requests): network-first so the freshest
  // itinerary wins online, cache fallback for offline.
  if (request.mode === 'navigate') {
```

With this section:

```javascript
  const url = new URL(request.url);
  if (shouldBypass(url)) return;

  // OSM tiles: dedicated cache, cache-first, subdomain-canonical keys.
  if (isOsmTileRequest(url)) {
    const cacheKey = canonicalTileUrl(url);
    event.respondWith(
      caches.open(TILE_CACHE).then(cache =>
        cache.match(cacheKey).then(hit => {
          if (hit) return hit;
          return fetch(request).then(response => {
            if (response && response.status === 200) {
              cache.put(cacheKey, response.clone()).catch(() => {});
            }
            return response;
          }).catch(() => hit);
        })
      )
    );
    return;
  }

  // Navigations (top-level HTML requests): network-first so the freshest
  // itinerary wins online, cache fallback for offline.
  if (request.mode === 'navigate') {
```

- [ ] **Step 4: Add the message handler shell**

Append this block at the end of `sw.js`:

```javascript
// ===== OFFLINE TILE MESSAGE PROTOCOL =====
let currentPrecacheJob = null;

self.addEventListener('message', event => {
  const data = event.data;
  if (!data || typeof data !== 'object') return;
  const source = event.source;
  if (data.type === 'PRECACHE_TILES_START') {
    if (currentPrecacheJob) {
      source && source.postMessage({ type: 'PRECACHE_TILES_BUSY' });
      return;
    }
    event.waitUntil(runPrecacheJob(source));
  } else if (data.type === 'CLEAR_TILES') {
    event.waitUntil(clearTileCache(source));
  } else if (data.type === 'GET_TILE_STATS') {
    event.waitUntil(sendTileStats(source));
  }
});

async function sendTileStats(source) {
  if (!source) return;
  const cache = await caches.open(TILE_CACHE);
  const keys = await cache.keys();
  source.postMessage({ type: 'TILE_STATS', count: keys.length });
}

async function clearTileCache(source) {
  await caches.delete(TILE_CACHE);
  // Re-create the empty cache so subsequent opens do not re-trigger the
  // browser's slow cold path.
  await caches.open(TILE_CACHE);
  if (source) {
    source.postMessage({ type: 'TILE_STATS', count: 0 });
  }
}

async function runPrecacheJob(source) {
  // Implemented in the next task.
  source && source.postMessage({ type: 'PRECACHE_TILES_DONE', ok: false, reason: 'not-implemented' });
}
```

- [ ] **Step 5: Local load check**

Run:

```bash
open "/Users/huangshengqiu/Public/code/ai_research/travel/index.html"
```

Expected:
- Page loads.
- DevTools → Application → Cache Storage shows `travel-tiles-<version>` appearing after panning the map (runtime caching on).
- No console errors from `sw.js`.

---

### Task 2: Slippy math + concurrent pre-downloader in SW

**Files:**
- Modify: `sw.js` (after the message handler block from Task 1)
- Test: trigger `PRECACHE_TILES_START` from DevTools console, observe progress messages.

- [ ] **Step 1: Add region config + slippy math**

Insert this block in `sw.js` above `runPrecacheJob`:

```javascript
const TILE_REGIONS = [
  {
    id: 'sfo',
    name: '旧金山',
    bounds: { minLat: 37.40, minLng: -122.52, maxLat: 37.88, maxLng: -122.17 },
    minZoom: 10,
    maxZoom: 14
  },
  {
    id: 'oahu',
    name: '欧胡岛',
    bounds: { minLat: 21.22, minLng: -158.30, maxLat: 21.72, maxLng: -157.60 },
    minZoom: 10,
    maxZoom: 14
  },
  {
    id: 'hilo',
    name: '大岛',
    bounds: { minLat: 19.25, minLng: -155.70, maxLat: 19.95, maxLng: -154.80 },
    minZoom: 10,
    maxZoom: 13
  }
];

const MAX_TILES_PER_JOB = 3000; // hard cap; abort and report if exceeded.

function lngToTileX(lng, z) {
  return Math.floor(((lng + 180) / 360) * Math.pow(2, z));
}
function latToTileY(lat, z) {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * Math.pow(2, z)
  );
}

function enumerateRegionTiles(region) {
  const tiles = [];
  const { minLat, minLng, maxLat, maxLng } = region.bounds;
  for (let z = region.minZoom; z <= region.maxZoom; z++) {
    const x0 = lngToTileX(minLng, z);
    const x1 = lngToTileX(maxLng, z);
    const y0 = latToTileY(maxLat, z);
    const y1 = latToTileY(minLat, z);
    const xStart = Math.min(x0, x1);
    const xEnd = Math.max(x0, x1);
    const yStart = Math.min(y0, y1);
    const yEnd = Math.max(y0, y1);
    for (let x = xStart; x <= xEnd; x++) {
      for (let y = yStart; y <= yEnd; y++) {
        tiles.push({ z, x, y });
      }
    }
  }
  return tiles;
}

function tileUrl(tile) {
  // Canonical host so the cache key matches what Leaflet-fetched tiles
  // collapse to after canonicalTileUrl().
  return `https://tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`;
}
```

- [ ] **Step 2: Replace the placeholder `runPrecacheJob` with the real downloader**

Replace this function in `sw.js`:

```javascript
async function runPrecacheJob(source) {
  // Implemented in the next task.
  source && source.postMessage({ type: 'PRECACHE_TILES_DONE', ok: false, reason: 'not-implemented' });
}
```

With this function:

```javascript
async function runPrecacheJob(source) {
  currentPrecacheJob = { cancelled: false };
  const cache = await caches.open(TILE_CACHE);

  const perRegion = TILE_REGIONS.map(region => ({
    region,
    tiles: enumerateRegionTiles(region)
  }));
  const total = perRegion.reduce((n, r) => n + r.tiles.length, 0);

  if (total > MAX_TILES_PER_JOB) {
    currentPrecacheJob = null;
    source && source.postMessage({
      type: 'PRECACHE_TILES_DONE',
      ok: false,
      reason: 'too-many-tiles',
      total
    });
    return;
  }

  let done = 0;
  let failed = 0;

  function postProgress(regionId) {
    source && source.postMessage({
      type: 'PRECACHE_TILES_PROGRESS',
      regionId,
      done,
      total,
      failed
    });
  }

  for (const { region, tiles } of perRegion) {
    const queue = tiles.slice();
    const concurrency = 4;
    async function worker() {
      while (queue.length && !currentPrecacheJob.cancelled) {
        const tile = queue.shift();
        const url = tileUrl(tile);
        try {
          const hit = await cache.match(url);
          if (!hit) {
            const resp = await fetch(url, { cache: 'reload' });
            if (resp && resp.status === 200) {
              await cache.put(url, resp.clone());
            } else {
              failed++;
            }
          }
        } catch (err) {
          failed++;
        }
        done++;
        if (done % 10 === 0 || done === total) postProgress(region.id);
        // Gentle throttle so we do not hammer OSM.
        await new Promise(r => setTimeout(r, 15 + Math.random() * 25));
      }
    }
    const workers = Array.from({ length: concurrency }, worker);
    await Promise.all(workers);
    postProgress(region.id);
    if (currentPrecacheJob.cancelled) break;
  }

  const cancelled = currentPrecacheJob.cancelled;
  currentPrecacheJob = null;

  const stats = await cache.keys();
  source && source.postMessage({
    type: 'PRECACHE_TILES_DONE',
    ok: !cancelled,
    cancelled,
    done,
    total,
    failed,
    stored: stats.length
  });
}
```

- [ ] **Step 3: Add a cancel handler so the user can abort mid-download**

Extend the message handler added in Task 1 Step 4. Replace:

```javascript
  if (data.type === 'PRECACHE_TILES_START') {
    if (currentPrecacheJob) {
      source && source.postMessage({ type: 'PRECACHE_TILES_BUSY' });
      return;
    }
    event.waitUntil(runPrecacheJob(source));
  } else if (data.type === 'CLEAR_TILES') {
```

With:

```javascript
  if (data.type === 'PRECACHE_TILES_START') {
    if (currentPrecacheJob) {
      source && source.postMessage({ type: 'PRECACHE_TILES_BUSY' });
      return;
    }
    event.waitUntil(runPrecacheJob(source));
  } else if (data.type === 'PRECACHE_TILES_CANCEL') {
    if (currentPrecacheJob) currentPrecacheJob.cancelled = true;
  } else if (data.type === 'CLEAR_TILES') {
```

- [ ] **Step 4: Manual SW-only verification from DevTools**

With the page open and the SW active, in the console run:

```javascript
navigator.serviceWorker.controller.postMessage({ type: 'GET_TILE_STATS' });
navigator.serviceWorker.addEventListener('message', e => console.log('[SW]', e.data));
```

Then:

```javascript
navigator.serviceWorker.controller.postMessage({ type: 'PRECACHE_TILES_START' });
```

Expected:
- A stream of `PRECACHE_TILES_PROGRESS` messages with rising `done`.
- A final `PRECACHE_TILES_DONE` with `stored` roughly equal to `total` minus `failed`.
- `travel-tiles-<version>` cache in DevTools contains tiles under `tile.openstreetmap.org/{z}/{x}/{y}.png`.

---

### Task 3: Page UI — button and dialog

**Files:**
- Modify: `index.html` — add button markup inside `#map-panel`, dialog overlay before `</body>`, CSS in the existing `<style>` block.
- Test: manual rendering check in both themes and both modes.

- [ ] **Step 1: Add the offline-map button inside `#map-panel`**

Replace this block in `index.html`:

```html
  <main id="app">
    <div id="map-panel">
      <div id="mobile-map-header">
        <span class="mobile-map-title">🗺️ 地图</span>
        <button type="button" id="mobile-map-toggle" aria-expanded="true" aria-controls="map">收起</button>
      </div>
      <button class="overview-btn" onclick="showOverview()">🌏 全览</button>
      <div id="map"></div>
    </div>
    <div id="itinerary-panel"></div>
  </main>
```

With this block:

```html
  <main id="app">
    <div id="map-panel">
      <div id="mobile-map-header">
        <span class="mobile-map-title">🗺️ 地图</span>
        <button type="button" id="mobile-map-toggle" aria-expanded="true" aria-controls="map">收起</button>
      </div>
      <button class="overview-btn" onclick="showOverview()">🌏 全览</button>
      <button class="offline-map-btn" id="offline-map-btn" type="button">🗺️ 离线</button>
      <div id="map"></div>
    </div>
    <div id="itinerary-panel"></div>
  </main>
```

- [ ] **Step 2: Add the dialog markup before `</body>`**

Insert this block right before the `</body>` closing tag, after the theme-toggle button:

```html
  <div id="offline-map-dialog" class="offline-dialog hidden" role="dialog" aria-modal="true" aria-labelledby="offline-dialog-title">
    <div class="offline-dialog-box">
      <h3 id="offline-dialog-title">🗺️ 离线地图</h3>
      <p class="offline-dialog-desc">
        下载旧金山、欧胡岛、大岛三块区域的地图瓦片，总大小约 20 MB。来源：OpenStreetMap。
      </p>
      <ul class="offline-dialog-regions">
        <li data-region="sfo"><span class="offline-region-name">旧金山</span><span class="offline-region-status">—</span></li>
        <li data-region="oahu"><span class="offline-region-name">欧胡岛</span><span class="offline-region-status">—</span></li>
        <li data-region="hilo"><span class="offline-region-name">大岛</span><span class="offline-region-status">—</span></li>
      </ul>
      <div class="offline-dialog-progress">
        <div class="offline-progress-bar"><div class="offline-progress-fill" style="width:0%"></div></div>
        <div class="offline-progress-text">未开始</div>
      </div>
      <div class="offline-dialog-actions">
        <button type="button" id="offline-download-btn">开始下载</button>
        <button type="button" id="offline-clear-btn" hidden>清除缓存</button>
        <button type="button" id="offline-cancel-btn" hidden>取消下载</button>
        <button type="button" id="offline-close-btn">关闭</button>
      </div>
    </div>
  </div>
```

- [ ] **Step 3: Add the CSS**

Insert this CSS inside the `<style>` block, right after the `.overview-btn:hover` rule:

```css
    .offline-map-btn {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 1000;
      background: #fff;
      border: 2px solid rgba(0, 0, 0, 0.2);
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 0.8rem;
      font-family: inherit;
      cursor: pointer;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
      transition: background 0.2s;
    }
    .offline-map-btn:hover { background: #f0f0f0; }
    body.mobile-mode.map-collapsed .offline-map-btn { display: none; }

    .offline-dialog {
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: rgba(10, 10, 22, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .offline-dialog.hidden { display: none; }
    .offline-dialog-box {
      background: #fff;
      color: #1a1a2e;
      width: 100%;
      max-width: 360px;
      border-radius: 18px;
      padding: 22px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    }
    .offline-dialog-box h3 {
      margin: 0 0 10px;
      font-size: 1.1rem;
    }
    .offline-dialog-desc {
      font-size: 0.85rem;
      color: #555;
      margin: 0 0 14px;
      line-height: 1.5;
    }
    .offline-dialog-regions {
      list-style: none;
      padding: 0;
      margin: 0 0 16px;
      border-top: 1px solid rgba(0,0,0,0.08);
    }
    .offline-dialog-regions li {
      display: flex;
      justify-content: space-between;
      padding: 8px 2px;
      border-bottom: 1px solid rgba(0,0,0,0.08);
      font-size: 0.88rem;
    }
    .offline-region-status {
      color: #888;
      font-variant-numeric: tabular-nums;
    }
    .offline-progress-bar {
      height: 6px;
      background: rgba(0,0,0,0.08);
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 6px;
    }
    .offline-progress-fill {
      height: 100%;
      background: #2E86AB;
      transition: width 0.2s ease;
    }
    .offline-progress-text {
      font-size: 0.78rem;
      color: #666;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
    .offline-dialog-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
      justify-content: flex-end;
    }
    .offline-dialog-actions button {
      border: 1px solid rgba(0,0,0,0.12);
      background: #fff;
      color: #1a1a2e;
      border-radius: 999px;
      padding: 8px 14px;
      font-size: 0.85rem;
      font-family: inherit;
      cursor: pointer;
    }
    #offline-download-btn {
      background: #1a1a2e;
      color: #fff;
      border-color: #1a1a2e;
    }
    #offline-clear-btn { color: #A23B34; border-color: rgba(162,59,52,0.3); }

    [data-theme="dark"] .offline-map-btn { background: #333; color: #eee; border-color: #555; }
    [data-theme="dark"] .offline-dialog-box { background: #1e1e1e; color: #f0f0f0; }
    [data-theme="dark"] .offline-dialog-desc { color: #aaa; }
    [data-theme="dark"] .offline-dialog-regions { border-color: rgba(255,255,255,0.1); }
    [data-theme="dark"] .offline-dialog-regions li { border-color: rgba(255,255,255,0.08); }
    [data-theme="dark"] .offline-region-status { color: #888; }
    [data-theme="dark"] .offline-dialog-actions button {
      background: #2a2a2a;
      color: #f0f0f0;
      border-color: rgba(255,255,255,0.12);
    }
    [data-theme="dark"] #offline-download-btn {
      background: #f0f0f0;
      color: #111;
      border-color: #f0f0f0;
    }
```

- [ ] **Step 4: Visual check**

Run:

```bash
open "/Users/huangshengqiu/Public/code/ai_research/travel/index.html"
```

Expected (no JS wiring yet — button does nothing when clicked):
- A small `🗺️ 离线` button appears top-left of the map panel.
- Dialog markup exists in the DOM but is hidden (`.offline-dialog.hidden`).
- Mobile-collapsed map hides the offline button along with the overview button.

---

### Task 4: Page-side controller

**Files:**
- Modify: `index.html` — append a new `<script>` block before the SW registration, or add to the existing main script.
- Test: manual end-to-end flow.

- [ ] **Step 1: Add the controller script**

Insert this block in the main `<script>` element, right before the SW registration block at the end:

```javascript
    // ===== OFFLINE MAP CONTROLLER =====
    const OFFLINE_TILE_COUNT_KEY = 'travel-offline-tile-count';

    const offlineBtn = document.getElementById('offline-map-btn');
    const offlineDialog = document.getElementById('offline-map-dialog');
    const downloadBtn = document.getElementById('offline-download-btn');
    const clearBtn = document.getElementById('offline-clear-btn');
    const cancelBtn = document.getElementById('offline-cancel-btn');
    const closeBtn = document.getElementById('offline-close-btn');
    const progressFill = offlineDialog.querySelector('.offline-progress-fill');
    const progressText = offlineDialog.querySelector('.offline-progress-text');
    const regionItems = {
      sfo: offlineDialog.querySelector('li[data-region="sfo"] .offline-region-status'),
      oahu: offlineDialog.querySelector('li[data-region="oahu"] .offline-region-status'),
      hilo: offlineDialog.querySelector('li[data-region="hilo"] .offline-region-status')
    };

    const AVG_TILE_KB = 18; // rough OSM tile size for MB display.

    function formatMB(tileCount) {
      const mb = (tileCount * AVG_TILE_KB) / 1024;
      return mb < 1 ? `${Math.round(mb * 1024)} KB` : `${mb.toFixed(1)} MB`;
    }

    function getLastKnownTileCount() {
      const raw = parseInt(localStorage.getItem(OFFLINE_TILE_COUNT_KEY) || '0', 10);
      return Number.isFinite(raw) ? raw : 0;
    }

    function setLastKnownTileCount(count) {
      try {
        localStorage.setItem(OFFLINE_TILE_COUNT_KEY, String(count));
      } catch (err) {}
    }

    function renderOfflineBtn(state) {
      if (state === 'downloading') {
        offlineBtn.textContent = `⏬ ${state.percent || 0}%`;
        return;
      }
      const count = getLastKnownTileCount();
      if (count > 0) {
        offlineBtn.textContent = `💾 ${formatMB(count)}`;
      } else {
        offlineBtn.textContent = '🗺️ 离线';
      }
    }

    function renderOfflineBtnDownloading(percent) {
      offlineBtn.textContent = `⏬ ${percent}%`;
    }

    function openDialog() {
      offlineDialog.classList.remove('hidden');
      refreshDialogState();
    }
    function closeDialog() {
      offlineDialog.classList.add('hidden');
    }

    function refreshDialogState() {
      const count = getLastKnownTileCount();
      if (count > 0) {
        progressText.textContent = `已缓存 ${count} 片瓦片 · ~${formatMB(count)}`;
        progressFill.style.width = '100%';
        clearBtn.hidden = false;
        downloadBtn.textContent = '重新下载';
      } else {
        progressText.textContent = '未开始';
        progressFill.style.width = '0%';
        clearBtn.hidden = true;
        downloadBtn.textContent = '开始下载';
      }
      downloadBtn.hidden = false;
      cancelBtn.hidden = true;
      Object.values(regionItems).forEach(el => { el.textContent = count > 0 ? '已缓存' : '—'; });
    }

    function sendToSw(message) {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(message);
      }
    }

    offlineBtn.addEventListener('click', openDialog);
    closeBtn.addEventListener('click', closeDialog);
    downloadBtn.addEventListener('click', () => {
      downloadBtn.hidden = true;
      cancelBtn.hidden = false;
      clearBtn.hidden = true;
      progressText.textContent = '准备中…';
      progressFill.style.width = '0%';
      Object.values(regionItems).forEach(el => { el.textContent = '排队'; });
      sendToSw({ type: 'PRECACHE_TILES_START' });
    });
    cancelBtn.addEventListener('click', () => {
      sendToSw({ type: 'PRECACHE_TILES_CANCEL' });
      cancelBtn.disabled = true;
      cancelBtn.textContent = '取消中…';
    });
    clearBtn.addEventListener('click', () => {
      if (!confirm('清除所有离线地图瓦片？页面其他内容不受影响。')) return;
      sendToSw({ type: 'CLEAR_TILES' });
    });

    navigator.serviceWorker.addEventListener('message', event => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'PRECACHE_TILES_PROGRESS') {
        const percent = data.total ? Math.min(100, Math.round((data.done / data.total) * 100)) : 0;
        progressFill.style.width = percent + '%';
        progressText.textContent = `${data.done} / ${data.total}（失败 ${data.failed}）`;
        renderOfflineBtnDownloading(percent);
        if (data.regionId && regionItems[data.regionId]) {
          regionItems[data.regionId].textContent = '下载中';
        }
      } else if (data.type === 'PRECACHE_TILES_DONE') {
        setLastKnownTileCount(data.stored || 0);
        cancelBtn.disabled = false;
        cancelBtn.textContent = '取消下载';
        cancelBtn.hidden = true;
        downloadBtn.hidden = false;
        refreshDialogState();
        renderOfflineBtn();
        if (data.cancelled) {
          progressText.textContent = '已取消（已下载部分保留）';
        } else if (!data.ok) {
          progressText.textContent = `下载失败：${data.reason || 'unknown'}`;
        } else {
          progressText.textContent = `完成：${data.stored} 片 · ~${formatMB(data.stored)}`;
        }
      } else if (data.type === 'PRECACHE_TILES_BUSY') {
        progressText.textContent = '已在下载中…';
      } else if (data.type === 'TILE_STATS') {
        setLastKnownTileCount(data.count || 0);
        refreshDialogState();
        renderOfflineBtn();
      }
    });

    // Ask the SW for the authoritative count once it is ready.
    navigator.serviceWorker.ready.then(() => {
      sendToSw({ type: 'GET_TILE_STATS' });
    });

    renderOfflineBtn();
```

- [ ] **Step 2: End-to-end verification**

Run:

```bash
open "/Users/huangshengqiu/Public/code/ai_research/travel/index.html"
```

Manual checks:
- The top-left map button starts as `🗺️ 离线`.
- Clicking opens the dialog with 3 regions and a progress bar at 0%.
- Click `开始下载`. Progress fills to 100%; button label becomes `⏬ 42%` while active, `💾 ~20 MB` when done.
- Reload — the button stays as `💾 ~20 MB` because the count is persisted and the SW confirms.
- Open dialog — `重新下载` and `清除缓存` are both visible.
- Click `清除缓存`, confirm — button reverts to `🗺️ 离线`.
- Simulate offline in DevTools (Network → Offline) and pan/zoom the map in SF / Waikiki / Hilo regions at zoom 10–13/14. Tiles render from cache. Beyond zoom 14, gray tiles are expected.

---

### Task 5: Commit, bump cache version, deploy

**Files:**
- Modify: `sw.js` (bump `CACHE_VERSION` if not already bumped this session)
- Run: `git` + `./deploy.sh`

- [ ] **Step 1: Bump `CACHE_VERSION` in `sw.js`**

Update the single line at the top of `sw.js`:

```javascript
const CACHE_VERSION = 'v2-2026-04-22';
```

(This ensures existing clients flush the old shell cache and pick up the new tile handlers.)

- [ ] **Step 2: Stage and commit**

Run:

```bash
git add sw.js index.html docs/superpowers/plans/2026-04-22-offline-map-tiles.md
git commit -m "feat: offline OSM tile pre-download with in-page controller"
```

Expected:
- One commit lands with SW + page + plan.

- [ ] **Step 3: Deploy**

Run:

```bash
./deploy.sh
```

Expected:
- GitHub push succeeds.
- Netlify deploy completes with the new `sw.js` / `index.html`.

---

## Self-Review

### Spec coverage check
- Dedicated tile cache + subdomain canonicalization: Task 1 Steps 1, 3.
- Opt-in pre-download button + dialog: Task 3 Steps 1–3 + Task 4 Step 1.
- Progress reporting per region and overall: Task 2 Step 2 `postProgress(regionId)` + Task 4 Step 1 progress UI.
- Ambient runtime caching for any tile the user loads online: Task 1 Step 3 fetch handler.
- Cancel mid-download: Task 2 Step 3 message + Task 4 Step 1 cancel button.
- Clear cache without affecting other PWA data: Task 1 Step 4 `clearTileCache` + Task 4 Step 1 clear button.
- Respect OSM policy (bounded volume, throttle): `MAX_TILES_PER_JOB` cap + 15–40 ms jitter in the worker loop, concurrency=4.
- Storage size display via last-known count: Task 4 Step 1 `formatMB` + `OFFLINE_TILE_COUNT_KEY`.
- Survive SW version bump: Task 1 Step 2 preserves `TILE_CACHE` across `activate`.
- Dark-theme support: Task 3 Step 3 dark-theme selectors.
- Mobile collapsed state hides the button: Task 3 Step 3 `.map-collapsed .offline-map-btn { display: none }`.

### Placeholder scan
- No `TODO` / `TBD` / deferred wording.
- Every edit step shows exact replacement code.
- Every verification step has explicit expected behavior.

### Type consistency check
- Message types: `PRECACHE_TILES_START`, `PRECACHE_TILES_CANCEL`, `PRECACHE_TILES_PROGRESS`, `PRECACHE_TILES_DONE`, `PRECACHE_TILES_BUSY`, `CLEAR_TILES`, `GET_TILE_STATS`, `TILE_STATS` — consistent between SW handler and page listener.
- Region IDs: `sfo` / `oahu` / `hilo` — consistent across SW region config, dialog `data-region`, and page `regionItems`.
- Cache names: `TILE_CACHE` derived from `CACHE_VERSION`; `activate` filter updated to keep it; `clearTileCache` deletes and recreates the same name.
- Storage key: `travel-offline-tile-count` used only for UI hint count; SW remains the authority via `GET_TILE_STATS`.
