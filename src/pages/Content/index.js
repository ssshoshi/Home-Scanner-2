import { printLine } from './modules/print';
import * as React from 'react';
import { styled } from '@mui/system';
import { createLogicalAnd } from 'typescript';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");
let lat;
let long;

function insertTextAndClickButton(text) {
    var searchBoxInput = document.getElementById("searchboxinput");
    var searchButton = document.getElementById("searchbox-searchbutton");
    searchBoxInput.value = text;
    searchButton.click();
  }

if (window.location.hostname === "www.google.com") {
    
    chrome.storage.onChanged.addListener((e) => {
        console.log(e)
        if(e.address || e.beenClicked) {
        chrome.storage.local.get(["address"], response => {
            console.log(response)
            insertTextAndClickButton(response.address)
        })
    }
    if(e.beenClicked) {
        var searchButton = document.getElementById("searchbox-searchbutton");
        searchButton.click();
    }
      })

    new MutationObserver((mutations) => {
        const menu = document.querySelector("#action-menu")
        
        if(!document.querySelector("[data-index='10']")) {
            menu.insertAdjacentHTML(
                "beforeend",
                ` <li aria-checked="false" data-index="10" role="menuitemradio" tabindex="0" jsaction="click: actionmenu.select; keydown: actionmenu.keydown;" jstcache="543" jsinstance="*9" class="fxNQSd" jsan="0.aria-checked,7.fxNQSd,0.data-index,0.role,0.tabindex,0.jsaction"><div jstcache="544" style="display:none"></div><div jstcache="545" style="display:none"></div><span jstcache="546" style="display:none"></span><div jstcache="547" class="twHv4e" jsan="7.twHv4e,t-nsjBiGFs4q0"><div jstcache="563" class="mLuXec" jsan="7.mLuXec">Home Scanner</div><div jstcache="564" style="display:none"></div></div></li>`
            );
        }


        document.querySelector("[data-index='10']").addEventListener('click', () => {
            let preSplitCoord = document.querySelector("#action-menu > div").textContent
            let coord = preSplitCoord.split(/,/)
            lat = coord[0];
            long = coord[1];
            chrome.runtime.sendMessage({ message: "verified", lat: lat, long: long, source: "google" });
            chrome.runtime.sendMessage({ type: 'open_side_panel' });

        })

    })
        .observe(document.querySelector("#hovercard"), { attributes: true, subtree: true });
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


//hostcompliance
if (window.location.hostname === "www.hostcompliance.com" || "safe-ca.hostcompliance.com") {
    setTimeout(() => {
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

            chrome.runtime.sendMessage({ message: "verified", lat: lat1, long: long1, source: "google" })
            chrome.runtime.sendMessage({ type: 'open_side_panel' });
        };
    }, 2000)
}






