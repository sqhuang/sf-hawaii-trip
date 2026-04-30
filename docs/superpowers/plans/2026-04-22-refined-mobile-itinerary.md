# Refined Mobile Itinerary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mobile `行程 / 地图` tab bar with an itinerary-first layout where a compact, collapsible map card sits above the itinerary and auto-focuses on the selected day.

**Architecture:** Keep the single Leaflet map instance inside `#map-panel`. In mobile mode, restyle `#map-panel` as a compact card above `#itinerary-panel` with a new `#mobile-map-header` containing a collapse toggle. Persist the collapsed state in `localStorage`. Remove all tab-related markup/CSS/JS; retain the existing `移动版 / 桌面版` mode switch.

**Tech Stack:** Single-file HTML/CSS/JavaScript, Leaflet, localStorage, existing DOM rendering functions in `index.html`.

---

## File Structure

### Existing files to modify
- `index.html`
  - Remove `#mobile-tab-bar` markup; add `#mobile-map-header` inside `#map-panel`.
  - Drop `.mobile-tab` / `#mobile-tab-bar` CSS; add `#mobile-map-header` and `body.map-collapsed` styles.
  - Remove mobile-tab JS state and persistence; add `MOBILE_MAP_COLLAPSED_KEY` state with an expand/collapse helper and a map-focus hook for `toggleCard`.
  - Update the pre-paint inline script that currently reads `travel-mobile-tab`.

### No new runtime files
- Keep the implementation inside `index.html`.

### Documentation references
- Spec: `docs/superpowers/specs/2026-04-16-refined-mobile-itinerary-design.md`
- Prior plan (now superseded): `docs/superpowers/plans/2026-04-15-mobile-layout-toggle.md`

---

### Task 1: Remove mobile tab markup and add the mobile map header

**Files:**
- Modify: `index.html:905-927` (pre-paint inline script)
- Modify: `index.html:962-973` (tab bar + `#app` block)
- Test: manual browser load

- [ ] **Step 1: Replace the pre-paint inline script so it tracks map collapse instead of mobile tab**

Replace this block at `index.html:905-927`:

```html
  <script>
    (function() {
      const storedViewMode = (() => {
        try {
          const value = localStorage.getItem('travel-view-mode');
          return value === 'mobile' || value === 'desktop' ? value : null;
        } catch (err) {
          return null;
        }
      })();
      const storedMobileTab = (() => {
        try {
          const value = localStorage.getItem('travel-mobile-tab');
          return value === 'map' || value === 'itinerary' ? value : 'itinerary';
        } catch (err) {
          return 'itinerary';
        }
      })();
      const initialViewMode = storedViewMode || (window.innerWidth <= 768 ? 'mobile' : 'desktop');
      document.body.classList.add(initialViewMode + '-mode');
      document.body.dataset.mobileTab = storedMobileTab;
    })();
  </script>
```

With this block:

```html
  <script>
    (function() {
      const storedViewMode = (() => {
        try {
          const value = localStorage.getItem('travel-view-mode');
          return value === 'mobile' || value === 'desktop' ? value : null;
        } catch (err) {
          return null;
        }
      })();
      const storedMapCollapsed = (() => {
        try {
          return localStorage.getItem('travel-mobile-map-collapsed') === '1';
        } catch (err) {
          return false;
        }
      })();
      const initialViewMode = storedViewMode || (window.innerWidth <= 768 ? 'mobile' : 'desktop');
      document.body.classList.add(initialViewMode + '-mode');
      if (storedMapCollapsed) {
        document.body.classList.add('map-collapsed');
      }
    })();
  </script>
```

- [ ] **Step 2: Remove the tab bar and add the mobile map header inside `#map-panel`**

Replace this HTML at `index.html:962-973`:

```html
  <div id="mobile-tab-bar" aria-label="移动版内容切换">
    <button type="button" class="mobile-tab active" data-mobile-tab="itinerary">行程</button>
    <button type="button" class="mobile-tab" data-mobile-tab="map">地图</button>
  </div>

  <main id="app">
    <div id="map-panel">
      <button class="overview-btn" onclick="showOverview()">🌏 全览</button>
      <div id="map"></div>
    </div>
    <div id="itinerary-panel"></div>
  </main>
```

