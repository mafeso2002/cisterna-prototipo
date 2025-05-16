import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Snackbar, Alert } from '@mui/material';

const Configuracion = () => {
  const [config, setConfig] = useState({
    alto: '',
    largo: '',
    ancho: '',
    umbral_vacio: '',
    umbral_lleno: '',
    intervalo_horas: '',
    intervalo_minutos: '',
    intervalo_segundos: '',
    frecuenciaEnvioWhatsapp: '',
    latitud: '',
    longitud: '',
    umbral_turno: '' // ✅ nuevo campo
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetch('http://localhost:3000/api/config')
      .then(response => response.json())
      .then(data => {
        setConfig({
          alto: data.alto?.toString() || '',
          largo: data.largo?.toString() || '',
          ancho: data.ancho?.toString() || '',
          umbral_vacio: data.umbral_vacio?.toString() || '',
          umbral_lleno: data.umbral_lleno?.toString() || '',
          intervalo_horas: data.intervalo_horas?.toString() || '',
          intervalo_minutos: data.intervalo_minutos?.toString() || '',
          intervalo_segundos: data.intervalo_segundos?.toString() || '',
          frecuenciaEnvioWhatsapp: data.frecuenciaEnvioWhatsapp?.toString() || '',
          latitud: data.latitud?.toString() || '',
          longitud: data.longitud?.toString() || '',
          umbral_turno: data.umbral_turno?.toString() || '' // ✅ nuevo valor
        });
      })
      .catch(error => {
        console.error('Error cargando configuración:', error);
      });
  }, []);

  const handleChange = (e) => {
    setConfig({
      ...config,
      [e.target.name]: e.target.value,
    });
  };

  const guardarConfiguracion = () => {
    const body = {
      alto: parseInt(config.alto),
      largo: parseInt(config.largo),
      ancho: parseInt(config.ancho),
      umbral_vacio: parseInt(config.umbral_vacio),
      umbral_lleno: parseInt(config.umbral_lleno),
      intervalo_horas: parseInt(config.intervalo_horas),
      intervalo_minutos: parseInt(config.intervalo_minutos),
      intervalo_segundos: parseInt(config.intervalo_segundos),
      frecuenciaEnvioWhatsapp: parseInt(config.frecuenciaEnvioWhatsapp),
      latitud: parseFloat(config.latitud),
      longitud: parseFloat(config.longitud),
      umbral_turno: parseInt(config.umbral_turno) // ✅ agregado aquí
    };

    const camposInvalidos = Object.entries(body).filter(
      ([key, value]) =>
        (['latitud', 'longitud'].indexOf(key) === -1) &&
        (isNaN(value) || value < 0)
    );

    if (camposInvalidos.length > 0) {
      setSnackbarMessage('Todos los valores numéricos deben ser válidos (mayores o iguales a 0).');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    fetch('http://localhost:3000/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    .then(response => response.json())
    .then(() => {
      setSnackbarMessage('Configuración actualizada correctamente.');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    })
    .catch(error => {
      console.error('Error actualizando configuración:', error);
      setSnackbarMessage('Error al actualizar la configuración.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    });
  };

  return (
    <Box sx={{ textAlign: 'center', mt: 5, padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#0288d1', fontWeight: 'bold' }}>
        Configuración de Sistema
      </Typography>

      <Box
        sx={{
          maxWidth: '600px',
          margin: 'auto',
          backgroundColor: '#ffffff',
          padding: 3,
          borderRadius: 5,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          textAlign: 'left',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Alto de la Cisterna (cm)" name="alto" type="number" value={config.alto} onChange={handleChange} fullWidth />
          <TextField label="Largo de la Cisterna (cm)" name="largo" type="number" value={config.largo} onChange={handleChange} fullWidth />
          <TextField label="Ancho de la Cisterna (cm)" name="ancho" type="number" value={config.ancho} onChange={handleChange} fullWidth />
          <TextField label="Umbral Vacío (cm)" name="umbral_vacio" type="number" value={config.umbral_vacio} onChange={handleChange} fullWidth />
          <TextField label="Umbral Lleno (cm)" name="umbral_lleno" type="number" value={config.umbral_lleno} onChange={handleChange} fullWidth />

          <TextField
            label="Umbral para generar Turno (%)"
            name="umbral_turno"
            type="number"
            value={config.umbral_turno}
            onChange={handleChange}
            fullWidth
          />

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Intervalo de Medición
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Horas" name="intervalo_horas" type="number" inputProps={{ min: 0, max: 24 }} value={config.intervalo_horas} onChange={handleChange} sx={{ flex: 1 }} />
            <TextField label="Minutos" name="intervalo_minutos" type="number" inputProps={{ min: 0, max: 60 }} value={config.intervalo_minutos} onChange={handleChange} sx={{ flex: 1 }} />
            <TextField label="Segundos" name="intervalo_segundos" type="number" inputProps={{ min: 0, max: 60 }} value={config.intervalo_segundos} onChange={handleChange} sx={{ flex: 1 }} />
          </Box>

          <TextField label="Frecuencia de Envío WhatsApp (minutos)" name="frecuenciaEnvioWhatsapp" type="number" value={config.frecuenciaEnvioWhatsapp} onChange={handleChange} fullWidth />
          <TextField label="Latitud" name="latitud" type="text" value={config.latitud} onChange={handleChange} fullWidth />
          <TextField label="Longitud" name="longitud" type="text" value={config.longitud} onChange={handleChange} fullWidth />

          <Button variant="contained" color="primary" onClick={guardarConfiguracion} sx={{ mt: 2 }}>
            Guardar Configuración
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Configuracion;
