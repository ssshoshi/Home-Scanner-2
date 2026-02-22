import React, { useState, useEffect, useRef } from 'react';
import AppBar from '@mui/material/AppBar';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Homes from "./Homes";
import SearchForm from "./SearchForm";
import TypeFilter from "./Type"
import { clearCardCache } from "./Card"
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
    return dist;
  }
};

const SEARCH_PARAM = ["address"];

const theme = createTheme();


export default function Album() {
  const [formValue, setFormValue] = useState('');
  const [typeValue, setTypeValue] = useState(['All']);
  const [homes, setHomes] = useState([]);
  const [open, setOpen] = useState(false);
  const allHomes = useRef([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [distanceUnit, setDistanceUnit] = useState('m');


  useEffect(() => {
    fetchZillow();
    const storageListener = (e) => {
      if (e.captcha) {
        setOpen(true);
      }
      if (e.data) {
        setLoading(true);
        fetchZillow();
      }
      if (e.distanceUnit) {
        fetchZillow();
      }
    };
    chrome.storage.onChanged.addListener(storageListener);


    return () => chrome.storage.onChanged.removeListener(storageListener);

    async function fetchZillow() {
      chrome.storage.local.get(["data", "lat", "long", "distanceUnit", "homeDataCache"], response => {
        const unit = response.distanceUnit || 'm';
        const homeDataCache = response.homeDataCache || {};
        if (!response.data) {
          setLoading(false);
          return;
        }
        window.scrollTo(0, 0)
        response.data.forEach((home) => {
          if (home.zpid || home.buildingId) {
            home.address = home.address === undefined ? "--" : home.address !== "--" ? home.address : home.detailUrl.split("/")[2].replace(/-/g, " ");
            home.homeType = home.buildingId ? "APARTMENT" : home.hdpData.homeInfo.homeType;
            home.price = home.priceLabel ? home.priceLabel : "--";
            home.area = home.area ? home.area : "--";
            home.beds = home.beds ? home.beds : "--";
            home.baths = home.baths ? home.baths : "--";
            home.statusText = home.statusText ? home.statusText : "";
            home.zillowImage = !home.imgSrc ? null : home.imgSrc.includes("staticmap") ? null : home.imgSrc;
            home.satImage = !home.imgSrc ? null : home.imgSrc.includes("staticmap") ? home.imgSrc : null;
            home.distance = unit === 'mi'
              ? Math.round(getDistance(response.lat, response.long, home.latLong.latitude, home.latLong.longitude) * 10000) / 10000
              : Math.round(getDistance(response.lat, response.long, home.latLong.latitude, home.latLong.longitude, "K") * 1000);
            // Hydrate from persistent cache so cards don't need to re-fetch
            const cached = homeDataCache[home.zpid];
            if (cached) Object.assign(home, cached);
          }
        })
        response.data.sort((a, b) => a.distance - b.distance);
        clearCardCache();
        setDistanceUnit(unit);
        allHomes.current = response.data;
        setHomes(response.data)
        setHasSearched(true);
        setLoading(false);
      })
    }
  }, [])

  return (

    <ThemeProvider theme={theme}>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Zillow CAPTCHA Detected
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Zillow has flagged this request. Open Zillow to complete the CAPTCHA, then try your search again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Dismiss</Button>
          <Button href="https://www.zillow.com" target="_blank" onClick={() => setOpen(false)} autoFocus>
            Open Zillow
          </Button>
        </DialogActions>
      </Dialog>
      <CssBaseline />
      <AppBar position="fixed" >
        <Toolbar>
          <Button>
            <MapsHomeWorkIcon onClick={() => { setHomes(allHomes.current) }} sx={{ mr: 2, "&:hover": { transform: "scale3d(1.3, 1.3, 1)" }, transition: "transform 0.15s ease-in-out", cursor: "pointer", color: "white" }}></MapsHomeWorkIcon>
          </Button>
          <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
            Home Scanner
          </Typography>
          <Tooltip title="Saved">
            <Button onClick={() => {
              chrome.storage.local.get({ savedHomes: [] }, function (result) {
                setHomes(result.savedHomes);
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
          <TypeFilter value={typeValue} onChange={setTypeValue} />
          <SearchForm value={formValue} onChange={setFormValue} />
        </Toolbar>
      </AppBar>
      <main>
        <Homes searchParam={SEARCH_PARAM} typeValue={typeValue} formValue={formValue} homes={homes} loading={loading} hasSearched={hasSearched} distanceUnit={distanceUnit}></Homes>
      </main>
    </ThemeProvider >

  );
}
