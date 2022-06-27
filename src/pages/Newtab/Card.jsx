import React, { useState, useEffect } from "react";
import axios from 'axios'
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import ButtonGroup from '@mui/material/ButtonGroup';
import { LazyLoadComponent } from 'react-lazy-load-image-component';
import Grid from "@mui/material/Grid"





const Hcard = ({ home }) => {


  const url = "https://parser-external.geo.moveaws.com/suggest?client_id=rdc-x&input=" + home.address
  const addrStreetview = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${encodeURIComponent(home.address)}&size=800x600&key=AIzaSyARFMLB1na-BBWf7_R3-5YOQQaHqEJf6RQ`;
  const [realtorLink, setRealtorLink] = useState([])
  const [realtorImage, setRealtorImage] = useState("")
  const [streetviewImage, setStreetviewImage] = useState("")
  const [clicked, setClicked] = useState(false)

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
      setStreetviewImage(`https://maps.googleapis.com/maps/api/streetview?location=${encodeURIComponent(
        home.address
      )}&size=800x600&key=AIzaSyARFMLB1na-BBWf7_R3-5YOQQaHqEJf6RQ`)
    } else if (response.data.status !== "OK") {
      const response2 = await axios.get(home.streetViewMetadataURL)
      if (response2.data.status === "OK") {
        setStreetviewImage(`https://www.google.com/maps/@?api=1&map_action=pano&pano=F8XGYxNOWhYgsjU-cUytow&viewpoint=${home.latLong.latitude},${home.latLong.longitude}`)
      }
    }
  }

  const toCamel = (string) => {
    return string.toLowerCase().replace(/(?:_| |\b)(\w)/g, ($1) => {
      return $1.toUpperCase().replace("_", " ");
    });
  }

  let image;

  if (clicked === true) {
    if (streetviewImage) {
      image = streetviewImage
    } else {
      setClicked(!clicked)
    }
  } else {
    if (home.zillowImage) {
      image = home.zillowImage
    } else if (realtorImage) {
      image = realtorImage
    } else if (streetviewImage) {
      image = streetviewImage
    } else {
      image = home.satImage
    }
  }

  return (
    <LazyLoadComponent beforeLoad={() => { fetchData(); fetchStreetview(); }}>
      <Card
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <CardMedia
          component="img"
          onClick={() => {
            setClicked(!clicked)
          }}

          image={image}
          onError={e => {
            e.target.src = home.satImage;
          }}
          alt="random"
        />
        <ButtonGroup variant="contained" aria-label="outlined primary button group" sx={{ display: 'inline' }}>
          <Button>One</Button>
          <Button>Two</Button>
          <Button>Three</Button>
        </ButtonGroup>

        <CardContent sx={{ flexGrow: 1 }}>
          <Grid container rowSpacing={0} columnSpacing={2}>
            <Grid item xs={12}>
              <Typography gutterBottom variant="h5" component="h2">
                <Link href={"https://zillow.com/" + home.detailUrl} target="_blank" rel="noreferrer" underline="hover">{home.address}</Link>
              </Typography>
            </Grid>
            <Grid item xs={6} justifyContent="flex-start">
              <Typography variant="body1">
                <strong>{home.price}</strong> Assessed
              </Typography>
            </Grid>
            <Grid item xs={6} justifyContent="flex-end">
              <Typography variant="body1" align="right">
                <strong>{home.beds}</strong> beds
              </Typography>
            </Grid>
            <Grid item xs={6} justifyContent="flex-start">
              <Typography variant="body1">
                <strong>{home.distance}</strong>m away
              </Typography>
            </Grid>
            <Grid item xs={6} justifyContent="flex-end">
              <Typography variant="body1" align="right">
                <strong>{home.baths}</strong> baths
              </Typography>
            </Grid>
            <Grid item xs={6} justifyContent="flex-start">
              <Typography variant="body1">
                {toCamel(home.homeType)}
              </Typography>
            </Grid>

            <Grid item xs={6} justifyContent="flex-end">
              <Typography variant="body1" align="right">
                <strong>{home.area}</strong> sqft
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Button href={"https://www.zillow.com" + home.detailUrl} size="small" target="_blank">View </Button>
          <Button href={"https://www.realtor.com/realestateandhomes-detail/M" + realtorLink} size="small" target="_blank">View </Button>
          <Button size="small">Edit</Button>
        </CardActions>
      </Card>
    </LazyLoadComponent>
  )
}

export default Hcard