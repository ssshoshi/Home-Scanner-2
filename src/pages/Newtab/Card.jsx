/* global chrome */
import React, { useState, useEffect } from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import { LazyLoadComponent } from 'react-lazy-load-image-component';
import Grid from "@mui/material/Grid";
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import { styled, useTheme } from '@mui/material/styles';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SwipeableViews from 'react-swipeable-views';
import MobileStepper from '@mui/material/MobileStepper';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';



const StyledCard = styled(Card)(() => ({
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": { boxShadow: "rgba(0, 0, 0, 0.3) 0px 4px 8px 0px" },
}))

const formatDistance = (distance, unit) => {
  if (unit === 'mi') {
    if (distance < 0.1) return { value: Math.round(distance * 5280), unit: 'ft' };
    return { value: distance.toFixed(1), unit: 'mi' };
  } else {
    if (distance >= 100) return { value: (distance / 1000).toFixed(1), unit: 'km' };
    return { value: distance, unit: 'm' };
  }
};

// Session cache: survives re-renders and filter changes within the same panel session
const cardCache = new Map();
export function clearCardCache() { cardCache.clear(); }

// Batch persistent cache writes — multiple calls within 100ms merge into one storage write
const MAX_CACHE_ENTRIES = 500;
let cacheWriteTimer = null;
let pendingCachePatch = {};
function updateHomeDataCache(zpid, patch) {
  pendingCachePatch[zpid] = { ...pendingCachePatch[zpid], ...patch };
  clearTimeout(cacheWriteTimer);
  cacheWriteTimer = setTimeout(() => {
    const pending = pendingCachePatch;
    pendingCachePatch = {};
    chrome.storage.local.get({ homeDataCache: {} }, (result) => {
      const cache = result.homeDataCache;
      for (const [id, data] of Object.entries(pending)) {
        cache[id] = { ...cache[id], ...data };
      }
      // Evict oldest entries when over the limit
      const keys = Object.keys(cache);
      if (keys.length > MAX_CACHE_ENTRIES) {
        keys.slice(0, keys.length - MAX_CACHE_ENTRIES).forEach(k => delete cache[k]);
      }
      chrome.storage.local.set({ homeDataCache: cache });
    });
  }, 100);
}

const toCamel = (string) =>
  string.toLowerCase().replace(/(?:_| |\b)(\w)/g, ($1) =>
    $1.toUpperCase().replace("_", " ")
  );

