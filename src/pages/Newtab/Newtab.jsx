import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { LazyLoadImage, trackWindowScroll } from 'react-lazy-load-image-component';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Homes from "./Homes";
import useSearch from "./SearchForm";
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import useType from "./Type"



// calculate distance
const getDistance = (lat1, lon1, lat2, lon2, unit) => {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    let radlat1 = (Math.PI * lat1) / 180;
    let radlat2 = (Math.PI * lat2) / 180;
    let theta = lon1 - lon2;
    let radtheta = (Math.PI * theta) / 180;
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
      dist = dist * 1.609344;
    }
    if (unit == "N") {
      dist = dist * 0.8684;
    }
    return dist;
  }
};

const theme = createTheme({
  overrides: {
    MuiOutlinedInput: {
      root: {
        "& $notchedOutline": {
          borderWidth: 0
        },
        "&:hover $notchedOutline": {
          borderWidth: 0
        },
        "&$focused $notchedOutline": {
          borderWidth: 0
        }
      },
      focused: {},
      notchedOutline: {}
    }
  }
});


export default function Album() {
  const [formValue, Form] = useSearch("");
  const [typeValue, TypeForm] = useType("All")
  const [homes, setHomes] = useState([]);
  const [searchParam] = useState(["address"]);

  useEffect(() => {

    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });
    // Get the value of "some_key" in eg "https://example.com/?some_key=some_value"
    let value = params.source; // "some_value"

    if (value === "vrapi") {
      fetchZillow()

    } else if (value === "google") {
      chrome.storage.onChanged.addListener((e) => {
        chrome.storage.local.get(["source"], response => {
          if (response.source === "google") {
            fetchZillow()
          }
        })
      })
    }

    async function fetchZillow() {
      chrome.storage.local.get(["data", "lat", "long"], response => {

        response.data.map((home) => {
          if (home.zpid || home.buildingId) {
            home.address = home.address === undefined ? "--" : home.address !== "--" ? home.address : home.detailUrl.split("/")[2].replace(/-/g, " "),
              home.homeType = home.buildingId ? "APARTMENT" : home.hdpData.homeInfo.homeType,
              home.price = home.priceLabel ? home.priceLabel : "--",
              home.area = home.area ? home.area : "--",
              home.beds = home.beds ? home.beds : "--",
              home.baths = home.baths ? home.baths : "--",
              home.statusText = home.statusText ? home.statusText : "",
              home.zillowImage = !home.imgSrc ? null : home.imgSrc.includes("staticmap") ? null : home.imgSrc,
              home.satImage = !home.imgSrc ? null : home.imgSrc.includes("staticmap") ? home.imgSrc : null,
              home.distance = Math.round(
                getDistance(
                  response.lat,
                  response.long,
                  home.latLong.latitude,
                  home.latLong.longitude,
                  "K"
                ) * 1000
              )
            console.log(home.homeType)
          }
        })
        response.data.sort((a, b) => a.distance - b.distance);
        setHomes(response.data)

      })
    }


  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <MapsHomeWorkIcon sx={{ mr: 2 }} />
          <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
            Home Scanner
          </Typography>
          {TypeForm}
          {Form}
        </Toolbar>
      </AppBar>
      <main>
        {/* Hero unit */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            pt: 8,
            pb: 6,
          }}
        >
        </Box>

        <Homes searchParam={searchParam} typeValue={typeValue} formValue={formValue} homes={homes}></Homes>
      </main>
    </ThemeProvider >
  );
}