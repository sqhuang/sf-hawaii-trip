# Mobile Layout Toggle Design

## Summary
Add a mobile-friendly viewing mode to the existing single-file travel itinerary page. On small screens, the page should default to a mobile layout that shows one primary panel at a time using tabs for `行程` and `地图`. Users should also be able to manually switch between `移动版` and `桌面版` from a control near the bottom of the page. The page should remember the user's chosen mode and the last selected mobile tab.

## Goals
- Make the itinerary page comfortable to use on phones.
- Preserve the current desktop split layout for larger screens.
- Let users manually override the automatic mobile/desktop choice.
- Reduce visual clutter on mobile by avoiding a long stacked map + itinerary layout.
- Keep implementation contained within the current `index.html` architecture.

## Non-Goals
- No separate mobile-only page or route.
- No redesign of day cards, map markers, or trip data structure.
- No complex animations, gestures, or drag-based resizing.
- No third layout specifically for tablet/landscape beyond the existing responsive breakpoints.

## User Experience

### Desktop behavior
- Keep the current desktop layout unchanged: map panel on one side and itinerary panel on the other.
- The bottom mode switch may still appear, but desktop mode remains the default on larger screens unless the user explicitly chose otherwise on that device.

### Mobile behavior
- On small screens, default to mobile mode unless the user has already manually selected desktop mode.
- In mobile mode, show a compact header followed by a tab bar with:
  - `行程`
  - `地图`
- Default selected tab: `行程`.
- Only one of the two panels is visible at a time in mobile mode.
- `行程` tab shows the existing itinerary content.
- `地图` tab shows the existing map content.

### Mode switch behavior
- Add a lightweight control near the bottom of the page for:
  - `移动版`
  - `桌面版`
- Manual choice overrides automatic screen-size defaults.
- Persist the selected mode in local storage.
- Persist the last selected mobile tab in local storage.

## Functional Requirements

### Layout state
Add two UI state values:
- `viewMode`: `mobile` or `desktop`
- `mobileTab`: `itinerary` or `map`

### Default resolution rules
1. If a saved `viewMode` exists, use it.
2. Otherwise, choose automatically based on screen width.
3. On small screens, auto-default to `mobile`.
4. On larger screens, auto-default to `desktop`.
5. In mobile mode, if no saved tab exists, default `mobileTab` to `itinerary`.

### Rendering rules
- In desktop mode:
  - render the current side-by-side app layout.
  - hide or disable the mobile tab strip.
- In mobile mode:
  - render the page in a single-panel layout.
  - show the tab strip.
  - show only the itinerary panel or map panel based on `mobileTab`.

### Map handling
- When switching to the `地图` tab in mobile mode, ensure the Leaflet map recalculates size after becoming visible.
- When switching between view modes, also refresh map sizing as needed.

## Styling Requirements
- Reuse the existing visual style of the page.
- Mobile tab bar should feel native to the current design, not like a separate app shell.
- Mobile controls should remain simple and compact.
- Header spacing in mobile mode should be tightened slightly to avoid wasting vertical space.
- Avoid layout shifts that break current desktop presentation.

## Implementation Approach
Because the app is a single-file HTML/CSS/JS page, implementation should stay within that structure:

### HTML
- Add a mobile tab control container.
- Add a bottom mode switch container.
- Keep the existing `#map-panel` and `#itinerary-panel` as the core content panels.

### CSS
- Extend the current responsive section instead of creating a separate stylesheet.
- Add styles for:
  - mobile mode wrapper state
  - tab bar
  - active/inactive tab buttons
  - bottom mode switch
  - hidden panel behavior in mobile mode
- Preserve current desktop rules unless `viewMode` explicitly changes behavior.

### JavaScript
- Add local storage keys for mode and selected mobile tab.
- Add initialization logic to resolve the starting mode.
- Add event handlers for:
  - switching between mobile and desktop mode
  - switching mobile tabs
- Trigger Leaflet resize invalidation when the map becomes visible.

## Edge Cases
- If local storage is unavailable, the page should still work with screen-width defaults and non-persistent switching.
- If a user selects desktop mode on a phone, the existing desktop layout should remain usable, even if less comfortable.
- If the viewport resizes after load, automatic behavior should not unexpectedly overwrite a manually selected mode.
- If the map starts hidden in mobile mode, it must still render correctly when the user first opens the map tab.

## Testing Plan
Verify the following manually:
1. Phone-sized viewport defaults to mobile mode.
2. Mobile mode opens on `行程`.
3. Switching to `地图` shows a correctly rendered map.
4. Switching back to `行程` works without breaking scroll state.
5. Bottom `移动版 / 桌面版` switch changes layout correctly.
6. Reload preserves the selected mode.
7. Reload in mobile mode preserves the selected tab.
8. Desktop viewport still shows the current side-by-side layout.
9. Changing between modes does not break the existing itinerary cards, markers, or header.

## Acceptance Criteria
- A phone user gets a mobile-first layout by default.
- Mobile mode uses tabs instead of stacked map + itinerary panels.
- The bottom mode switch allows explicit override between mobile and desktop layouts.
- User choices persist across reloads.
- Desktop behavior remains visually consistent with the current site.
