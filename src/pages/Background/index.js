// open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Convert a lat/long point into map boundary coords for Zillow search params
const getMapBoundaries = (lat, long) => {
  const delta = 0.002743;
  return JSON.stringify({
    west: long - delta,
    east: long + delta,
    south: lat - delta,
    north: lat + delta,
  });
};

async function fetchZillowData(body) {
  const res = await fetch('https://www.zillow.com/async-create-search-page-state', {
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
    body,
  });
  return res.json();
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  // The callback for runtime.onMessage must return falsy if we're not sending a response
  (async () => {
    if (request.type === 'open_side_panel') {
      // sender.tab is undefined when called from popup context
      const tabId = sender.tab
        ? sender.tab.id
        : (await chrome.tabs.query({ active: true, currentWindow: true }))[0]?.id;
      if (tabId) await chrome.sidePanel.open({ tabId });
    }
  })();

  if (request.type === 'fetchCarousel') {
    const zpid = request.zpid;
    const carouselUrl = `https://www.zillow.com/zg-graph?zpid=${zpid}&operationName=getCarouselPhotos`;
    const body = `{"operationName":"getCarouselPhotos","variables":{"zpid":"${zpid}","isBuilding":false,"isCdpResult":false},"query":"query getCarouselPhotos($zpid: ID, $lotId: ID, $isBuilding: Boolean!, $plid: ID, $isCdpResult: Boolean!) {\\n  property(zpid: $zpid) @skip(if: $isBuilding) {\\n    photos {\\n      mixedSources(aspectRatio: FourThirds, minWidth: 355, maxWidth: 768) {\\n        webp {\\n          url\\n        }\\n      }\\n    }\\n  }\\n  building(lotId: $lotId) @include(if: $isBuilding) {\\n    photos {\\n      mixedSources(aspectRatio: FourThirds, minWidth: 355, maxWidth: 768) {\\n        webp {\\n          url\\n        }\\n      }\\n    }\\n  }\\n  ncCommunity(plid: $plid) @include(if: $isCdpResult) {\\n    images {\\n      mixedSources(aspectRatio: FourThirds, minWidth: 355, maxWidth: 768) {\\n        webp {\\n          url\\n        }\\n      }\\n    }\\n  }\\n}\\n"}`;
    fetch(carouselUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: body
    })
      .then(res => res.json())
      .then(data => sendResponse(data))
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  if (request.message === "verified") {
    const lat = parseFloat(request.lat)
    const long = parseFloat(request.long)

    const body = `{"searchQueryState":{"pagination":{},"isMapVisible":true,"mapBounds":${getMapBoundaries(lat, long)},"mapZoom":18,"filterState":{"sortSelection":{"value":"days"},"isAllHomes":{"value":true}},"isListVisible":false},"wants":{"cat1":["mapResults"],"cat2":["total"]},"requestId":9,"isDebugRequest":false}`

    fetchZillowData(body).then(zillowData => {
      const data = zillowData.cat1.searchResults.mapResults
      chrome.storage.local.set({ data: data, lat: lat, long: long, source: "google" })
    }).catch(err => {
      console.error('Zillow fetch failed:', err)
      chrome.storage.local.set({ data: [], lat: lat, long: long, source: "google" })
    })
    return true;
  }
})