With this HTML:

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

- [ ] **Step 3: Load check**

Run:

```bash
open "/Users/huangshengqiu/Public/code/ai_research/travel/index.html"
```

Expected:
- Page still loads.
- No `行程 / 地图` tab bar is visible on mobile-width viewports.
- Desktop-width viewport looks unchanged (new header is hidden by CSS added in Task 2).

---

### Task 2: Rewrite mobile CSS for the compact map card

**Files:**
- Modify: `index.html:195-295` (mobile tab / mode layout CSS)
- Modify: `index.html:741-759` (dark theme block)
- Test: manual responsive browser check

- [ ] **Step 1: Replace the tab-related CSS block with map-header + card styles**

Replace this CSS at `index.html:195-295`:

```css
    #mobile-tab-bar,
    #view-mode-switch {
      display: none;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      background: rgba(255,255,255,0.88);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    #mobile-tab-bar {
      border-bottom: 1px solid rgba(0,0,0,0.08);
    }

    #view-mode-switch {
      border-top: 1px solid rgba(0,0,0,0.08);
      border-radius: 16px 16px 0 0;
      margin-top: 8px;
    }

    .mobile-tab,
    .view-mode-btn {
      border: 1px solid rgba(0,0,0,0.12);
      background: #fff;
      color: #1a1a2e;
      border-radius: 999px;
      padding: 8px 14px;
      font-size: 0.88rem;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .mobile-tab.active,
    .view-mode-btn.active {
      background: #1a1a2e;
      color: #fff;
      border-color: #1a1a2e;
    }

    /* ===== Mobile/Desktop Mode Layout ===== */
    body.mobile-mode #mobile-tab-bar,
    body.mobile-mode #view-mode-switch {
      display: flex;
    }

    body.desktop-mode #view-mode-switch {
      display: flex;
    }

    body.mobile-mode #app {
      display: block;
      height: auto;
      min-height: 60vh;
      border-radius: 24px 24px 0 0;
    }

    body.mobile-mode #map-panel,
    body.mobile-mode #itinerary-panel {
      width: 100%;
    }

    body.mobile-mode #map-panel {
      height: 58vh;
    }

    body.mobile-mode #itinerary-panel {
      padding: 16px;
    }

    body.mobile-mode[data-mobile-tab="itinerary"] #map-panel {
      display: none;
    }

    body.mobile-mode[data-mobile-tab="map"] #itinerary-panel {
      display: none;
    }

    @media (max-width: 768px) {
      body.mobile-mode #trip-header {
        padding: 36px 18px 64px;
      }

      body.desktop-mode #app {
        display: flex;
        height: calc(100vh - 190px);
      }

      body.desktop-mode #map-panel {
        display: block;
        width: 40%;
        height: auto;
      }

      body.desktop-mode #itinerary-panel {
        display: block;
        padding: 20px 24px;
      }
    }
```

With this CSS:

