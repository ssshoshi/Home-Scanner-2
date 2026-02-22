# Home Scanner

A Chrome extension that queries Zillow for property listings near any location you select on Google Maps or supported real estate sites, and displays them as a browsable, filterable side panel.

## What It Does

1. **Pick a location** — Right-click anywhere on Google Maps and select **Home Scanner** from the context menu. The extension reads the coordinates from the map. You can also trigger it from a HostCompliance listing page or enter coordinates manually via the extension popup.

2. **See nearby listings** — A side panel opens showing Zillow property cards sorted by distance from your search point.

3. **Browse and filter** — Each card shows address, assessed price, beds/baths, home type, square footage, and distance. Photos auto-play as a swipeable carousel (sourced from Zillow) or fall back to Google Street View. Filter results by type (All / House / Condo) or search by address.

4. **Take action** — Each card has quick links to Zillow, Realtor.com, Google search, and Bing aerial view, plus a pin button that searches Google Maps for that address and a bookmark button to save listings.

## Supported Sites

| Site | What happens |
|------|-------------|
| Google Maps | "Home Scanner" menu item injected into right-click action menu; extracts coordinates on click |
| HostCompliance | Google/Bing map links and a "Home Scanner" button injected into the listing page |
| HomeAway / VRBO | Google/Bing map links injected near the listing map thumbnail |

## Installing

Requires Node.js >= 14.

```bash
npm install
npm run build
```

Then load the `/build` folder as an unpacked extension:

1. Go to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `build` folder

## Development

```bash
npm start        # webpack-dev-server with hot reload
npm run prettier # format all JS/TS/JSON/CSS/SCSS/MD files
```

**Note:** Changes to the background service worker (`src/pages/Background/index.js`), content script (`src/pages/Content/index.js`), or devtools page require manually clicking **Reload** on the extension at `chrome://extensions` — hot reload does not apply to those entry points.

## Secrets

API keys (e.g. Google Maps Street View) are loaded from `secrets.<NODE_ENV>.js` and aliased as the `secrets` module in webpack. These files are gitignored. Create one before building if your code imports from `secrets`:

```js
// secrets.development.js
export default { myKey: '...' };
```

```js
// usage
import secrets from 'secrets';
```
