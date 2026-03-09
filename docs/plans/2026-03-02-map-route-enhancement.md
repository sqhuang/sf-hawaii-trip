# Map Route Enhancement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make daily itinerary map routes clearer with numbered markers, directional arrows, glow strokes, and filtered return lines.

**Architecture:** All changes in the single `index.html` file. Add `leaflet-arrowheads` CDN for arrow decorations. Replace small dot markers with numbered circles, replace dashed polylines with double-layer glowing lines with arrows, and add smart route point filtering to eliminate visual clutter.

**Tech Stack:** Leaflet.js (existing), leaflet-arrowheads (new CDN), vanilla JS/CSS.

---

### Task 1: Add leaflet-arrowheads CDN

**Files:**
- Modify: `index.html:525` (after the Leaflet JS CDN script tag)

**Step 1: Add the script tag**

Find this line:
```html
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

Add immediately after it:
```html
  <script src="https://unpkg.com/leaflet-arrowheads@1.4.0/src/leaflet-arrowheads.js"></script>
```

**Step 2: Verify**

Run: `open index.html` in browser, check DevTools console
Expected: No errors. `L.polyline([]).arrowheads` should be a function.

---

### Task 2: Add CSS for numbered markers

**Files:**
- Modify: `index.html` (inside the `<style>` block, after the existing `.route-num-marker` style around line 372)

**Step 1: Add numbered marker CSS**

Find this line:
```css
    .route-num-marker { background: transparent; border: none; }
```

Add after it:
```css

    .activity-num-marker { background: transparent; border: none; }
    .activity-num-icon {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      border: 2.5px solid currentColor;
    }
    .tl-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      font-size: 10px;
      font-weight: 700;
      color: #fff;
      margin-right: 6px;
      flex-shrink: 0;
    }
