console.log('This is the background page.');
console.log('Put the background scripts here.');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "hi") {

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

    // 43.62377317475569, -85.23558318533732

    let urlParams = `{"pagination":{},"mapBounds":${getMapBoundaries(
      parseFloat("43.62377317475569"),
      parseFloat("-85.23558318533732")
    )},"isMapVisible":true,"filterState":{"isAllHomes":{"value":true}},"mapZoom":18}&wants={"cat1":["listResults","mapResults"]}`;

    var url = 'https://www.zillow.com/search/GetSearchPageState.htm?searchQueryState=' + urlParams;
    console.log(url)
    fetch(url)
      .then((response) => response.json())
      .then((zData) => {
        sendResponse(zData.cat1.searchResults.mapResults)

      })

      .catch((error) => {

      });


    return true;
  }

  if (request.msg === "ok") {
    chrome.tabs.create({ url: "/homescanner.html" });
  }






})


