# Mobile Layout Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a phone-friendly mobile mode to the travel page that defaults to a tabbed single-panel layout on small screens, while still allowing users to manually switch between mobile and desktop views.

**Architecture:** Keep the single-file `index.html` structure and add a thin UI state layer for `viewMode` and `mobileTab`. Reuse the existing `#map-panel` and `#itinerary-panel`, then control their visibility and layout with CSS state classes plus a small amount of JavaScript persistence via `localStorage`.

**Tech Stack:** Single-file HTML/CSS/JavaScript, Leaflet, localStorage, existing DOM rendering functions in `index.html`

---

## File Structure

### Existing files to modify
- `index.html`
  - Add the mobile tab bar and bottom mode switch HTML near the existing `#app` container.
  - Extend the layout CSS with explicit mobile/desktop state styles.
  - Add JavaScript state helpers for mode/tab persistence and switching.
  - Update initialization so layout state is resolved before first interaction.

### No new runtime files
- Keep the implementation inside `index.html` to match the current architecture and avoid introducing extra assets for a focused UI enhancement.

### Documentation files already created
- Spec: `docs/superpowers/specs/2026-04-15-mobile-layout-toggle-design.md`
- Plan: `docs/superpowers/plans/2026-04-15-mobile-layout-toggle.md`

---

### Task 1: Add mobile layout controls to the page shell

**Files:**
- Modify: `index.html:833-841`
- Test: manual browser verification on local page

- [ ] **Step 1: Add the mobile tab bar HTML below the header and before the app panels**

Replace this block:

```html
  <main id="app">
    <div id="map-panel">
      <button class="overview-btn" onclick="showOverview()">🌏 全览</button>
      <div id="map"></div>
    </div>
    <div id="itinerary-panel"></div>
  </main>

  <button class="theme-toggle" id="theme-toggle" onclick="toggleTheme()">🌙</button>
```

With this block:

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

  <div id="view-mode-switch" aria-label="布局模式切换">
    <button type="button" class="view-mode-btn active" data-view-mode="mobile">移动版</button>
    <button type="button" class="view-mode-btn" data-view-mode="desktop">桌面版</button>
  </div>

  <button class="theme-toggle" id="theme-toggle" onclick="toggleTheme()">🌙</button>
```

- [ ] **Step 2: Run a quick load check to verify the new controls render without script errors**

Run:

```bash
open "/Users/huangshengqiu/Public/code/ai_research/travel/index.html"
```

Expected:
- The page opens successfully.
- New `行程 / 地图` and `移动版 / 桌面版` controls appear in the DOM.
- No immediate JavaScript error dialog appears.

- [ ] **Step 3: Commit the shell markup change**

Run:

```bash
git add index.html
git commit -m "feat: add mobile layout controls"
```

Expected:
- A new commit is created containing only the new layout control markup.

---

### Task 2: Add explicit mobile/desktop state styling

**Files:**
- Modify: `index.html:147-210`
- Test: manual browser verification with responsive viewport

- [ ] **Step 1: Add base styles for the mobile tab bar and bottom mode switch**

Insert this CSS after the existing `#itinerary-panel` rule and before the `@media (max-width: 768px)` block:

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
```

- [ ] **Step 2: Replace the current simple mobile media query with explicit mode-aware rules**

Replace this CSS block:

```css
    /* ===== Mobile Layout ===== */
    @media (max-width: 768px) {
      #app {
        flex-direction: column;
        height: auto;
      }

      #map-panel {
        width: 100%;
        height: 45vh;
      }

      #itinerary-panel {
        padding: 16px;
      }
    }
