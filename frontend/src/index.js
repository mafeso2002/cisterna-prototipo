import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './global.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0288d1', // Azul agua principal
    },
    background: {
      default: '#e1f5fe', // Fondo celeste muy claro
      paper: '#ffffff',   // Las cards siguen siendo blancas
    },
    text: {
      primary: '#01579b', // Azul más fuerte para textos
    },
  },
  shape: {
    borderRadius: 12, // Bordes redondeados suaves
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
