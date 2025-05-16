import React from 'react';
import { Box, Toolbar, Container, Paper } from '@mui/material';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          minHeight: '100vh',
          backgroundColor: '#e1f5fe',
          backgroundImage: 'url(/assets/water-drops.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '300px 300px',
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
            {children}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
