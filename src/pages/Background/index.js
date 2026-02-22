console.log('This is the background page.');
console.log('Put the background scripts here.');

let data = []
let lat;
let long;


// open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  // The callback for runtime.onMessage must return falsy if we're not sending a response
  (async () => {
    if (request.type === 'open_side_panel') {
      // This will open a tab-specific side panel only on the current tab.
      await chrome.sidePanel.open({ tabId: sender.tab.id });
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
    console.log(request.lat)
    lat = parseFloat(request.lat)
    long = parseFloat(request.long)


    // convert input coordinates to map boundary coordinates for Zillow url params
    const getMapBoundaries = (lat, long) => {
      const coords = {};
      const x = 0.002743;
      const y = 0.002743;

      coords.west = long - y;
      coords.east = long + y;
      coords.south = lat - x;
      coords.north = lat + x;
      return JSON.stringify(coords);
    };


    // let urlParams = `{"pagination":{},"mapBounds":${getMapBoundaries(
    //   parseFloat(request.lat),
    //   parseFloat(request.long)
    // )},"isMapVisible":true,"filterState":{"isAllHomes":{"value":true}},"mapZoom":18}&wants={"cat1":["listResults","mapResults"]}`;

    // var url = 'https://www.zillow.com/async-create-search-page-state?searchQueryState=' + urlParams;

    // let body = `{"pagination":{},"mapBounds":${getMapBoundaries(
    //   parseFloat(request.lat),
    //   parseFloat(request.long)
    // )},"isMapVisible":true,"filterState":{"isAllHomes":{"value":true}},"mapZoom":18}&wants={"cat1":["listResults","mapResults"]}`;

    let body = `{"searchQueryState":{"pagination":{},"isMapVisible":true,"mapBounds":${getMapBoundaries(
      parseFloat(request.lat),
      parseFloat(request.long)
    )},"mapZoom":18,"filterState":{"sortSelection":{"value":"days"},"isAllHomes":{"value":true}},"isListVisible":false},"wants":{"cat1":["mapResults"],"cat2":["total"]},"requestId":9,"isDebugRequest":false}`

    const zillowUrl = 'https://www.zillow.com/async-create-search-page-state'

    async function fetchData() {
      let res = await fetch(zillowUrl, {
        "headers": {
          "content-type": "application/json",
        },
        "method": "PUT",
        "body": body
      })
      const zillowData = await res.json()
      return zillowData
    }

    fetchData().then(zillowData => {
      data = zillowData.cat1.searchResults.mapResults
      chrome.storage.local.set({ data: data, lat: lat, long: long, source: "google" })
    })
    return true;
  }
})
