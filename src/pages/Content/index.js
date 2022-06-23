import { printLine } from './modules/print';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");

function callback(mutationsList, observer) {
    const menu = document.querySelector("#action-menu > ul")
    menu.insertAdjacentHTML(
        "beforeend",
        ` <li aria-checked="false" data-index="10" role="menuitemradio" tabindex="0" jsaction="click: actionmenu.select; keydown: actionmenu.keydown;" jstcache="543" jsinstance="*9" class="fxNQSd" jsan="0.aria-checked,7.fxNQSd,0.data-index,0.role,0.tabindex,0.jsaction"><div jstcache="544" style="display:none"></div><div jstcache="545" style="display:none"></div><span jstcache="546" style="display:none"></span><div jstcache="547" class="twHv4e" jsan="7.twHv4e,t-nsjBiGFs4q0"><div jstcache="563" class="mLuXec" jsan="7.mLuXec">Home Scanner</div><div jstcache="564" style="display:none"></div></div></li>`
    );

    document.querySelector("[data-index='10']").addEventListener('click', () => {
        console.log(document.querySelector("#action-menu > ul > li:nth-child(1)").textContent)
        let preSplitCoord = document.querySelector("#action-menu > ul > li:nth-child(1)").textContent
        let coord = preSplitCoord.split(/,/)
        let lat = coord[0];
        let long = coord[1];
        console.log(coord)
        chrome.storage.local.set({ data: coord }, function () {
            if (chrome.runtime.error) {
                console.log("Runtime error.");
            }
            chrome.runtime.sendMessage({ message: "verified", lat: lat, long: long });
        });
    })
}

const mutationObserver = new MutationObserver(callback)

mutationObserver.observe(document.querySelector("#hovercard"), { attributes: true, subtree: true })