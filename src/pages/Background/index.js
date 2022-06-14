console.log('This is the background page.');
console.log('Put the background scripts here.');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if(request.message === "hi") {
    var url =
      'https://www.zillow.com/search/GetSearchPageState.htm?searchQueryState={"pagination":{},"mapBounds":{"west":-86.77044868469238,"east":-86.58848762512207,"south":33.47362093003008,"north":33.60010802041049},"isMapVisible":true,"filterState":{"sortSelection":{"value":"days"},"isAllHomes":{"value":true}},"isListVisible":true,"mapZoom":12}&wants={"cat1":["listResults","mapResults"],"cat2":["total"],"regionResults":["total"]}&requestId=12';
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
