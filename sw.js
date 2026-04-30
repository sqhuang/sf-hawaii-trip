// Bump CACHE_VERSION on each deploy to invalidate stale caches.
const CACHE_VERSION = 'v10-2026-04-30';
const CORE_CACHE = `travel-core-${CACHE_VERSION}`;
// Runtime and tile caches are intentionally unversioned so that bumping
// CACHE_VERSION (tied to the precached shell) does not throw away tiles the
// user has already downloaded or runtime-fetched third-party assets.
const RUNTIME_CACHE = 'travel-runtime';
const TILE_CACHE = 'travel-tiles';

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

const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icon.svg',
  './images/d1-chinatown.jpg',
  './images/d2-alcatraz.jpg',
  './images/d3-golden-gate.jpg',
  './images/d4-waikiki.jpg',
  './images/d5-diamond-head.jpg',
  './images/d5-turtle.jpg',
  './images/d6-diamond-head.jpg',
  './images/d6-mauna-kea.jpg',
  './images/d7-volcano.jpg',
  './images/d8-kualoa.jpg',
  './images/d9-airplane.jpg',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CORE_CACHE).then(cache =>
      // addAll would fail the whole batch if any single request errors (e.g.
      // a transient unpkg blip). Fall back to per-asset adds so a flaky
      // third-party doesn't block the install.
      Promise.all(CORE_ASSETS.map(url =>
        cache.add(new Request(url, { cache: 'reload' })).catch(err => {
          console.warn('[sw] precache skip:', url, err);
        })
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    migrateOldTileCaches()
      .then(() => caches.keys())
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CORE_CACHE && key !== RUNTIME_CACHE && key !== TILE_CACHE)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Move user-downloaded tiles from any prior versioned tile cache (e.g.
// travel-tiles-v3-2026-04-22) into the unversioned TILE_CACHE, so bumping
// CACHE_VERSION preserves offline map downloads.
async function migrateOldTileCaches() {
  try {
    const keys = await caches.keys();
    const oldTileKeys = keys.filter(k => /^travel-tiles-v\d/.test(k) && k !== TILE_CACHE);
    if (oldTileKeys.length === 0) return;
    const target = await caches.open(TILE_CACHE);
    for (const oldKey of oldTileKeys) {
      const old = await caches.open(oldKey);
      const reqs = await old.keys();
      for (const req of reqs) {
        const existing = await target.match(req);
        if (existing) continue;
        const resp = await old.match(req);
        if (resp) await target.put(req, resp.clone());
      }
    }
  } catch (err) {
    // Migration is best-effort; a failure here just means the user re-downloads.
  }
}

function shouldBypass(url) {
  // Firebase Realtime Database traffic (WebSocket / long-poll) must hit the
  // network — never cache. Also skip other dynamic endpoints.
  return (
    url.hostname.endsWith('.firebaseio.com') ||
    url.hostname.endsWith('.firebasedatabase.app') ||
    url.pathname.endsWith('/sw.js')
  );
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

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
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CORE_CACHE).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Everything else: cache-first, then fill runtime cache on miss.
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request)
        .then(response => {
          if (!response || response.status !== 200 || response.type === 'opaqueredirect') {
            return response;
          }
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);
    })
  );
});

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
  } else if (data.type === 'PRECACHE_TILES_CANCEL') {
    if (currentPrecacheJob) {
      currentPrecacheJob.cancelled = true;
      if (currentPrecacheJob.controller) {
        try { currentPrecacheJob.controller.abort(); } catch (e) {}
      }
    }
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
  await caches.open(TILE_CACHE);
  if (source) {
    source.postMessage({ type: 'TILE_STATS', count: 0 });
  }
}

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
    bounds: { minLat: 21.25, minLng: -158.05, maxLat: 21.57, maxLng: -157.77 },
    minZoom: 10,
    maxZoom: 14
  },
  {
    id: 'hilo',
    name: '大岛',
    bounds: { minLat: 19.25, minLng: -155.60, maxLat: 19.80, maxLng: -155.00 },
    minZoom: 10,
    maxZoom: 13
  }
];

const MAX_TILES_PER_JOB = 3000;

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
  return `https://tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`;
}

async function runPrecacheJob(source) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  currentPrecacheJob = { cancelled: false, controller };
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
        if (!tile) break;
        const url = tileUrl(tile);
        try {
          const hit = await cache.match(url);
          if (!hit) {
            const fetchInit = { cache: 'reload' };
            if (controller) fetchInit.signal = controller.signal;
            const resp = await fetch(url, fetchInit);
            if (resp && resp.status === 200) {
              await cache.put(url, resp.clone());
            } else {
              failed++;
            }
          }
        } catch (err) {
          if (err && err.name === 'AbortError') return;
          failed++;
        }
        done++;
        if (done % 10 === 0 || done === total) postProgress(region.id);
        if (currentPrecacheJob.cancelled) return;
        await new Promise(r => setTimeout(r, 25 + Math.random() * 50));
      }
    }
    const workers = Array.from({ length: concurrency }, worker);
    await Promise.all(workers);
    postProgress(region.id);
    if (!currentPrecacheJob.cancelled) {
      source && source.postMessage({
        type: 'PRECACHE_TILES_REGION_DONE',
        regionId: region.id
      });
    }
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
