console.log('This is the background page.');
console.log('Put the background scripts here.');

let data = []
let lat;
let long;


// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

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


    let urlParams = `{"pagination":{},"mapBounds":${getMapBoundaries(
      parseFloat(request.lat),
      parseFloat(request.long)
    )},"isMapVisible":true,"filterState":{"isAllHomes":{"value":true}},"mapZoom":18}&wants={"cat1":["listResults","mapResults"]}`;

    var url = 'https://www.zillow.com/search/GetSearchPageState.htm?searchQueryState=' + urlParams;


    fetch(url)
      .then((response) => response.json())
      .then((zData) => {
        console.log(zData)
        data = zData.cat1.searchResults.mapResults
        chrome.storage.local.set({ data: data, lat: lat, long: long, source: "google" })
      })
      .catch((error) => {
        console.log(error)
      });


  }

  return true;

})


