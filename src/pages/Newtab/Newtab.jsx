import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Hcard from './Card'
import { Progress } from 'rsup-progress'
import axios from 'axios';
import { LazyLoadComponent } from 'react-lazy-load-image-component';

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}


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
<<<<<<< HEAD
let data;
=======
>>>>>>> 4a7262e227be4210a531a0a650938125030b9bff

const theme = createTheme();

export default function Album() {
<<<<<<< HEAD
=======

  const progress = new Progress({
    height: 5,
    color: '#33eafd',
  })



>>>>>>> 4a7262e227be4210a531a0a650938125030b9bff
  const [homes, setHomes] = useState([]);
  useEffect(() => {
    async function fetchZillow() {
      chrome.storage.local.get(["data", "lat", "long"], response => {
        response.data.map((home) => {
          if (home.zpid || home.buildingId) {
            home.address = home.address !== "--" ? home.address : home.detailUrl.split("/")[2].replace(/-/g, " "),
              home.homeType = home.buildingId ? "APARTMENT" : home.hdpData.homeInfo.homeType,
              home.priceLabel = home.priceLabel ? home.priceLabel : "--",
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
    fetchZillow()
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar>
          <MapsHomeWorkIcon sx={{ mr: 2 }} />
          <Typography variant="h6" color="inherit" noWrap>
            Home Scanner
          </Typography>
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
            {homes.map((home, index) => (
              < Grid item key={index} xs={12} sm={6} md={4} >
                <Hcard progress={progress} home={home}></Hcard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </main>
    </ThemeProvider >
  );
}