import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';


import { createTheme, ThemeProvider } from '@mui/material/styles';
import Hcard from './Card'
import useSearch from "./SearchForm";


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

const theme = createTheme();


export default function Album() {
  const [formValue, Form] = useSearch("");
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

    }

    async function fetchZillow() {
      chrome.storage.local.get(["data", "lat", "long"], response => {
        console.log(response.data)
        response.data.map((home) => {
          if (home.zpid || home.buildingId) {
            home.address = home.address !== "--" ? home.address : home.detailUrl.split("/")[2].replace(/-/g, " "),
              home.homeType = home.buildingId ? "APARTMENT" : home.hdpData.homeInfo.homeType,
              home.price = home.priceLabel ? home.priceLabel : "--",
              home.area = home.area ? home.area : "--",
              home.beds = home.beds ? home.beds : "--",
              home.baths = home.baths ? home.baths : "--",
              home.statusText = home.statusText ? home.statusText : "",
              home.zillowImage = home.imgSrc.includes("staticmap") ? null : home.imgSrc,
              home.satImage = home.imgSrc.includes("staticmap") ? home.imgSrc : null,
              home.distance = Math.round(
                getDistance(
                  response.lat,
                  response.long,
                  home.latLong.latitude,
                  home.latLong.longitude,
                  "K"
                ) * 1000
              )

          }
        })
        response.data.sort((a, b) => a.distance - b.distance);
        setHomes(response.data)
      })
    }
    chrome.storage.onChanged.addListener((e) => {
      fetchZillow()
    }
    )
  }, [])



  function search(homes) {
    return homes.filter((home) => {
      return searchParam.some((newItem) => {
        return (
          home[newItem]
            .toLowerCase()
            .indexOf(formValue.toLowerCase()) > -1
        );
      });
    });
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <MapsHomeWorkIcon sx={{ mr: 2 }} />
          <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
            Home Scanner
          </Typography>
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
        <Container sx={{ py: 8 }} maxWidth="xl">
          {/* End hero unit */}
          <Grid container spacing={4}>
            {search(homes).map((home, index) => (
              < Grid item key={index + home.address} xs={12} sm={6} md={4} >
                <Hcard home={home}></Hcard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </main>
    </ThemeProvider >
  );
}