```css
    #view-mode-switch {
      display: none;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      background: rgba(255,255,255,0.88);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-top: 1px solid rgba(0,0,0,0.08);
      border-radius: 16px 16px 0 0;
      margin-top: 8px;
    }

    .view-mode-btn {
      border: 1px solid rgba(0,0,0,0.12);
      background: #fff;
      color: #1a1a2e;
      border-radius: 999px;
      padding: 8px 14px;
      font-size: 0.88rem;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .view-mode-btn.active {
      background: #1a1a2e;
      color: #fff;
      border-color: #1a1a2e;
    }

    #mobile-map-header {
      display: none;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: rgba(255,255,255,0.92);
      border-bottom: 1px solid rgba(0,0,0,0.08);
    }

    .mobile-map-title {
      font-size: 0.88rem;
      font-weight: 600;
      color: #1a1a2e;
    }

    #mobile-map-toggle {
      border: 1px solid rgba(0,0,0,0.12);
      background: #fff;
      color: #1a1a2e;
      border-radius: 999px;
      padding: 4px 12px;
      font-size: 0.78rem;
      font-family: inherit;
      cursor: pointer;
    }

    /* ===== Mobile/Desktop Mode Layout ===== */
    body.mobile-mode #view-mode-switch,
    body.desktop-mode #view-mode-switch {
      display: flex;
    }

    body.mobile-mode #app {
      display: block;
      height: auto;
      min-height: 60vh;
      border-radius: 24px 24px 0 0;
    }

    body.mobile-mode #map-panel,
    body.mobile-mode #itinerary-panel {
      width: 100%;
    }

    body.mobile-mode #map-panel {
      position: relative;
      height: 32vh;
      min-height: 220px;
      margin: 12px 12px 0;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      transition: height 0.25s ease, min-height 0.25s ease;
    }

    body.mobile-mode #mobile-map-header {
      display: flex;
    }

    body.mobile-mode.map-collapsed #map-panel {
      height: 44px;
      min-height: 44px;
    }

    body.mobile-mode.map-collapsed #map-panel #map,
    body.mobile-mode.map-collapsed #map-panel .overview-btn {
      display: none;
    }

    body.mobile-mode #itinerary-panel {
      padding: 16px;
    }

    @media (max-width: 768px) {
      body.mobile-mode #trip-header {
        padding: 36px 18px 64px;
      }

      body.desktop-mode #app {
        display: flex;
        height: calc(100vh - 190px);
      }

      body.desktop-mode #map-panel {
        display: block;
        width: 40%;
        height: auto;
        margin: 0;
        border-radius: 0;
        box-shadow: none;
      }

      body.desktop-mode #mobile-map-header {
        display: none;
      }

      body.desktop-mode #itinerary-panel {
        display: block;
        padding: 20px 24px;
      }
    }
```

- [ ] **Step 2: Update dark-theme block to drop mobile-tab and style the new header**

Replace this CSS at `index.html:741-759`:

```css
    [data-theme="dark"] #mobile-tab-bar,
    [data-theme="dark"] #view-mode-switch {
      background: rgba(24,24,24,0.9);
      border-color: rgba(255,255,255,0.08);
    }

    [data-theme="dark"] .mobile-tab,
    [data-theme="dark"] .view-mode-btn {
      background: #2a2a2a;
      color: #f5f5f0;
      border-color: rgba(255,255,255,0.12);
    }

    [data-theme="dark"] .mobile-tab.active,
    [data-theme="dark"] .view-mode-btn.active {
      background: #f5f5f0;
      color: #111;
      border-color: #f5f5f0;
    }
```

With this CSS:

```css
    [data-theme="dark"] #view-mode-switch,
    [data-theme="dark"] #mobile-map-header {
      background: rgba(24,24,24,0.9);
      border-color: rgba(255,255,255,0.08);
    }

    [data-theme="dark"] .mobile-map-title {
      color: #f5f5f0;
    }

    [data-theme="dark"] #mobile-map-toggle,
    [data-theme="dark"] .view-mode-btn {
      background: #2a2a2a;
      color: #f5f5f0;
      border-color: rgba(255,255,255,0.12);
    }

    [data-theme="dark"] .view-mode-btn.active {
      background: #f5f5f0;
      color: #111;
      border-color: #f5f5f0;
    }

    [data-theme="dark"] body.mobile-mode #map-panel {
      box-shadow: 0 2px 10px rgba(0,0,0,0.35);
    }
```

- [ ] **Step 3: Responsive viewport check**

Run:

```bash
open "/Users/huangshengqiu/Public/code/ai_research/travel/index.html"
```

Expected at phone width (<768px) with `body.mobile-mode`:
- A compact map card (~32vh) with a header `🗺️ 地图  [收起]` sits above the itinerary.
- No `行程 / 地图` tab buttons appear.
- The bottom `移动版 / 桌面版` switch still appears.

Expected at desktop width with `body.desktop-mode`:
- Split layout unchanged — no header, full-height map.

---

### Task 3: Replace mobile-tab JS state with map-collapse state and day-focus hook

