import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Paper,
  CircularProgress, Snackbar, Alert, Stack
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import axios from 'axios';

const Asistente = () => {
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [cargando, setCargando] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const hacerPreguntaLibre = async () => {
    if (!pregunta.trim()) return;
    await consultarIA('/api/ia/preguntar', { pregunta });
  };

  const consultarIA = async (endpoint, data = {}) => {
    setCargando(true);
    setRespuesta('');

    try {
      const res = await axios.post(`http://localhost:3000${endpoint}`, data);
      setRespuesta(res.data.respuesta);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: '❌ Error al contactar con el asistente.',
        severity: 'error'
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box sx={{ mt: 5, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#0288d1', fontWeight: 'bold' }}>
        <SmartToyIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Asistente Inteligente de Cisterna
      </Typography>

      <Paper elevation={3} sx={{ maxWidth: 700, mx: 'auto', p: 4, mt: 3, borderRadius: 3 }}>

        {/* Preguntas frecuentes */}
        <Typography variant="subtitle1" sx={{ mb: 1, textAlign: 'left', fontWeight: 'bold', color: '#01579b' }}>
          Preguntas frecuentes
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={() =>
              consultarIA('/api/ia/preguntar', {
                pregunta: '¿Cuánta agua queda disponible en la cisterna?'
              })
            }
            disabled={cargando}
          >
            ¿Cuánta agua queda?
          </Button>
          <Button
            variant="outlined"
            onClick={() => consultarIA('/api/ia/prediccion-vaciado')}
            disabled={cargando}
          >
            ¿Cuándo se vaciará?
          </Button>
        </Stack>

        {/* Pregunta libre */}
        <TextField
          label="Escribí tu pregunta..."
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          onClick={hacerPreguntaLibre}
          disabled={cargando}
          sx={{ backgroundColor: '#0288d1', '&:hover': { backgroundColor: '#0277bd' } }}
        >
          {cargando ? (
            <CircularProgress size={24} sx={{ color: '#fff' }} />
          ) : (
            'Preguntar'
          )}
        </Button>

        {respuesta && (
          <Paper
            elevation={1}
            sx={{
              mt: 4,
              p: 3,
              backgroundColor: '#f1f8ff',
              border: '1px solid #90caf9',
              textAlign: 'left',
              whiteSpace: 'pre-wrap'
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Respuesta del asistente:
            </Typography>
            {respuesta}
          </Paper>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Asistente;
