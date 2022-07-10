import { printLine } from './modules/print';
import * as React from 'react';
import { styled } from '@mui/system';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");
let lat;
let long;


if (window.location.hostname === "www.google.com") {
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

            chrome.runtime.sendMessage({ message: "verified", lat: lat, long: long, source: "google" });
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


    const iframe = document.createElement('iframe');
    const panelBtn = document.createElement('div');


    panelBtn.style.width = "20px"
    panelBtn.style.right = "0px"
    panelBtn.style.left = "calc(100vw - 823px) !important"
    panelBtn.style.top = "calc(50% - 24px)"
    panelBtn.style.width = "23px"
    panelBtn.style.height = "48px"
    panelBtn.style.borderRight = "1px solid #dadce0"
    panelBtn.style.borderRadius = "8px 0 0 8px"
    panelBtn.style.position = "absolute"
    panelBtn.style.zIndex = "9999999"
    panelBtn.style.background = "white 7px center/7px 10px no-repeat"
    panelBtn.onclick = function () { toggle() }


    iframe.id = "homescannerframe"
    iframe.style.height = "100%";
    iframe.style.width = "0px";
    iframe.style.position = "fixed";
    iframe.style.top = "0px";
    iframe.style.right = "0px";
    iframe.style.zIndex = "9000000000000000000";
    iframe.style.border = "0px";
    iframe.src = chrome.runtime.getURL("/newtab.html?source=google")

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

}



const google = `http://maps.google.com/maps?t=k&q=loc:`;
const bing = `https://www.bing.com/maps?where1=`;
const style = "font-weight: bold; width: 100%; text-align: center;";

if (
    window.location.hostname === "www.homeaway.com" ||
    window.location.hostname === "www.vrbo.com"
) {
    window.onload = (e) => {
        const src = document.querySelector(".pdp-map-thumbnail").firstChild.src;
        let params = new URLSearchParams(src);
        let haCoord = params.get("center");
        let haMap = document.querySelector(".listing-overview__map");



        haMap.insertAdjacentHTML(
            "beforebegin",
            `

<a href=${google}${haCoord} style="${style} white-space: normal;" class="label label-default" target="_blank">Google</a><br>
<a href="${bing}${haCoord}&style=h&lvl=18" style="${style} white-space: normal;" class="label label-default" target="_blank">Bing</a>
`
        );
        document.querySelector(".listing-overview__col").style.cssText =
            "white-space: normal";


    }


};





const coord = document.querySelector("ng-map").getAttribute("center").split(/,/);
const map = document.querySelector(".map-container");
const title = document.querySelectorAll(".md-headline")[2];
const searchTerm = encodeURIComponent(title.innerText);
const list = document.querySelectorAll(
    '[ng-if="vm.listing.duplicate_listings.length"]'
)[0];
const dupes = list === undefined ? 0 : list.getElementsByTagName("A");



for (let i = 0; i < dupes.length; i++) {
    if (dupes != 0) {
        map.insertAdjacentHTML(
            "beforebegin",
            `
<a class="md-no-style md-button md-ink-ripple" style="${style} font-size: 12px" href=${dupes[i].innerText} target="_blank">${dupes[i].innerText}</a>

`
        );
    }
}
map.insertAdjacentHTML(
    "beforebegin",
    `

<hr>

<a class="md-no-style md-button md-ink-ripple" style="${style}" href=${google}${coord} target="_blank">Google</a><br>
<a class="md-no-style md-button md-ink-ripple" style="${style}" href="${bing}${coord}&style=h&lvl=18" target="_blank">Bing</a>
<a class="md-no-style md-button md-ink-ripple hscan" style="${style}">Home Scanner</a>
`
);

title.insertAdjacentHTML(
    "beforeend",
    `

<a class="md-icon-button md-button md-ink-ripple" target="_blank" href='http://googl.com/#q="${searchTerm}"'>
<md-icon md-font-icon="fa fa-search" class="ng-scope md-font FontAwesome fa fa-search" role="img" aria-label="fa fa-search"></md-icon>

`
);

document.querySelector(".hscan").onclick = function () {
    let lat1 = coord[0];
    let long1 = coord[1];
    if (chrome.runtime.error) {
        console.log("Runtime error.");
    }
    console.log(lat1, long1)
    chrome.runtime.sendMessage({ message: "verified", lat: lat1, long: long1, source: "vrapi" })
};

    //homescanner button on