**Files:**
- Modify: `index.html:1011-1049` (storage helpers)
- Modify: `index.html:1866-1888` (toggleCard)
- Modify: `index.html:1963-2032` (state block + init)
- Test: manual browser persistence + day-focus check

- [ ] **Step 1: Replace the mobile-tab storage helpers with map-collapse helpers**

Replace this block at `index.html:1011-1049`:

```html
  <script>
    const VIEW_MODE_KEY = 'travel-view-mode';
    const MOBILE_TAB_KEY = 'travel-mobile-tab';
    const MOBILE_BREAKPOINT = 768;

    function getAutoViewMode() {
      return window.innerWidth <= MOBILE_BREAKPOINT ? 'mobile' : 'desktop';
    }

    function getStoredViewMode() {
      try {
        const value = localStorage.getItem(VIEW_MODE_KEY);
        return value === 'mobile' || value === 'desktop' ? value : null;
      } catch (err) {
        return null;
      }
    }

    function getStoredMobileTab() {
      try {
        const value = localStorage.getItem(MOBILE_TAB_KEY);
        return value === 'map' || value === 'itinerary' ? value : 'itinerary';
      } catch (err) {
        return 'itinerary';
      }
    }

    function setStoredViewMode(mode) {
      try {
        localStorage.setItem(VIEW_MODE_KEY, mode);
      } catch (err) {}
    }

    function setStoredMobileTab(tab) {
      try {
        localStorage.setItem(MOBILE_TAB_KEY, tab);
      } catch (err) {}
    }
  </script>
```

With this block:

```html
  <script>
    const VIEW_MODE_KEY = 'travel-view-mode';
    const MOBILE_MAP_COLLAPSED_KEY = 'travel-mobile-map-collapsed';
    const MOBILE_BREAKPOINT = 768;

    function getAutoViewMode() {
      return window.innerWidth <= MOBILE_BREAKPOINT ? 'mobile' : 'desktop';
    }

    function getStoredViewMode() {
      try {
        const value = localStorage.getItem(VIEW_MODE_KEY);
        return value === 'mobile' || value === 'desktop' ? value : null;
      } catch (err) {
        return null;
      }
    }

    function getStoredMapCollapsed() {
      try {
        return localStorage.getItem(MOBILE_MAP_COLLAPSED_KEY) === '1';
      } catch (err) {
        return false;
      }
    }

    function setStoredViewMode(mode) {
      try {
        localStorage.setItem(VIEW_MODE_KEY, mode);
      } catch (err) {}
    }

    function setStoredMapCollapsed(collapsed) {
      try {
        localStorage.setItem(MOBILE_MAP_COLLAPSED_KEY, collapsed ? '1' : '0');
      } catch (err) {}
    }
  </script>
```

- [ ] **Step 2: Replace the view-mode / mobile-tab state block with map-collapse state**

Replace this block at `index.html:1963-2007`:

```javascript
    let currentViewMode = getStoredViewMode() || getAutoViewMode();
    let currentMobileTab = getStoredMobileTab();

    function updateModeButtons() {
      document.querySelectorAll('.view-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.viewMode === currentViewMode);
      });
    }

    function updateMobileTabs() {
      document.querySelectorAll('.mobile-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mobileTab === currentMobileTab);
      });
    }

    function refreshMapIfVisible() {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          map.invalidateSize();
        });
      });
    }

    function applyViewMode(mode, persist = true) {
      currentViewMode = mode;
      document.body.classList.remove('mobile-mode', 'desktop-mode');
      document.body.classList.add(mode + '-mode');
      document.body.dataset.mobileTab = currentMobileTab;
      updateModeButtons();
      updateMobileTabs();
      if (persist) setStoredViewMode(mode);
      if (mode === 'desktop' || currentMobileTab === 'map') {
        refreshMapIfVisible();
      }
    }

    function applyMobileTab(tab, persist = true) {
      currentMobileTab = tab;
      document.body.dataset.mobileTab = tab;
      updateMobileTabs();
      if (persist) setStoredMobileTab(tab);
      if (tab === 'map') {
        refreshMapIfVisible();
      }
    }
```

