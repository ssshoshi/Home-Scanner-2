import React, { useState, useEffect } from "react";
import axios from 'axios'
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import { LazyLoadComponent } from 'react-lazy-load-image-component';





const Hcard = ({ home, progress }) => {


  const url = "https://parser-external.geo.moveaws.com/suggest?client_id=rdc-x&input=" + home.address
  const addrStreetview = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${encodeURIComponent(home.address)}&size=800x600&key=AIzaSyARFMLB1na-BBWf7_R3-5YOQQaHqEJf6RQ`;
  const [realtorLink, setRealtorLink] = useState([])
  const [realtorImage, setRealtorImage] = useState("")
  const [streetviewImage, setStreetviewImage] = useState("")
  const [clicked, setClicked] = useState(false)
  // console.log(home.zillowImage)

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
        // console.log(realtorLink)

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

          image={clicked ? streetviewImage : home.zillowImage ? home.zillowImage : realtorImage ? realtorImage : streetviewImage ? streetviewImage : home.satImage}
          alt="random"
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h5" component="h2">
            {home.address}
          </Typography>
          <Typography>
            This is a media card. You can use this section to describe the
            content.
          </Typography>
          <Typography>
            {home.distance}
          </Typography>
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