```

With this block:

```css
    /* ===== Mobile/Desktop Mode Layout ===== */
    body.mobile-mode #mobile-tab-bar,
    body.mobile-mode #view-mode-switch {
      display: flex;
    }

    body.desktop-mode #view-mode-switch {
      display: flex;
    }

    @media (max-width: 768px) {
      body.mobile-mode #trip-header {
        padding: 36px 18px 64px;
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

- [ ] **Step 3: Add dark theme support for the new controls**

Insert this CSS near the existing dark theme section:

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

- [ ] **Step 4: Run a responsive viewport check to verify the CSS states behave correctly**

Run:

```bash
open "/Users/huangshengqiu/Public/code/ai_research/travel/index.html"
```

Expected:
- In desktop-width viewport, current split layout still works.
- In phone-width viewport with `mobile-mode`, only one panel shows at a time.
- New controls look usable in both light and dark theme.

- [ ] **Step 5: Commit the layout styling change**

Run:

```bash
git add index.html
git commit -m "feat: style mobile and desktop view modes"
```

Expected:
- A new commit is created containing only the layout styling updates.

---

### Task 3: Add mobile mode state and persistence logic

**Files:**
- Modify: `index.html:843-870`, `index.html:1727-1799`
- Test: manual browser verification with reloads

- [ ] **Step 1: Define constants and helper functions for layout state**

Insert this JavaScript after the password-gate script and before the Leaflet/Firebase scripts:

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

- [ ] **Step 2: Add UI application helpers near the end of the main script**

Insert this block before the `// ===== INIT =====` section:

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

- [ ] **Step 3: Add event binding and resize behavior into the init flow**

Replace this init block:

```javascript
    // ===== INIT =====
    renderSummary();
    renderDayCards();
    updateCountdown();
    renderProgress(null);

    // Auto-detect theme preference on load
    (function() {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('theme-toggle').textContent = '☀️';
      }
    })();

    toggleCard('d1');
```

With this block:

```javascript
    // ===== INIT =====
    renderSummary();
    renderDayCards();
    updateCountdown();
    renderProgress(null);

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

    // Auto-detect theme preference on load
    (function() {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('theme-toggle').textContent = '☀️';
      }
    })();

    toggleCard('d1');
```

- [ ] **Step 4: Run a persistence verification pass**

Run:

```bash
open "/Users/huangshengqiu/Public/code/ai_research/travel/index.html"
```

Expected:
- Small screens default to mobile mode.
- Mobile mode defaults to `行程`.
- Switching to `地图` and reloading preserves the map tab.
- Switching to `桌面版` and reloading preserves desktop mode.

- [ ] **Step 5: Commit the state logic change**

Run:

```bash
git add index.html
git commit -m "feat: persist mobile layout mode and tabs"
```

Expected:
- A new commit is created containing the view-mode state and persistence logic.

---

### Task 4: Update supporting trip summary text and validate behavior

**Files:**
- Modify: `index.html:825-829`, `index.html:901-917`
- Test: manual browser verification in both desktop and mobile modes

- [ ] **Step 1: Update the badge count so it no longer claims three car rentals**

Replace this HTML line:

```html
      <span class="badge">🚗 3 次租车</span>
```

With this line:

```html
      <span class="badge">🚗 2 次租车</span>
```

- [ ] **Step 2: Update the car rental summary to match the new D8 no-car plan**

Replace this `carRentals` entry:

```javascript
        { date: "5/08", location: "欧胡岛", detail: "Waikiki取车 → 恐龙湾（早上）→ Kualoa Hollywood Tour → 平等院/张学良墓 → Waikiki还车", duration: "1天" }
```

With this entry:

```javascript
        { date: "5/08", location: "欧胡岛", detail: "不租车：Kaneohe Bay Sandbar → Kualoa Hollywood Tour → 平等院/张学良墓（打车串联）", duration: "1天" }
```

- [ ] **Step 3: Run a full manual acceptance pass against the spec**

Run:

```bash
open "/Users/huangshengqiu/Public/code/ai_research/travel/index.html"
```

Check manually:
- Phone-sized viewport defaults to mobile mode.
- Mobile mode opens on `行程`.
- `地图` tab displays a correctly sized Leaflet map.
- Bottom `移动版 / 桌面版` switch works.
- Reload preserves both selected mode and selected mobile tab.
- Desktop-width viewport still uses the existing split layout.
- D8 summary text and header badge reflect the current trip plan.

Expected:
- All acceptance checks pass with no layout regression blocking use.

- [ ] **Step 4: Commit the final polish and verification changes**

Run:

```bash
git add index.html
git commit -m "feat: finalize mobile layout toggle experience"
```

Expected:
- A final commit is created with the supporting content update and verified UI behavior.

---

## Self-Review

### Spec coverage check
- Mobile default on small screens: covered in Task 3.
- Manual mobile/desktop override: covered in Tasks 1 and 3.
- Mobile tabs (`行程` / `地图`): covered in Tasks 1, 2, and 3.
- Persist selected mode and tab: covered in Task 3.
- Map resize when shown: covered in Task 3.
- Keep desktop layout intact: covered in Tasks 2 and 4.

### Placeholder scan
- No `TODO`, `TBD`, or deferred implementation wording remains.
- Each code-edit step includes exact replacement code.
- Each verification step includes explicit expected results.

### Type consistency check
- `viewMode` values are consistently `mobile` / `desktop`.
- `mobileTab` values are consistently `itinerary` / `map`.
- Storage keys are consistently `travel-view-mode` and `travel-mobile-tab`.
- Helper function names are consistently reused across tasks.
