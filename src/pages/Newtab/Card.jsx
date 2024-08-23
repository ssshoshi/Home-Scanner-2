/* global chrome */
import React, { useState } from "react";
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import { LazyLoadComponent } from 'react-lazy-load-image-component';
import Grid from "@mui/material/Grid";
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import { styled } from '@mui/material/styles';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import MobileStepper from '@mui/material/MobileStepper';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { useTheme } from '@mui/material/styles';


const AutoPlaySwipeableViews = autoPlay(SwipeableViews);



const HomeCard = ({ home, homes, savedHomes }) => {
  const theme = useTheme();
  const url = "https://parser-external.geo.moveaws.com/suggest?client_id=rdc-x&input=" + home.address
  const addrStreetview = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${encodeURIComponent(home.address)}&size=800x600&key=AIzaSyARFMLB1na-BBWf7_R3-5YOQQaHqEJf6RQ`;
  const [realtorLink, setRealtorLink] = useState([])
  const [realtorImage, setRealtorImage] = useState("")
  const [carouselImages, setCarouselImages] = useState([])
  const [carouselImagesLength, setCarouselImagesLength] = useState("")
  const [carouselImage, setCarouselImage] = useState("")
  const [streetviewImage, setStreetviewImage] = useState("")
  const [clicked, setClicked] = useState(false)
  const [btnClicked, setBtnClicked] = useState(false)
  const [homeSaved, setHomeSaved] = useState(false)
  const [activeStep, setActiveStep] = useState(0);
  let image

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };


  async function fetchData() {
    const res = await axios.get(url)
    for (let i of res.data.autocomplete) {
      if (i.area_type === "address") {
        setRealtorLink(i.mpr_id);
        home.realtorLink = realtorLink
        let realtorURL = `https://www.realtor.com/realestateandhomes-detail/M${i.mpr_id}`;
        // if (!home.zillowImage) {
        //   try {
        //     const response = await axios.get(realtorURL)
        //     const respHtml = response.data
        //     const doc = new DOMParser().parseFromString(respHtml, 'text/html')
        //     // console.log(doc)
        //     if (doc.querySelector('meta[property="og:image"]')) {
        //       console.log(home.address + " used")
        //       setRealtorImage(doc.querySelector('meta[property="og:image"]').content)
        //     }
        //     break;
        //   } catch (err) {
        //     console.log(err)
        //     if (!err.response.ok) {
        //       chrome.storage.local.set({ captcha: false })
        //       throw new Error("HTTP status " + err.response.status);
        //     }
        //   }
        // }
      }
    }
  }

  async function fetchCarousel() {
    let carouselUrl = `https://www.zillow.com/zg-graph?zpid=${home.zpid}&operationName=getCarouselPhotos`
    let config = {
      method: 'post',
      url: carouselUrl,
      headers: {
        "content-type": "application/json",
      },
      data: `{\"operationName\":\"getCarouselPhotos\",\"variables\":{\"zpid\":\"${home.zpid}\",\"isBuilding\":false,\"isCdpResult\":false},\"query\":\"query getCarouselPhotos($zpid: ID, $lotId: ID, $isBuilding: Boolean!, $plid: ID, $isCdpResult: Boolean!) {\\n  property(zpid: $zpid) @skip(if: $isBuilding) {\\n    photos {\\n      mixedSources(aspectRatio: FourThirds, minWidth: 355, maxWidth: 768) {\\n        webp {\\n          url\\n        }\\n      }\\n    }\\n  }\\n  building(lotId: $lotId) @include(if: $isBuilding) {\\n    photos {\\n      mixedSources(aspectRatio: FourThirds, minWidth: 355, maxWidth: 768) {\\n        webp {\\n          url\\n        }\\n      }\\n    }\\n  }\\n  ncCommunity(plid: $plid) @include(if: $isCdpResult) {\\n    images {\\n      mixedSources(aspectRatio: FourThirds, minWidth: 355, maxWidth: 768) {\\n        webp {\\n          url\\n        }\\n      }\\n    }\\n  }\\n}\\n\"}`
    }
    const response = await axios(carouselUrl, config)
    home.images = response.data
    setCarouselImage(response.data.data.property.photos[0].mixedSources.webp[0].url)
    setCarouselImages(response.data.data.property.photos)
  }

  async function fetchStreetview() {

    const response = await axios.get(addrStreetview)
    if (response.data.status === "OK") {
      console.log(response.data.status)
      home.pano_id = response.data.pano_id
      setStreetviewImage(`https://maps.googleapis.com/maps/api/streetview?location=${encodeURIComponent(
        home.address
      )}&size=800x600&key=AIzaSyARFMLB1na-BBWf7_R3-5YOQQaHqEJf6RQ`)
    } else if (home.streetViewMetadataURL) {
      const response2 = await axios.get(home.streetViewMetadataURL)
      if (response2.data.status === "OK") {

        home.pano_id = response.data.pano_id
        setStreetviewImage(`https://maps.googleapis.com/maps/api/streetview?location=${home.latLong.latitude},${home.latLong.longitude}&size=800x600&key=AIzaSyARFMLB1na-BBWf7_R3-5YOQQaHqEJf6RQ`)
      } else {
        image = home.satImage
      }
    }
  }

  const toCamel = (string) => {
    return string.toLowerCase().replace(/(?:_| |\b)(\w)/g, ($1) => {
      return $1.toUpperCase().replace("_", " ");
    });
  }

  const sendAddress = (address) => {
    chrome.storage.local.set({ beenClicked: btnClicked, address: address })
  }

  chrome.storage.local.get('savedHomes', function (result) {
    var isAlreadySaved = result.savedHomes.some(function (savedHome) {
      return savedHome.zpid === home.zpid
    });
    if (isAlreadySaved) {
      setHomeSaved(true)
    } else {
      setHomeSaved(false)
    }
  })


  if (clicked === true) {
    if (streetviewImage) {
      image = streetviewImage
    } else {
      setClicked(!clicked)
    }
  } else {
    image = carouselImage
  }



  const StyledCard = styled(Card)(() => ({
    transition: "transform 0.2s ease",
    "&:hover": { boxShadow: "rgba(0, 0, 0, 0.3) 0px 4px 8px 0px;" },
  }))

  return (
    <LazyLoadComponent threshold={300} beforeLoad={() => {
      fetchData();
      fetchStreetview();
      fetchCarousel();
    }}>
      <StyledCard
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >

        <div style={{ position: "relative" }}>
          {carouselImages.length > 1 ?
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
                    <Button style={{ display: 'flex', bottom: '12em', position: 'absolute', right: 0 }} size="small" onClick={handleNext} disabled={activeStep === carouselImages.length - 1}>
                      {theme.direction === 'rtl' ? (
                        <KeyboardArrowLeft sx={{
                          fontSize: "3rem",
                          disabled
                        }} />
                      ) : (
                        <KeyboardArrowRight sx={{
                          fontSize: "3rem",
                          color: "rgb(255, 255, 255)"
                        }} />
                      )}
                    </Button>
                  }
                  backButton={
                    <Button style={{ display: 'flex', bottom: '12em', position: 'absolute', left: 0 }} size="small" onClick={handleBack} disabled={activeStep === 0}>
                      {theme.direction === 'rtl' ? (
                        <KeyboardArrowRight sx={{
                          fontSize: "3rem",
                          disabled
                        }} />
                      ) : (
                        <KeyboardArrowLeft sx={{
                          fontSize: "3rem",
                          color: "rgb(255, 255, 255)"
                        }} />
                      )}
                    </Button>
                  }
                />
                <AutoPlaySwipeableViews
                  axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                  index={activeStep}
                >
                  {carouselImages.map((step, index) => (
                    <div key={index}>
                      {Math.abs(activeStep - index) <= 2 ? (
                        <CardMedia
                          component="img"
                          image={step.mixedSources.webp[0].url}
                          onClick={() => {
                            setClicked(!clicked)
                          }}
                        />
                      ) : null}
                    </div>
                  ))}

                </AutoPlaySwipeableViews>
                {/* <Button style={{ display: 'flex', position: 'absolute', top: '40%', right: 0 }} size="small" onClick={handleNext} disabled={activeStep === carouselImages.length - 1}>
                  {theme.direction === 'rtl' ? (
                    <KeyboardArrowLeft sx={{
                      fontSize: "3rem",
                      color: "rgb(255, 255, 255)"
                    }} />
                  ) : (
                    <KeyboardArrowRight sx={{
                      fontSize: "3rem",
                      color: "rgb(255, 255, 255)"
                    }} />
                  )}
                </Button>
                <Button style={{ display: 'flex', position: 'absolute', top: '40%', left: 0 }} size="small" onClick={handleBack} disabled={activeStep === 0}>
                  {theme.direction === 'rtl' ? (
                    <KeyboardArrowRight sx={{
                      fontSize: "3rem",
                      color: "rgb(255, 255, 255)"
                    }} />
                  ) : (
                    <KeyboardArrowLeft sx={{
                      fontSize: "3rem",
                      color: "rgb(255, 255, 255)"
                    }} />
                  )}
                </Button> */}
              </div>) :
            <CardMedia
              component="img"
              image={image}
              onClick={() => {
                setClicked(!clicked)
              }}

            />
          }

          <div style={{ display: 'flex', position: 'absolute', top: 10 }}>
            <Button
              sx={{ backgroundColor: '#1976d2', minWidth: '0px', ml: 1, alignContent: 'flex-start' }}
              variant="contained"
              size="small"
              onClick={() => { setBtnClicked(!btnClicked); sendAddress(home.address); }}
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
                  chrome.storage.local.get({ savedHomes: [] }, function (result) {
                    // the input argument is ALWAYS an object containing the queried keys
                    // so we select the key we need
                    console.log(home.zpid)

                    // Check if home.zipid is already saved in savedHomes
                    var isAlreadySaved = result.savedHomes.some(function (savedHome) {
                      return savedHome.zpid === home.zpid;
                    });

                    // If home.zipid is not already saved, add it to savedHomes
                    if (!isAlreadySaved) {
                      result.savedHomes.push(home);
                      setHomeSaved(true)
                    } else if (isAlreadySaved) {
                      const index = result.savedHomes.findIndex(item => item.zpid === home.zpid)
                      result.savedHomes.splice(index, 1)
                      setHomeSaved(false)
                    }

                    // set the new array value to the same key
                    chrome.storage.local.set({ savedHomes: result.savedHomes }, function (result) {
                      // you can use strings instead of objects
                      // if you don't  want to define default values
                      savedHomes = result.savedHomes
                      chrome.storage.local.get('savedHomes', function (result) {
                        savedHomes = result.savedHomes
                      });
                    });
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
                <strong>{home.price}</strong> Assessed
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
                <strong>{home.distance}</strong>m away
              </Typography>
            </Grid>


          </Grid>
        </CardContent>
      </StyledCard>
    </LazyLoadComponent>
  )
}

export default HomeCard