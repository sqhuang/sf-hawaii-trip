# Travel Itinerary Webpage Design

## Overview

A single-file interactive travel itinerary webpage for sharing a 9-day trip (HKG → SFO → HNL → Hilo → HNL → ICN → HKG, May 1-10) with travel companions. Chinese language throughout.

## Layout

- **Desktop:** Two-panel — interactive map (left, ~40% width) + itinerary panel (right, ~60% width)
- **Mobile:** Stacked — map (fixed height, top) + scrollable itinerary (below)
- **Header:** Trip title "旧金山 + 夏威夷 9日行程" with date range "5/01 – 5/10", summary badges (6 flights, 4 hotels, 3 car rentals)

## Interactive Map (Leaflet + OpenStreetMap)

- **Scope:** Pacific-centered view showing full route
- **Markers:** Color-coded pins per destination:
  - Red: San Francisco (sub-pins: Alcatraz, Golden Gate, Chinatown, Silicon Valley)
  - Blue: Honolulu/Waikiki (sub-pins: Diamond Head, Pearl Harbor, Kualoa Ranch, Ko Olina)
  - Green: Hilo (sub-pin: Volcano National Park)
- **Flight routes:** Dashed curved lines connecting cities in order
- **Day filtering:** Click a day card → map zooms to that day's city, shows only that day's pins. "全览" button to zoom back out.
- **Popups:** Click a pin → popup with activity name and time

## Itinerary Panel

### Summary Section (top)
- Flight overview table
- Hotel overview table
- Car rental overview table
- Booking checklist (订购清单)

### Day Cards (D1–D9)
Each day is a collapsible card containing:
- **Header:** Day number, date, day-of-week, title (e.g., "D2 | 5/02 周六 | 恶魔岛 + Coit Tower")
- **Badges:** Flight, hotel, car rental info as colored tags
- **Timeline:** Vertical timeline — time on left, activity on right
- **Map linking:** Clickable activities highlight corresponding map pin

### Destination Color Themes
- San Francisco: warm orange/golden
- Hawaii (Oahu): ocean blue
- Big Island: volcanic red/dark

## Technical Approach

- **Single HTML file** — self-contained, no build step
- **Leaflet.js** loaded from CDN (free, no API key)
- **OpenStreetMap** tiles (free, no sign-up)
- **Vanilla HTML/CSS/JS** — no frameworks
- **Itinerary data** embedded as JSON in `<script>` tag
- **Responsive CSS** — mobile-first approach
- **System fonts** with Chinese support: `"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`
- **Estimated file size:** ~30-50KB (excluding CDN assets)
- **Browser support:** All modern browsers + mobile Safari/Chrome

## Data Source

All itinerary content from `detail.txt` in project root.