With this block:

```javascript
    let currentViewMode = getStoredViewMode() || getAutoViewMode();
    let currentMapCollapsed = getStoredMapCollapsed();

    function updateModeButtons() {
      document.querySelectorAll('.view-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.viewMode === currentViewMode);
      });
    }

    function updateMapToggleButton() {
      const btn = document.getElementById('mobile-map-toggle');
      if (!btn) return;
      btn.textContent = currentMapCollapsed ? '展开' : '收起';
      btn.setAttribute('aria-expanded', currentMapCollapsed ? 'false' : 'true');
    }

    function refreshMapIfVisible() {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          map.invalidateSize();
        });
      });
    }

    function applyViewMode(mode, persist = true) {
      currentViewMode = mode;
      document.body.classList.remove('mobile-mode', 'desktop-mode');
      document.body.classList.add(mode + '-mode');
      updateModeButtons();
      updateMapToggleButton();
      if (persist) setStoredViewMode(mode);
      if (mode === 'desktop' || !currentMapCollapsed) {
        refreshMapIfVisible();
      }
    }

    function applyMapCollapsed(collapsed, persist = true) {
      currentMapCollapsed = collapsed;
      document.body.classList.toggle('map-collapsed', collapsed);
      updateMapToggleButton();
      if (persist) setStoredMapCollapsed(collapsed);
      if (!collapsed) {
        refreshMapIfVisible();
      }
    }
```

- [ ] **Step 3: Update `toggleCard` so opening a day auto-expands the mobile map card**

Replace this function at `index.html:1866-1888`:

```javascript
    // ===== TOGGLE CARD =====
    function toggleCard(dayId) {
      const card = document.getElementById('card-' + dayId);
      const wasOpen = card.classList.contains('open');

      // Close all cards first
      document.querySelectorAll('.day-card.open').forEach(c => {
        c.classList.remove('open');
      });

      // If it wasn't open, open it and zoom to region
      if (!wasOpen) {
        card.classList.add('open');
        const region = card.dataset.region;
        zoomToRegion(region, dayId);
        if (window.innerWidth <= 768) {
          setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        }
      } else {
        // Card was open, now closing — show overview
        showOverview();
      }
    }
```

With this function:

```javascript
    // ===== TOGGLE CARD =====
    function toggleCard(dayId) {
      const card = document.getElementById('card-' + dayId);
      const wasOpen = card.classList.contains('open');

      // Close all cards first
      document.querySelectorAll('.day-card.open').forEach(c => {
        c.classList.remove('open');
      });

      // If it wasn't open, open it and zoom to region
      if (!wasOpen) {
        card.classList.add('open');
        const region = card.dataset.region;
        zoomToRegion(region, dayId);
        if (document.body.classList.contains('mobile-mode') && currentMapCollapsed) {
          applyMapCollapsed(false);
        } else if (document.body.classList.contains('mobile-mode')) {
          refreshMapIfVisible();
        }
        if (window.innerWidth <= 768) {
          setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        }
      } else {
        // Card was open, now closing — show overview
        showOverview();
      }
    }
```

- [ ] **Step 4: Replace the init bindings that reference the tab bar**

Replace this block at `index.html:2015-2032`:

```javascript
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => applyViewMode(btn.dataset.viewMode));
    });

    document.querySelectorAll('.mobile-tab').forEach(btn => {
      btn.addEventListener('click', () => applyMobileTab(btn.dataset.mobileTab));
    });

    applyMobileTab(currentMobileTab, false);
    applyViewMode(currentViewMode, false);

    window.addEventListener('resize', () => {
      if (!getStoredViewMode()) {
        applyViewMode(getAutoViewMode(), false);
      } else if (currentViewMode === 'desktop' || currentMobileTab === 'map') {
        refreshMapIfVisible();
      }
    });
```

With this block:

