# Map Route Enhancement Design

**Date:** 2026-03-02
**Goal:** Make daily itinerary map routes clearer, more informative, and less cluttered.

**Architecture:** All changes in existing `index.html`. One new CDN dependency (`leaflet-arrowheads`).

---

## Changes

### 1. Numbered Station Markers

Replace 10px colored dots with 22px numbered circles:
- White background, day-color border, sequence number inside
- Only activities with coordinates get numbered (skip those without)
- Consecutive activities at same location (< 200m) merged into one marker
- Timeline items in the itinerary panel also show matching numbers

### 2. Arrow Route Lines

- Add `leaflet-arrowheads` via CDN (~3KB)
- Draw small directional arrows every ~100px along each daily route polyline
- Arrows inherit the day's color

### 3. Glow Stroke (Double-Layer Polyline)

Replace current dashed line with two stacked polylines:
- Bottom layer: white, weight 6, opacity 0.8 (glow/outline)
- Top layer: day color, weight 3, opacity 0.9 (main route)

### 4. Filter Return Lines

Improved route point collection logic:
- Deduplicate: consecutive points < 0.002° apart (~200m) → keep only first
- Remove round-trips: if A→B→C where C ≈ A (< 0.002°), skip C
- Result: only meaningful travel segments are drawn

---

## Dependencies

- `leaflet-arrowheads` CDN: `https://unpkg.com/leaflet-arrowheads@1.4.0/src/leaflet-arrowheads.js`

## Files Modified

- `index.html` (only file)
