import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import './Popup.css';

const verifyCoords = (lat, lon) => {
  let ck_lat = /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/;
  let ck_lon = /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/;

  let validLat = ck_lat.test(lat);
  let validLon = ck_lon.test(lon);
  if (validLat && validLon) {
    return true;
  } else {
    return false;
  }
};

const inputIsCoords = (latLong) => {
  if (latLong.includes(",")) {
    let coords = latLong.split(/,/);

    let lat = coords[0].trim();
    let long = coords[1].trim();

    if (verifyCoords(lat, long)) {
      chrome.runtime.sendMessage({ message: "verified", lat: lat, long: long }, () => {

      });
    } else {
      document.querySelector("#error").textContent = "Input must be coordinates e.g. 47.595152, -122.331639"
    }
  } else {
    document.querySelector("#error").textContent = "Input must be coordinates e.g. 47.595152, -122.331639"
  }
}

const Popup = () => {
  const theme = createTheme();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Typography variant="h4" color="blue" noWrap>
        Home Scanner
      </Typography>
      <Typography variant="h6" id="error" color="black" noWrap>
        Search Coordinates
      </Typography>
      <TextField id="standard-basic" label="Standard" variant="standard" />
      <Button id="search" variant="contained" onClick={() => {
        let latLong = document.querySelector("#standard-basic").value;
        console.log(latLong)
        inputIsCoords(latLong)
      }}>Search</Button>
    </ThemeProvider>
  );
};

export default Popup;