```javascript
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => applyViewMode(btn.dataset.viewMode));
    });

    const mapToggleBtn = document.getElementById('mobile-map-toggle');
    if (mapToggleBtn) {
      mapToggleBtn.addEventListener('click', () => applyMapCollapsed(!currentMapCollapsed));
    }

    applyMapCollapsed(currentMapCollapsed, false);
    applyViewMode(currentViewMode, false);

    window.addEventListener('resize', () => {
      if (!getStoredViewMode()) {
        applyViewMode(getAutoViewMode(), false);
      } else if (currentViewMode === 'desktop' || !currentMapCollapsed) {
        refreshMapIfVisible();
      }
    });
```

- [ ] **Step 5: Persistence + focus verification**

Run:

```bash
open "/Users/huangshengqiu/Public/code/ai_research/travel/index.html"
```

Manual checks in a mobile-width viewport (`body.mobile-mode`):
- Map card expanded by default. `收起` button visible.
- Tap `收起` — only the header remains; itinerary gets more space. Button text becomes `展开`.
- Reload — collapsed state is preserved.
- Tap `展开` — map reappears and is correctly sized (no gray tiles).
- Open any day card — if the map was collapsed, it auto-expands and focuses on that day's region. If already expanded, it re-focuses.
- Switch to `桌面版` — full split layout; map toggle / header hidden.
- Switch back to `移动版` — card layout restored with last-known collapse state.

---

### Task 4: Commit in logical chunks

**Files:**
- Commit: all `index.html` changes from Tasks 1–3 plus the plan file.

- [ ] **Step 1: Stage and commit the plan and markup**

Run:

```bash
git add docs/superpowers/ index.html
git status
```

Expected:
- `docs/superpowers/` and `index.html` are staged together.

- [ ] **Step 2: Create the feature commit**

Run:

```bash
git commit -m "feat: replace mobile tab bar with collapsible map card"
```

Expected:
- One commit lands with the markup, CSS, and JS changes plus the new plan file.

---

## Self-Review

### Spec coverage check
- Remove mobile `行程 / 地图` tabs: Task 1 Step 2 + Task 2 Step 1 (all `#mobile-tab-bar` / `.mobile-tab` rules dropped).
- Compact map card above itinerary: Task 1 Step 2 adds `#mobile-map-header`; Task 2 Step 1 styles `#map-panel` as a card in mobile mode with margin, radius, shadow, 32vh height.
- Collapsible map card with persistence: Task 2 Step 1 adds `body.map-collapsed` rules; Task 3 Steps 1–4 add `MOBILE_MAP_COLLAPSED_KEY`, `applyMapCollapsed`, toggle button wiring, and restore on load.
- Map auto-focus on day selection: Task 3 Step 3 calls `applyMapCollapsed(false)` and `refreshMapIfVisible()` from within `toggleCard` for mobile mode (existing `zoomToRegion` already sets the view).
- Returning to overview restores broader map: existing `showOverview()` is invoked from `toggleCard` on close — unchanged.
- Map card hidden in desktop mode: Task 2 Step 1 `body.desktop-mode #mobile-map-header { display: none }`; Task 2 Step 1 also restores full-height map panel.
- Collapse state works when localStorage unavailable: `getStoredMapCollapsed` and `setStoredMapCollapsed` in Task 3 Step 1 wrap access in `try/catch` and default to `false`.
- Map size invalidation on layout change: `refreshMapIfVisible` called on expand, view-mode change, and resize.

### Placeholder scan
- No `TODO`, `TBD`, or deferred wording.
- Every step contains exact replacement code or exact commands.
- Every verification step has explicit expected results.

### Type consistency check
- Storage keys: `travel-view-mode`, `travel-mobile-map-collapsed` used consistently between pre-paint script (Task 1), helpers (Task 3 Step 1), and apply logic (Task 3 Step 2).
- State flags: `currentMapCollapsed` (boolean) used consistently across `applyMapCollapsed`, `applyViewMode`, resize, and `toggleCard`.
- Body class names: `mobile-mode`, `desktop-mode`, `map-collapsed` used consistently in pre-paint script, CSS rules, and JS toggles.
- Button IDs/selectors: `#mobile-map-toggle`, `.view-mode-btn`, `[data-view-mode]` match between HTML, CSS, and JS.
