/* global chrome */
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import './Popup.css';

const verifyCoords = (lat, lon) => {
  const ck_lat = /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/;
  const ck_lon = /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/;
  return ck_lat.test(lat) && ck_lon.test(lon);
};

const theme = createTheme();

const Popup = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('Search Coordinates');
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (!input.includes(',')) {
      setError('Input must be coordinates e.g. 47.595152, -122.331639');
      return;
    }
    const [rawLat, rawLon] = input.split(',');
    const lat = rawLat.trim();
    const lon = rawLon.trim();
    if (verifyCoords(lat, lon)) {
      setError('Search Coordinates');
      setLoading(true);
      chrome.runtime.sendMessage({ message: 'verified', lat, long: lon }, () => {
        chrome.runtime.sendMessage({ type: 'open_side_panel' });
        setLoading(false);
      });
    } else {
      setError('Input must be coordinates e.g. 47.595152, -122.331639');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '260px' }}>
        <Typography variant="h4" color="primary" noWrap>
          Home Scanner
        </Typography>
        <Typography variant="body2" color={error === 'Search Coordinates' ? 'text.secondary' : 'error'} noWrap>
          {error}
        </Typography>
        <TextField
          label="Coordinates"
          variant="standard"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          disabled={loading}
        />
        <Button variant="contained" onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </Button>
      </div>
    </ThemeProvider>
  );
};

export default Popup;
