import React from 'react';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';

const NavigationBar = ({ onSafetyBoxClick, onCCTVClick, activePage }) => {
  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#d32f2f' }}>  {/* 빨간색 AppBar 배경색 */}
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Left section with logo and text */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6">😶‍🌫️ PP-P</Typography>
        </Box>

        {/* Right section with buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            sx={{ 
              color: '#fff', // 빨간색 배경에 흰색 글씨
              fontFamily: 'Sour Gummy, cursive', // 버튼 폰트 적용
            }}
            onClick={onSafetyBoxClick} 
            variant={activePage === 'dashboard' ? 'contained' : 'text'}
          >
            Safety Box Information
          </Button>
          <Button 
            sx={{ 
              color: '#fff', // 빨간색 배경에 흰색 글씨
              fontFamily: 'Sour Gummy, cursive', // 버튼 폰트 적용
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
