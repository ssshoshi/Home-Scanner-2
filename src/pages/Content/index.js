import { printLine } from './modules/print';
import * as React from 'react';
import { styled } from '@mui/system';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");
let lat;
let long;

function callback(mutationsList, observer) {
    const menu = document.querySelector("#action-menu > ul")
    menu.insertAdjacentHTML(
        "beforeend",
        ` <li aria-checked="false" data-index="10" role="menuitemradio" tabindex="0" jsaction="click: actionmenu.select; keydown: actionmenu.keydown;" jstcache="543" jsinstance="*9" class="fxNQSd" jsan="0.aria-checked,7.fxNQSd,0.data-index,0.role,0.tabindex,0.jsaction"><div jstcache="544" style="display:none"></div><div jstcache="545" style="display:none"></div><span jstcache="546" style="display:none"></span><div jstcache="547" class="twHv4e" jsan="7.twHv4e,t-nsjBiGFs4q0"><div jstcache="563" class="mLuXec" jsan="7.mLuXec">Home Scanner</div><div jstcache="564" style="display:none"></div></div></li>`
    );

    document.querySelector("[data-index='10']").addEventListener('click', () => {
        let preSplitCoord = document.querySelector("#action-menu > ul > li:nth-child(1)").textContent
        let coord = preSplitCoord.split(/,/)
        lat = coord[0];
        long = coord[1];
        console.log(coord)

        chrome.runtime.sendMessage({ message: "verified", lat: lat, long: long });
        iframe.style.width = "800px";
        panelBtn.style.right = "800px";

    })
}

const mutationObserver = new MutationObserver(callback)

mutationObserver.observe(document.querySelector("#hovercard"), { attributes: true, subtree: true })

console.log("side-panel script loaded");

chrome.runtime.onMessage.addListener(function (msg, sender) {
    if (msg == "toggle") {
        console.log("message received");
        toggle();
    }
})

const MyComponent = styled('div')({
    color: 'darkslategray',
    backgroundColor: 'aliceblue',
    padding: 8,
    borderRadius: 4,
});

export default function BasicUsage() {
    return <MyComponent>Styled div</MyComponent>;
}

const iframe = document.createElement('iframe');

const panelBtn = styled('div')({
    width: '20px',
    right: '0px',
    left: 'calc(100vw - 823px) !important',
    top: "calc(50% - 24px)",
    width: '23px',
    height: '48px',
    borderRight: '1px solid #dadce0',
    borderRadius: '8px 0 0 8px',
    position: 'absolute',
    zIndex: 99999,
    backgroundColor: 'white 7px center / 7px 10px no - repeat'

})

// element.style {
//     left: calc(100vw - 823px)!important;
//     top: calc(50 % - 24px);
//     border: 0;
//     box - shadow: 0 1px 2px rgb(60 64 67 / 30 %), 0 2px 6px 2px rgb(60 64 67 / 15 %);
//     width: 23px;
//     height: 48px;
//     cursor: pointer;
//     border - left: 1px solid #dadce0;
//     border - radius: 8px 0 0 8px;
//     background: white 7px center / 7px 10px no - repeat;
//     z - index: 9999999;
//     position: absolute;
// }

// panelBtn.style.width = "20px"
// panelBtn.style.right = "0px"
// panelBtn.style.left = "calc(100vw - 823px) !important"
// panelBtn.style.top = "calc(50% - 24px)"
// panelBtn.style.width = "23px"
// panelBtn.style.height = "48px"
// panelBtn.style.borderRight = "1px solid #dadce0"
// panelBtn.style.borderRadius = "8px 0 0 8px"
// panelBtn.style.position = "absolute"
// panelBtn.style.zIndex = "9999999"
// panelBtn.style.background = "white 7px center/7px 10px no-repeat"
// panelBtn.onclick = function () { toggle() }


iframe.id = "homescannerframe"
iframe.style.height = "100%";
iframe.style.width = "0px";
iframe.style.position = "fixed";
iframe.style.top = "0px";
iframe.style.right = "0px";
iframe.style.zIndex = "9000000000000000000";
iframe.style.border = "0px";
iframe.src = chrome.runtime.getURL("/newtab.html")

document.body.appendChild(iframe);
document.body.appendChild(panelBtn);

const toggle = () => {
    if (iframe.style.width == "0px") {
        iframe.style.width = "800px";
        panelBtn.style.right = "800px";
    } else if (iframe.style.width = "800px") {
        iframe.style.width = "0px";
        panelBtn.style.right = "0px";
    }

}