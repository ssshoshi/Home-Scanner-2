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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';

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

const theme = createTheme();

const filterSelectSx = {
  color: 'white',
  '.MuiSelect-icon': { color: 'white' },
  backgroundColor: 'rgba(255,255,255,0.15)',
  borderRadius: 1,
  px: 1,
  mx: 0.5,
  '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' },
};


export default function Album() {
  const [formValue, setFormValue] = useState('');
  const [typeValue, setTypeValue] = useState(['All']);
  const [homes, setHomes] = useState([]);
  const [open, setOpen] = useState(false);
  const allHomes = useRef([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [distanceUnit, setDistanceUnit] = useState('m');
  const [sortValue, setSortValue] = useState('distance');
  const [minBeds, setMinBeds] = useState(0);
  const [maxPrice, setMaxPrice] = useState(-1);
  const [isSavedView, setIsSavedView] = useState(false);


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
        setIsSavedView(false);
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
          <Button onClick={() => { setHomes(allHomes.current); setIsSavedView(false); }}>
            <MapsHomeWorkIcon sx={{ mr: 2, "&:hover": { transform: "scale3d(1.3, 1.3, 1)" }, transition: "transform 0.15s ease-in-out", color: "white" }} />
          </Button>
          <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
            Home Scanner
          </Typography>
          {isSavedView && (
            <Chip
              label="Saved"
              size="small"
              variant="outlined"
              onDelete={() => { setHomes(allHomes.current); setIsSavedView(false); }}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', mr: 1 }}
            />
          )}
          <Tooltip title="Saved">
            <Button onClick={() => {
              chrome.storage.local.get({ savedHomes: [] }, (result) => {
                setHomes(result.savedHomes);
                setIsSavedView(true);
              });
            }}>
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
        </Toolbar>
        <Toolbar variant="dense" sx={{ pb: 0.5, gap: 0.5 }}>
          <TypeFilter value={typeValue} onChange={setTypeValue} />
          <Select
            value={sortValue}
            onChange={(e) => setSortValue(e.target.value)}
            variant="standard"
            disableUnderline
            sx={{ ...filterSelectSx, minWidth: 100 }}
          >
            <MenuItem value="distance">Distance</MenuItem>
            <MenuItem value="price">Price ↑</MenuItem>
            <MenuItem value="beds">Beds ↓</MenuItem>
            <MenuItem value="area">Area ↓</MenuItem>
          </Select>
          <Select
            value={minBeds}
            onChange={(e) => setMinBeds(e.target.value)}
            variant="standard"
            disableUnderline
            sx={{ ...filterSelectSx, minWidth: 85 }}
          >
            <MenuItem value={0}>Any beds</MenuItem>
            <MenuItem value={1}>1+ bed</MenuItem>
            <MenuItem value={2}>2+ beds</MenuItem>
            <MenuItem value={3}>3+ beds</MenuItem>
            <MenuItem value={4}>4+ beds</MenuItem>
          </Select>
          <Select
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            variant="standard"
            disableUnderline
            sx={{ ...filterSelectSx, minWidth: 110 }}
          >
            <MenuItem value={-1}>Any price</MenuItem>
            <MenuItem value={200000}>{'<$200K'}</MenuItem>
            <MenuItem value={500000}>{'<$500K'}</MenuItem>
            <MenuItem value={750000}>{'<$750K'}</MenuItem>
            <MenuItem value={1000000}>{'<$1M'}</MenuItem>
          </Select>
          <SearchForm value={formValue} onChange={setFormValue} />
        </Toolbar>
      </AppBar>
      <main>
        <Homes typeValue={typeValue} formValue={formValue} homes={homes} loading={loading} hasSearched={hasSearched} distanceUnit={distanceUnit} sortValue={sortValue} minBeds={minBeds} maxPrice={maxPrice}></Homes>
      </main>
    </ThemeProvider >

  );
}
