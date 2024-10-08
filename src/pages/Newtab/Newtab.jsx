import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Homes from "./Homes";
import useSearch from "./SearchForm";
import useType from "./Type"
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import OpenInNew from '@mui/icons-material/OpenInNew';
import MapIcon from '@mui/icons-material/Map';
import Tooltip from '@mui/material/Tooltip'
import BookmarksIcon from '@mui/icons-material/Bookmarks';

// calculate distance from searchpoint
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
  const [open, setOpen] = React.useState(false);
  const [allHomes, setAllHomes] = useState([]);
  const [savedHomes, setSavedHomes] = useState([]);


  useEffect(() => {
    fetchZillow()
    chrome.storage.onChanged.addListener((e) => {
      if (e.captcha) {
        handleClickOpen()
      }
      if (e.data) {
        chrome.storage.local.get(["source"], response => {
          if (response.source === "google") {
            fetchZillow()
          }
        })
      }
      if (e.savedHomes) {
        setSavedHomes(e.savedHomes.newValue)
      }
    })


    async function fetchZillow() {
      chrome.storage.local.get(["data", "lat", "long"], response => {
        console.log(response.data)
        window.scrollTo(0, 0)
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
          }
        })
        response.data.sort((a, b) => a.distance - b.distance);
        setHomes(response.data)
        setAllHomes(response.data)
      })
    }
  }, [])

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };


  return (

    <ThemeProvider theme={theme}>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Use Google's location service?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Let Google help apps determine location. This means sending anonymous
            location data to Google, even when no apps are running.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Disagree</Button>
          <Button onClick={handleClose} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
      <CssBaseline />
      <AppBar position="fixed" >
        <Toolbar>
          <Button>
            <MapsHomeWorkIcon onClick={() => { setHomes(allHomes) }} sx={{ mr: 2, "&:hover": { transform: "scale3d(1.3, 1.3, 1)" }, transition: "transform 0.15s ease-in-out", cursor: "pointer", color: "white" }}></MapsHomeWorkIcon>
          </Button>
          <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
            Home Scanner
          </Typography>
          <Tooltip title="Saved">
            <Button onClick={() => {
              chrome.storage.local.get('savedHomes', function (result) {
                setHomes(savedHomes)
              });

            }}
            >
              <BookmarksIcon sx={{ mr: 2, "&:hover": { transform: "scale3d(1.3, 1.3, 1)" }, transition: "transform 0.15s ease-in-out", cursor: "pointer", color: "white" }}></BookmarksIcon>
            </Button>
          </Tooltip>
          <Tooltip title="Google Maps">
            <Button href="https://maps.google.com/" target="_blank">
              <MapIcon sx={{ mr: 2, "&:hover": { transform: "scale3d(1.3, 1.3, 1)" }, transition: "transform 0.15s ease-in-out", cursor: "pointer", color: "white" }}></MapIcon>
            </Button>
          </Tooltip>
          <Tooltip title="New Tab">
            <Button href={window.location.href} target="_blank">
              <OpenInNew sx={{ mr: 2, "&:hover": { transform: "scale3d(1.3, 1.3, 1)" }, transition: "transform 0.15s ease-in-out", cursor: "pointer", color: "white" }}></OpenInNew>
            </Button>
          </Tooltip>
          {TypeForm}
          {Form}
        </Toolbar>
      </AppBar>
      <main>
        <Homes searchParam={searchParam} typeValue={typeValue} formValue={formValue} homes={homes} savedHomes={savedHomes}></Homes>
      </main>
    </ThemeProvider >

  );
}