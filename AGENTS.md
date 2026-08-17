# AGENTS.md

## Overview
Static circular calendar clock widget. No build system or package manager.

## Running
Open `index.html` directly in a browser. No build step required.

## Dependencies
All loaded via CDN in `index.html`:
- jQuery 3.1.0
- lettering.js 0.6.1 (splits text into per-character spans)
- jalaali-js (Persian calendar conversion)
- Font Awesome 4.6.3
- Google Fonts (Roboto Mono)

## External APIs
- **Weather**: Open-Meteo API (needs internet)
- **Geocoding**: Nominatim (OpenStreetMap) for location search

## Key Conventions
- **Don't manually edit day-ring CSS**: Lines 681-1331 in `css/style.css` contain hardcoded per-character rotation values. The JS generates equivalent rules dynamically for other rings via `generateDynamicCSS()`.
- **lettering.js integration**: Text elements are split into `.char1`, `.char2`, etc. spans at runtime. CSS selectors target these generated spans.
- **Settings persistence**: Stored in `localStorage` key `calendarSettings` (theme, calendar type, location).
- **UI language**: Mix of German and English strings throughout.

## File Structure
- `index.html` — Structure and CDN dependencies
- `js/index.js` — Clock logic, calendar rings, weather, location, toggles
- `css/style.css` — Layout, themes, hardcoded rotations
