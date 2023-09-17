/* global chrome */
import React, { useEffect, useState } from "react";
import axios from 'axios'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import { LazyLoadComponent } from 'react-lazy-load-image-component';
import Grid from "@mui/material/Grid"
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import { styled, alpha } from '@mui/material/styles';






const Hcard = ({ home }) => {


  const url = "https://parser-external.geo.moveaws.com/suggest?client_id=rdc-x&input=" + home.address
  const addrStreetview = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${encodeURIComponent(home.address)}&size=800x600&key=AIzaSyARFMLB1na-BBWf7_R3-5YOQQaHqEJf6RQ`;
  const [realtorLink, setRealtorLink] = useState([])
  const [realtorImage, setRealtorImage] = useState("")
  const [streetviewImage, setStreetviewImage] = useState("")
  const [clicked, setClicked] = useState(false)
  const [btnClicked, setBtnClicked] = useState(false)
  let image;

  async function fetchData() {
    const res = await axios.get(url)
    for (let i of res.data.autocomplete) {
      if (i.area_type === "address") {
        setRealtorLink(i.mpr_id);
        home.realtorLink = realtorLink
        let realtorURL = `https://www.realtor.com/realestateandhomes-detail/M${i.mpr_id}`;
        if (!home.zillowImage) {
          try {
            const response = await axios.get(realtorURL)
            const respHtml = response.data
            const doc = new DOMParser().parseFromString(respHtml, 'text/html')
            // console.log(doc)
            if (doc.querySelector('meta[property="og:image"]')) {
              console.log(home.address + " used")
              setRealtorImage(doc.querySelector('meta[property="og:image"]').content)
            }
            break;
          } catch (err) {

          }
        }
      }
    }
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
  
  



 

  if (clicked === true) {
    if (streetviewImage) {
      image = streetviewImage
    } else {
      setClicked(!clicked)
    }
  } else {
    image = chrome.runtime.getURL("np.png")
    if (home.zillowImage) {
      image = home.zillowImage
    } else if (realtorImage) {
      image = realtorImage
    } else if (streetviewImage) {
      image = streetviewImage
    }

    
  }

  const StyledCard = styled(Card)(() => ({
    transition: "transform 0.2s ease",
    "&:hover": { boxShadow: "rgba(0, 0, 0, 0.3) 0px 4px 8px 0px;" },
  }))

  return (
    <LazyLoadComponent threshold={300} beforeLoad={() => { fetchData(); fetchStreetview(); }}>
      <StyledCard
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >

        <div style={{ position: "relative" }}>
          <CardMedia
            component="img"
            onClick={() => {
              setClicked(!clicked)
            }}

            image={image}
            // onError={e => {
            //   e.target.src = chrome.runtime.getURL("np.png")
            // }}
            alt="random"
          />
           <div style={{ display: 'flex', position: 'absolute', top: 10}}>
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

export default Hcard