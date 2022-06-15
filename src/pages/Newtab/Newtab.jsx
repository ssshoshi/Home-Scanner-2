import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import CameraIcon from '@mui/icons-material/PhotoCamera';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import { createTheme, ThemeProvider } from '@mui/material/styles';

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

const fetchImage = async (url) => {
  const fetchResult = fetch(url);
  const response = await fetchResult;
  const jsonData = await response.json();
  return jsonData;
};

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

const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const theme = createTheme();
let listingsArr = [];
export default function Album() {

  const [homes, setHomes] = useState([]);
  useEffect(() => {
    chrome.runtime.sendMessage({ message: "hi" }, async response => {
      const homes = response
      console.log(homes)
      setHomes(homes)
      homes.map((home, index) => {
        if (home.zpid || home.buildingId) {
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
                43.62377317475569,
                -85.23558318533732,
                home.latLong.latitude,
                home.latLong.longitude,
                "K"
              ) * 1000
            ),
            fetchImage("https://parser-external.geo.moveaws.com/suggest?client_id=rdc-x&input=" + encodeURI(home.addr)).then((response => response.json()).then((res) => {
              for (i of res.autocomplete) {
                if (i.area_type === "address") {
                  home.realtorLink = i.mpr_id;
                  home.street = i.line;
                  break;
                }
              }
            }))
          console.log(home)
        }
      })

    })

  }, [])
  console.log(listingsArr)


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar>
          <CameraIcon sx={{ mr: 2 }} />
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
              <Grid item key={index} xs={12} sm={6} md={4}>
                <Card
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <CardMedia
                    component="img"
                    // sx={{
                    //   // 16:9
                    //   pt: '56.25%',
                    // }}
                    image={home.imgSrc}
                    alt="random"
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {home.address !== "--" ? home.address : home.detailUrl.split("/")[2].replace(/-/g, " ")}
                    </Typography>
                    <Typography>
                      This is a media card. You can use this section to describe the
                      content.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button href={"https://www.zillow.com" + home.detailUrl} size="small" target="_blank">View </Button>
                    <Button size="small">Edit</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </main>
      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">
        <Typography variant="h6" align="center" gutterBottom>
          Footer
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          Something here to give the footer a purpose!
        </Typography>
        <Copyright />
      </Box>
      {/* End footer */}
    </ThemeProvider>
  );
}