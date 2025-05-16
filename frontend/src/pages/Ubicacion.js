import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import MapaCisterna from '../components/MapaCisterna'; // Asegurate de que la ruta sea correcta

const Ubicacion = () => {
  const [latitud, setLatitud] = useState(null);
  const [longitud, setLongitud] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/config')
      .then(response => response.json())
      .then(data => {
        if (data.latitud && data.longitud) {
          setLatitud(data.latitud);
          setLongitud(data.longitud);
        }
      })
      .catch(error => {
        console.error('Error obteniendo la configuración:', error);
      });
  }, []);

  return (
    <Box sx={{ textAlign: 'center', mt: 5, padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#0288d1', fontWeight: 'bold' }}>
        Ubicación de la Cisterna
      </Typography>

      {latitud && longitud ? (
        <MapaCisterna latitud={latitud} longitud={longitud} />
      ) : (
        <Typography variant="body1" sx={{ mt: 3 }}>
          No se encontró una ubicación configurada. Por favor cargá latitud y longitud desde la sección de Configuración.
        </Typography>
      )}
    </Box>
  );
};

export default Ubicacion;