const HomeCard = ({ home, scrollPosition, distanceUnit }) => {
  const theme = useTheme();
  const url = "https://parser-external.geo.moveaws.com/suggest?client_id=rdc-x&input=" + home.address
  const addrStreetview = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${encodeURIComponent(home.address)}&size=800x600&key=AIzaSyARFMLB1na-BBWf7_R3-5YOQQaHqEJf6RQ`;
  const [realtorLink, setRealtorLink] = useState("")
  const [carouselImages, setCarouselImages] = useState([])
  const [streetviewImage, setStreetviewImage] = useState("")
  const [homeSaved, setHomeSaved] = useState(false)
  const [activeStep, setActiveStep] = useState(0);
  const handleNext = () => {
    setActiveStep((prevActiveStep) =>
      prevActiveStep === carouselImages.length - 1 ? 0 : prevActiveStep + 1
    );
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) =>
      prevActiveStep === 0 ? carouselImages.length - 1 : prevActiveStep - 1
    );
  };

  async function fetchData() {
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    const match = (data.autocomplete || []).find(i => i.area_type === "address");
    if (match) {
      setRealtorLink(match.mpr_id);
      home.realtorLink = match.mpr_id;
      const cached = cardCache.get(home.zpid) || {};
      cardCache.set(home.zpid, { ...cached, realtorLink: match.mpr_id });
      updateHomeDataCache(home.zpid, { realtorLink: match.mpr_id });
    }
  }

  function fetchCarousel() {
    chrome.runtime.sendMessage({ type: 'fetchCarousel', zpid: home.zpid }, (response) => {
      if (response && response.data && response.data.property && response.data.property.photos) {
        const photos = response.data.property.photos;
        setCarouselImages(photos);
        const cached = cardCache.get(home.zpid) || {};
        cardCache.set(home.zpid, { ...cached, photos });
        updateHomeDataCache(home.zpid, { photos });
      }
    });
  }

  async function fetchStreetview() {
    const res = await fetch(addrStreetview);
    if (res.ok) {
      const data = await res.json();
      if (data.status === "OK") {
        home.pano_id = data.pano_id;
        const streetviewUrl = `https://maps.googleapis.com/maps/api/streetview?location=${encodeURIComponent(
          home.address
        )}&size=800x600&key=AIzaSyARFMLB1na-BBWf7_R3-5YOQQaHqEJf6RQ`;
        setStreetviewImage(streetviewUrl);
        const cached = cardCache.get(home.zpid) || {};
        cardCache.set(home.zpid, { ...cached, streetviewUrl });
        updateHomeDataCache(home.zpid, { streetviewUrl });
        return;
      }
    }
    // Primary failed (HTTP error or status !== "OK") — try secondary or fall back to satImage
    if (home.streetViewMetadataURL) {
      const res2 = await fetch(home.streetViewMetadataURL);
      if (!res2.ok) {
        const streetviewUrl = home.satImage;
        setStreetviewImage(streetviewUrl);
        const cached = cardCache.get(home.zpid) || {};
        cardCache.set(home.zpid, { ...cached, streetviewUrl });
        updateHomeDataCache(home.zpid, { streetviewUrl });
        return;
      }
      const data2 = await res2.json();
      if (data2.status === "OK") {
        home.pano_id = data2.pano_id;
        const streetviewUrl = `https://maps.googleapis.com/maps/api/streetview?location=${home.latLong.latitude},${home.latLong.longitude}&size=800x600&key=AIzaSyARFMLB1na-BBWf7_R3-5YOQQaHqEJf6RQ`;
        setStreetviewImage(streetviewUrl);
        const cached = cardCache.get(home.zpid) || {};
        cardCache.set(home.zpid, { ...cached, streetviewUrl });
        updateHomeDataCache(home.zpid, { streetviewUrl });
      } else {
        const streetviewUrl = home.satImage;
        setStreetviewImage(streetviewUrl);
        const cached = cardCache.get(home.zpid) || {};
        cardCache.set(home.zpid, { ...cached, streetviewUrl });
        updateHomeDataCache(home.zpid, { streetviewUrl });
      }
    } else if (home.satImage) {
      const streetviewUrl = home.satImage;
      setStreetviewImage(streetviewUrl);
      const cached = cardCache.get(home.zpid) || {};
      cardCache.set(home.zpid, { ...cached, streetviewUrl });
      updateHomeDataCache(home.zpid, { streetviewUrl });
    }
  }

  useEffect(() => {
    chrome.storage.local.get('savedHomes', (result) => {
      const isAlreadySaved = (result.savedHomes || []).some(
        (savedHome) => savedHome.zpid === home.zpid
      );
      setHomeSaved(isAlreadySaved);
    });
  }, [home.zpid]);

  const dist = formatDistance(home.distance, distanceUnit);

  return (
    <LazyLoadComponent scrollPosition={scrollPosition} threshold={1000} width={600} height={600}
      beforeLoad={() => {
        const zpid = home.zpid;

        // Session cache hit — restore state without any API calls
        if (cardCache.has(zpid)) {
          const cached = cardCache.get(zpid);
          if (cached.streetviewUrl) setStreetviewImage(cached.streetviewUrl);
          if (cached.realtorLink) setRealtorLink(cached.realtorLink);
          if (cached.photos) setCarouselImages(cached.photos);
          return;
        }

        // Persistent cache hit — home already hydrated from storage in fetchZillow
        if (home.streetviewUrl || home.realtorLink || home.photos) {
          if (home.streetviewUrl) setStreetviewImage(home.streetviewUrl);
          if (home.realtorLink) setRealtorLink(home.realtorLink);
          if (home.photos) setCarouselImages(home.photos);
          cardCache.set(zpid, {
            streetviewUrl: home.streetviewUrl,
            realtorLink: home.realtorLink,
            photos: home.photos,
          });
          return;
        }

        // No cache — fetch from APIs
        fetchData();
        fetchStreetview();
        if (home.hasImage) fetchCarousel();
      }}
    >
      <StyledCard
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ position: "relative" }}>
          {carouselImages.length > 0 ?
            (
              <div >
                <MobileStepper style={{ position: 'absolute', bottom: 0, padding: '0px', width: '100%' }}
                  variant="progress"
                  steps={carouselImages.length}
                  position="bottom"
                  activeStep={activeStep}
                  sx={{
                    ".MuiLinearProgress-root": {
                      width: '100%',
                      height: '5px'
                    }
                  }}
                  nextButton={
                    <Button style={{ display: 'flex', bottom: '11em', position: 'absolute', right: 0 }} size="small" onClick={handleNext}>
                      {theme.direction === 'rtl' ? (
                        <KeyboardArrowLeft sx={{ fontSize: "3rem" }} />
                      ) : (
                        <KeyboardArrowRight sx={{
                          fontSize: "3rem",
                          color: "rgb(255, 255, 255)"
                        }} />
                      )}
                    </Button>
                  }
                  backButton={
                    <Button style={{ display: 'flex', bottom: '11em', position: 'absolute', left: 0 }} size="small" onClick={handleBack}>
                      {theme.direction === 'rtl' ? (
                        <KeyboardArrowRight sx={{ fontSize: "3rem" }} />
                      ) : (
                        <KeyboardArrowLeft sx={{
                          fontSize: "3rem",
                          color: "rgb(255, 255, 255)"
                        }} />
                      )}
                    </Button>
                  }
                />
                <SwipeableViews
                  axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                  index={activeStep}
                  onChangeIndex={(step) => setActiveStep(step)}
                >
                  {carouselImages.map((step, index) => (
                    <div key={index}>
                      {Math.abs(activeStep - index) <= 2 ? (
                        <CardMedia
                          component="img"
                          image={step.mixedSources.webp[0].url}
                        />
                      ) : null}
                    </div>
                  ))}
                </SwipeableViews>
              </div>) :
            <CardMedia
              component="img"
              image={streetviewImage}
            />
          }

          <div style={{ display: 'flex', position: 'absolute', top: 10 }}>
            <Button
              sx={{ backgroundColor: '#1976d2', minWidth: '0px', ml: 1, alignContent: 'flex-start' }}
              variant="contained"
              size="small"
              onClick={() => chrome.storage.local.set({ address: home.address })}
            >
              <FmdGoodIcon style={{ color: '#ea4335' }} />
            </Button>
          </div>
          <div style={{ position: "absolute", bottom: 10, width: '100%', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex' }}>
              {realtorLink.length > 0 ? (
                <Button sx={{ backgroundColor: '#1976d2', ml: 1 }} variant="contained" href={"https://www.realtor.com/realestateandhomes-detail/M" + realtorLink} size="small" target="_blank">Realtor</Button>
              ) : null}
              <Button sx={{ backgroundColor: '#1976d2', ml: 1 }} variant="contained" href={"https://www.google.com/search?q=" + home.address} target="_blank" size="small">Search</Button>
              <Button sx={{ backgroundColor: '#1976d2', ml: 1 }} variant="contained" href={`https://bing.com/maps?where1=` + home.latLong.latitude + `,` + home.latLong.longitude + `&lvl=20&style=h`} target="_blank" size="small">Bing</Button>

              <Button
                sx={{ backgroundColor: '#1976d2', minWidth: '0px', ml: 1 }}
                variant="contained"
                size="small"
                onClick={() => {
                  chrome.storage.local.get({ savedHomes: [] }, (result) => {
                    const isAlreadySaved = result.savedHomes.some((savedHome) =>
                      savedHome.zpid === home.zpid
                    );

                    if (!isAlreadySaved) {
                      result.savedHomes.push(home);
                      setHomeSaved(true);
                    } else {
                      const index = result.savedHomes.findIndex(item => item.zpid === home.zpid);
                      result.savedHomes.splice(index, 1);
                      setHomeSaved(false);
                    }

                    chrome.storage.local.set({ savedHomes: result.savedHomes });
                  });
                }}
              >
                {homeSaved ? (
                  <BookmarkIcon />
                ) : <BookmarkBorderIcon />}
              </Button>
            </div>
          </div>
        </div>

        <CardContent sx={{ flexGrow: 1 }}>
          <Grid container rowSpacing={0} columnSpacing={2}>
            <Grid item xs={12}>
              <Typography gutterBottom variant="h5" component="h2">
                <Link href={"https://zillow.com" + home.detailUrl} target="_blank" rel="noreferrer" underline="hover">{home.address}</Link>
              </Typography>
            </Grid>
            <Grid item xs={6} justifyContent="flex-start">
              <Typography variant="body1">
                <strong>{home.price}</strong> Listed
              </Typography>
            </Grid>
            <Grid item xs={6} justifyContent="flex-end">
              <Typography variant="body1" align="right">
                <strong>{home.beds}</strong> bd <strong>{home.baths}</strong> ba
              </Typography>
            </Grid>
            <Grid item xs={6} justifyContent="flex-start">
              <Typography variant="body1">
                {home.homeType === undefined ? "--" : toCamel(home.homeType)}
              </Typography>
            </Grid>
            <Grid item xs={6} justifyContent="flex-end">
              <Typography variant="body1" align="right">
                <strong>{home.area}</strong> sqft
              </Typography>
            </Grid>
            <Grid item xs={6} justifyContent="flex-start">
              <Typography variant="body1">
                <strong>{dist.value}</strong>{dist.unit} away
              </Typography>
            </Grid>


          </Grid>
        </CardContent>
      </StyledCard>
    </LazyLoadComponent>
  )
}

export default HomeCard
