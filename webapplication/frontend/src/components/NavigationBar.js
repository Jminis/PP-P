import React from 'react';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';

const NavigationBar = ({ onSafetyBoxClick, onCCTVClick, activePage }) => {
  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#d32f2f' }}> 
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Left section with logo and text */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6">😶‍🌫️ PP-P</Typography>
        </Box>

        {/* Right section with buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            sx={{ 
              color: '#fff',
              fontFamily: 'Sour Gummy, cursive',
            }}
            onClick={onSafetyBoxClick} 
            variant={activePage === 'dashboard' ? 'contained' : 'text'}
          >
            Safety Box Information
          </Button>
          <Button 
            sx={{ 
              color: '#fff',
              fontFamily: 'Sour Gummy, cursive',
            }}
            onClick={onCCTVClick} 
            variant={activePage === 'cctv' ? 'contained' : 'text'}
          >
            Checking CCTV
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
