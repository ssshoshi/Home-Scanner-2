# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Development build with hot reload (webpack-dev-server)
npm run build      # Production build → outputs to /build
npm run prettier   # Format all JS/TS/JSON/CSS/SCSS/MD files
```

No test suite is configured.

After building, load the `/build` directory as an unpacked Chrome extension at `chrome://extensions`.

## Architecture

Home Scanner is a **Chrome Extension (Manifest V3)** that queries the Zillow API to display nearby property listings when the user selects a location on Google Maps or supported real estate sites.

### Entry Points (webpack)

Each page compiles to a separate bundle:

| Entry | Source | Purpose |
|-------|--------|---------|
| `background` | `src/pages/Background/index.js` | Service worker — core logic |
| `contentScript` | `src/pages/Content/index.js` | Injected into supported sites |
| `newtab` | `src/pages/Newtab/index.jsx` | Property grid UI (also used as side panel default) |
| `popup` | `src/pages/Popup/index.jsx` | Manual lat/long coordinate input |
| `options` | `src/pages/Options/index.jsx` | Extension settings |
| `panel` | `src/pages/Panel/index.jsx` | Side panel wrapper |
| `devtools` | `src/pages/Devtools/index.js` | DevTools integration |

**Hot reload is disabled** for `background`, `contentScript`, and `devtools` — modifications to those files require manually reloading the extension at `chrome://extensions`.

### Data Flow

1. **Coordinate capture**: The content script (`src/pages/Content/index.js`) runs on Google Maps, HomeAway/VRBO, and HostCompliance. On Google Maps it injects a "Home Scanner" menu item into the right-click action menu; clicking it extracts lat/long from the DOM and sends `{ message: "verified", lat, long }` via `chrome.runtime.sendMessage`.

2. **Zillow fetch**: The background service worker receives the message, converts the coordinates into a bounding box (±0.002743 degrees), and makes a PUT request to `https://www.zillow.com/async-create-search-page-state` with a JSON body. Results are stored in `chrome.storage.local` under `{ data, lat, long, source }`.

3. **Display**: The Newtab page (`src/pages/Newtab/Newtab.jsx`) listens on `chrome.storage.onChanged` and re-renders when `data` changes. It computes each property's distance from the search coordinates and sorts the list by proximity. The same page is served as the side panel (`"side_panel": { "default_path": "newtab.html" }`).

### Key Implementation Notes

- **Secrets**: Environment-specific secrets are loaded from `secrets.<NODE_ENV>.js` (e.g., `secrets.development.js`) and aliased as the `secrets` module in webpack. This file is gitignored and must exist for the alias to resolve.

- **State management**: All cross-context state passes through `chrome.storage.local`. There is no Redux or React Context — components read directly from storage via `chrome.storage.local.get` and react to changes via `chrome.storage.onChanged`.

- **Saved homes**: Bookmark state is stored in `chrome.storage.local` under the key `savedHomes`. The Newtab toolbar has a bookmarks button to filter to saved listings.

- **Carousel images**: The background script has a `fetchCarousel` function (currently unused in the main flow) that calls the Zillow GraphQL endpoint `https://www.zillow.com/zg-graph?zpid=<zpid>&operationName=getCarouselPhotos`.

- **Content script DOM targeting**: The Google Maps injection observes `#fDahXd` for mutations and inserts a menu item into `#action-menu > div`. These selectors are tied to Google Maps' internal DOM structure and may break if Google updates their markup.

- **Mixed language**: Most source files are `.jsx`; `src/pages/Options/Options.tsx` is TypeScript. The webpack config handles both via separate loaders (`ts-loader` for `.ts/.tsx`, `babel-loader` for `.js/.jsx`).

- **Dependency overrides**: `package.json` uses npm `overrides` to force safe transitive dependency versions (`minimatch ^10.2.1`, `@babel/runtime ^7.26.10`). When adding new dependencies, check that they are compatible with these pinned versions. One unfixable moderate vulnerability remains: `@babel/runtime < 7.26.10` bundled inside `react-swipeable-views`' own sub-packages — the npm-offered fix is a breaking downgrade of that package, so it is intentionally left.

### Manifest Permissions

- `sidePanel`, `storage`, `tabs`, `scripting`
- Host permission: `https://zillow.com/*`
- Content scripts injected on: `*.hostcompliance.com`, `*.homeaway.com`, `*.vrbo.com`, `*.google.com/maps*`, `*.realtor.com`
