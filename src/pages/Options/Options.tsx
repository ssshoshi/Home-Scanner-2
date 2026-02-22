import React, { useState, useEffect } from 'react';
import './Options.css';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const Options: React.FC = () => {
  const [useMiles, setUseMiles] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['distanceUnit'], (result) => {
      setUseMiles(result.distanceUnit === 'mi');
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const unit = e.target.checked ? 'mi' : 'm';
    setUseMiles(e.target.checked);
    chrome.storage.local.set({ distanceUnit: unit });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Settings</Typography>
      <FormControlLabel
        control={<Switch checked={useMiles} onChange={handleChange} />}
        label={`Distance: ${useMiles ? 'Imperial (mi)' : 'Metric (km)'}`}
      />
    </Box>
  );
};

export default Options;
