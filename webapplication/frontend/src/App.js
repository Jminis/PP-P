// src/App.js
import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import NavigationBar from './components/NavigationBar';
import Dashboard from './components/Dashboard';
import CCTVPage from './components/CCTVPage';
import './App.css';

// Define your theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e',
      contrastText: '#ffffff',
    },
  },
  typography: {
    h6: {
      fontWeight: 600,
    },
  },
});

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'cctv':
        return <CCTVPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <NavigationBar
          onSafetyBoxClick={() => setCurrentPage('dashboard')}
          onCCTVClick={() => setCurrentPage('cctv')}
          activePage={currentPage}
        />
        <Box sx={{ padding: 3 }}>
          <div className="content-area">
            {renderPage()}
          </div>
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default App;