```

**Step 2: Verify**

Run: Refresh browser
Expected: No visual change yet (CSS not used until JS is updated). No errors.

---

### Task 3: Rewrite activity markers + route lines with all 4 enhancements

**Files:**
- Modify: `index.html:847-884` (the entire "ACTIVITY MARKERS + DAY LAYERS" section)

**Step 1: Replace the activity markers + day layers block**

Find this entire block (lines 847-884):
```javascript
    // ===== ACTIVITY MARKERS + DAY LAYERS (Task 6) =====
    const dayLayers = {};

    TRIP_DATA.days.forEach(day => {
      const layerGroup = L.layerGroup();
      dayLayers[day.id] = layerGroup;

      const routePoints = [];
      day.activities.forEach(a => {
        if (!a.lat) return;
        const mapLng = a.lng < 0 ? a.lng + 360 : a.lng;
        const icon = L.divIcon({
          className: 'activity-pin-wrap',
          html: `<div style="width:10px;height:10px;border-radius:50%;background:${day.color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });
        const marker = L.marker([a.lat, mapLng], { icon });
        const timeStr = a.end ? `${a.time}–${a.end}` : a.time;
        marker.bindPopup(`<b>${a.name}</b><br>${timeStr}`);
        layerGroup.addLayer(marker);
        // Collect points for daily route line (deduplicate consecutive same location)
        const last = routePoints[routePoints.length - 1];
        if (!last || Math.abs(last[0] - a.lat) > 0.001 || Math.abs(last[1] - mapLng) > 0.001) {
          routePoints.push([a.lat, mapLng]);
        }
      });
      // Draw daily route polyline connecting activities in order
      if (routePoints.length >= 2) {
        const routeLine = L.polyline(routePoints, {
          color: day.color,
          weight: 2.5,
          opacity: 0.6,
          dashArray: '6, 4'
        });
        layerGroup.addLayer(routeLine);
      }
    });
```

Replace with:
```javascript
    // ===== ACTIVITY MARKERS + DAY LAYERS =====
    const dayLayers = {};
    // Store per-day numbered activities for timeline rendering
    const dayActivityNumbers = {};

    TRIP_DATA.days.forEach(day => {
      const layerGroup = L.layerGroup();
      dayLayers[day.id] = layerGroup;

      // --- Collect geo-activities with numbering & dedup ---
      const geoActivities = [];
      const actNumMap = new Map(); // activityIndex -> display number
      let num = 0;
      day.activities.forEach((a, idx) => {
        if (!a.lat) return;
        const mapLng = a.lng < 0 ? a.lng + 360 : a.lng;
        // Merge with previous if same location (< 0.002°)
        const prev = geoActivities[geoActivities.length - 1];
        if (prev && Math.abs(prev.lat - a.lat) < 0.002 && Math.abs(prev.mapLng - mapLng) < 0.002) {
          // Same location — share the previous number
          actNumMap.set(idx, prev.num);
          prev.names.push({ name: a.name, time: a.end ? `${a.time}–${a.end}` : a.time });
          return;
        }
        num++;
        actNumMap.set(idx, num);
        geoActivities.push({ lat: a.lat, mapLng, num, names: [{ name: a.name, time: a.end ? `${a.time}–${a.end}` : a.time }] });
      });
      dayActivityNumbers[day.id] = actNumMap;

      // --- Numbered markers ---
      geoActivities.forEach(ga => {
        const icon = L.divIcon({
          className: 'activity-num-marker',
          html: `<div class="activity-num-icon" style="color:${day.color}">${ga.num}</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        const marker = L.marker([ga.lat, ga.mapLng], { icon });
        const popupLines = ga.names.map(n => `<b>${n.name}</b><br>${n.time}`).join('<hr style="margin:4px 0">');
        marker.bindPopup(popupLines);
        layerGroup.addLayer(marker);
      });

      // --- Filter route points (remove round-trips) ---
      const rawPts = geoActivities.map(ga => [ga.lat, ga.mapLng]);
      const routePoints = [];
      for (let i = 0; i < rawPts.length; i++) {
        const pt = rawPts[i];
        // Skip if this point returns to a recent point (round-trip filter)
        if (routePoints.length >= 1) {
          const back = routePoints[routePoints.length - 1];
          // Check if next point (i+1) goes back to current routePoints tail-1
          // i.e. A -> B -> A pattern: we already have A,B in routePoints, pt is ~A => skip
          if (routePoints.length >= 2) {
            const backBack = routePoints[routePoints.length - 2];
            if (Math.abs(pt[0] - backBack[0]) < 0.002 && Math.abs(pt[1] - backBack[1]) < 0.002) {
              continue; // skip the return-to-A point
            }
          }
        }
        // Deduplicate consecutive same location
        const last = routePoints[routePoints.length - 1];
        if (!last || Math.abs(last[0] - pt[0]) > 0.002 || Math.abs(last[1] - pt[1]) > 0.002) {
          routePoints.push(pt);
        }
      }

      // --- Draw double-layer polyline with arrows ---
      if (routePoints.length >= 2) {
        // Bottom glow layer (white outline)
        const glowLine = L.polyline(routePoints, {
          color: '#fff',
          weight: 6,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round'
        });
        layerGroup.addLayer(glowLine);

        // Top colored layer with arrowheads
        const routeLine = L.polyline(routePoints, {
          color: day.color,
          weight: 3,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round'
        }).arrowheads({
          size: '12px',
          frequency: '80px',
          fill: true,
          color: day.color,
          fillColor: day.color
        });
        layerGroup.addLayer(routeLine);
      }
    });
```

**Step 2: Verify**

Run: Refresh browser, click on D1 card
Expected:
- Map shows numbered circles (1, 2, 3...) instead of small dots
- Route line is solid with white glow outline
- Small arrows appear along route every ~80px showing direction
- Same-location activities merged into one marker with combined popup
- No round-trip lines (hotel→spot→hotel only shows hotel→spot)

---

### Task 4: Add matching numbers to timeline items

**Files:**
- Modify: `index.html:1045-1059` (the timeline rendering inside `renderDayCards`)

**Step 1: Update timeline item rendering to include numbers**

Find this block (inside `renderDayCards`):
```javascript
        // Build timeline
        let timelineItems = day.activities.map(act => {
          const hasLoc = act.lat !== undefined && act.lng !== undefined;
          const timeStr = act.end ? `${act.time}–${act.end}` : act.time;
          const locAttrs = hasLoc
            ? ` data-lat="${act.lat}" data-lng="${act.lng}" data-day="${day.id}"`
            : '';
          const locClass = hasLoc ? ' has-location' : '';

          const dotStyle = hasLoc ? ` style="--dot-color: ${day.color}"` : '';
          return `<div class="timeline-item${locClass}"${locAttrs}${dotStyle}>
            <span class="tl-time">${timeStr}</span>
            <span class="tl-name">${act.name}</span>
          </div>`;
        }).join('');
```

Replace with:
```javascript
        // Build timeline
        const actNums = dayActivityNumbers[day.id] || new Map();
        let timelineItems = day.activities.map((act, idx) => {
          const hasLoc = act.lat !== undefined && act.lng !== undefined;
          const timeStr = act.end ? `${act.time}–${act.end}` : act.time;
          const locAttrs = hasLoc
            ? ` data-lat="${act.lat}" data-lng="${act.lng}" data-day="${day.id}"`
            : '';
          const locClass = hasLoc ? ' has-location' : '';

          const dotStyle = hasLoc ? ` style="--dot-color: ${day.color}"` : '';
          const numBadge = actNums.has(idx)
            ? `<span class="tl-num" style="background:${day.color}">${actNums.get(idx)}</span>`
            : '';
          return `<div class="timeline-item${locClass}"${locAttrs}${dotStyle}>
            <span class="tl-time">${numBadge}${timeStr}</span>
            <span class="tl-name">${act.name}</span>
          </div>`;
        }).join('');
```

**Step 2: Verify**

Run: Refresh browser, expand D1 card
Expected:
- Timeline items with locations show a small colored circle with number before the time
- Numbers match the numbered markers on the map
- Items without locations (like "休息") have no number badge

---

### Task 5: Final verification across all days

**Files:**
- No changes, verification only

**Step 1: Test each day card**

Run: Open in browser, click through D1 to D9
Expected per day:
- D1 (SFO): ~6-7 numbered markers, route from airport → hotel → chinatown → hotel → wharf
- D2 (SFO): markers for Pier 33, Alcatraz, Coit Tower, Ferry Building
- D3 (SFO): Golden Gate → Silicon Valley → Burlingame, no return lines
- D4 (HNL): SFO airport → HNL airport → Waikiki
- D5 (HNL): Waikiki → Pearl Harbor (no return to Waikiki drawn)
- D6 (Hilo): Diamond Head → HNL airport → ITO → Mauna Kea → Hilo hotel
- D7 (Hilo): Hilo → volcano → Chain of Craters → ITO airport → Waikiki
- D8 (HNL): Waikiki → Kualoa → Byodo-In → Waikiki → Downtown → Chinatown → Waikiki
- D9 (HNL): Waikiki → HNL airport

**Step 2: Check dark mode**

Run: Click moon/sun toggle
Expected: Numbered markers stay visible (white background with colored border works on dark map tiles)

**Step 3: Check mobile layout**

Run: DevTools → responsive mode → 375px width
Expected: Map still shows markers and routes correctly at smaller size

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: enhance map routes with numbered markers, arrows, glow strokes, and round-trip filtering"
```
