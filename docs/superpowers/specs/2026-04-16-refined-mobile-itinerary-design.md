# Refined Mobile Itinerary Design

## Summary
Refine the newly added mobile layout so it is itinerary-first instead of splitting attention between full-screen `行程` and `地图` tabs. Remove the low-value standalone mobile map tab and replace it with a compact map card near the top of the mobile layout. The map card should be visible by default, collapsible by the user, and automatically re-focus to the currently selected day when a day card is opened.

## Goals
- Make the mobile experience primarily about reading and scanning the itinerary.
- Keep the map useful on phones by turning it into a quick geographic context tool instead of a full secondary page.
- Reduce the awkwardness of switching to a mostly empty or low-information map tab.
- Improve mobile readability without redesigning the underlying trip data.
- Preserve the existing desktop layout and desktop map behavior.

## Non-Goals
- No redesign of the desktop layout.
- No full-screen dedicated mobile map page.
- No per-day embedded maps inside every day card.
- No drag gestures, split panes, or advanced mobile map interactions.
- No changes to trip data structure, map markers, or routing logic.

## User Experience

### Desktop behavior
- Keep the current desktop behavior unchanged.
- Desktop continues to use the existing split layout with full map panel and itinerary panel.

### Mobile behavior
- Mobile remains the default mode on small screens.
- Mobile no longer shows `行程 / 地图` tabs.
- Mobile shows a compact map card near the top of the page, above the itinerary content.
- The itinerary remains the primary content below the map card.

### Mobile map card behavior
- The map card is visible by default.
- The map card can be collapsed and expanded by the user.
- When no day is selected, the map card shows the current overview/region context.
- When a day card is opened, the map card automatically focuses on that day’s region or relevant points, using the same existing map logic where possible.
- If the user collapses the map card, itinerary usage should remain smooth and uninterrupted.

## Functional Requirements

### Layout changes
- Remove the mobile-only `行程 / 地图` tab behavior.
- Introduce a `mobile-map-card` container in the mobile layout.
- Introduce a collapse/expand control for the map card.
- Keep the existing `移动版 / 桌面版` mode switch.

### Mobile state
Add a small mobile-only UI state for the map card:
- `mobileMapCollapsed`: `true` or `false`

Persist this state in local storage so the user’s collapse preference is remembered.

### Map focus behavior
- Reuse the existing day/region zoom logic when possible.
- Opening a day card in mobile mode should update the map card’s view to that day.
- Returning to overview should restore the broader map context.
- The map should still invalidate size correctly after layout changes, expansion, or collapse.

### Default rules
1. On small screens, default to mobile mode unless the user explicitly selected desktop mode.
2. In mobile mode, the map card is expanded by default unless a saved preference says otherwise.
3. In desktop mode, the map card does not appear because the normal full map panel is already present.

## Styling Requirements
- Keep the overall visual language consistent with the existing site.
- The mobile map card should feel like a light, integrated summary card rather than a second primary screen.
- The collapse/expand control should be compact and easy to tap.
- The card height should be noticeably smaller than the current full mobile map panel.
- The itinerary content should get more vertical space than it has now.

## Implementation Approach
Because the project is a single-file page, implementation should stay inside `index.html`.

### HTML
- Remove the mobile tab bar from the mobile experience.
- Add a mobile map card container above the main itinerary content.
- Add a toggle button or control inside the mobile map card header.

### CSS
- Replace the current mobile tab styles with mobile map card styles.
- Define expanded and collapsed card states.
- Keep desktop layout rules intact.
- Ensure the map card is hidden in desktop mode.

### JavaScript
- Remove or stop using mobile tab state for the mobile layout.
- Add `mobileMapCollapsed` persistence helpers.
- Update view mode application logic so mobile mode shows itinerary plus map card, not tabbed content.
- Hook day-card selection into the mobile map card focusing behavior.
- Re-run Leaflet size invalidation whenever the map card becomes visible or changes height.

## Edge Cases
- If local storage is unavailable, the map card should still work with a default expanded state.
- If the user collapses the map card, itinerary interactions should still work normally.
- If a day is opened while the card is collapsed, the selected day should still become the pending focus so that expanding the map shows the right region.
- Switching between desktop and mobile mode should not lose the current day context.

## Testing Plan
Verify manually:
1. Mobile mode no longer shows `行程 / 地图` tabs.
2. Mobile mode shows a compact map card above itinerary content.
3. The map card is expanded by default.
4. The map card can be collapsed and expanded.
5. Reload preserves the collapse state.
6. Opening a day card updates the map card focus to that day.
7. Returning to overview restores the broader map view.
8. Desktop mode still uses the full split layout.
9. The bottom `移动版 / 桌面版` switch still works.
10. The mobile layout feels more readable because itinerary content gets more space.

## Acceptance Criteria
- The standalone mobile map tab is gone.
- Mobile is clearly itinerary-first.
- A compact, collapsible map card appears at the top of mobile mode.
- The map card automatically focuses on the selected day.
- Desktop behavior remains unchanged.
- The mobile experience is more readable and the map remains useful as quick context instead of a separate page.
