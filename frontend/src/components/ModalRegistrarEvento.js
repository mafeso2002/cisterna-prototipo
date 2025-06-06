import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, Modal, Stack, Snackbar, Alert, MenuItem
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const styleModal = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const tipos = [
  { value: 'baño', label: 'Baño' },
  { value: 'lavado de ropa', label: 'Lavado de ropa' },
  { value: 'otro', label: 'Otro' },
];

const ModalRegistrarEvento = ({ open, handleClose }) => {
  const [fecha, setFecha] = useState(new Date());
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [consumoEstimado, setConsumoEstimado] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleGuardar = async () => {
    if (!tipo) {
      setSnackbar({ open: true, message: 'Debe seleccionar un tipo.', severity: 'error' });
      return;
    }

    try {
      await axios.post('http://localhost:3000/eventos', {
        tipo,
        descripcion,
        timestamp: fecha.toISOString(),
        consumo_estimado: parseFloat(consumoEstimado) || 0,
      });

      setSnackbar({ open: true, message: 'Evento registrado correctamente.', severity: 'success' });
      handleClose();
    } catch (error) {
      console.error('Error al registrar evento:', error);
      setSnackbar({ open: true, message: 'Error al registrar el evento.', severity: 'error' });
    }
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box sx={styleModal}>
          <Typography variant="h6" gutterBottom>
            Registrar Evento de Consumo
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Fecha y Hora"
              value={fecha}
              onChange={(newValue) => setFecha(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
            />
          </LocalizationProvider>

          <TextField
            select
            label="Tipo de Evento"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            fullWidth
            margin="normal"
          >
            {tipos.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            label="Consumo estimado (lts)"
            value={consumoEstimado}
            onChange={(e) => setConsumoEstimado(e.target.value)}
            fullWidth
            margin="normal"
            type="number"
          />

          <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
            <Button onClick={handleClose} variant="outlined">Cancelar</Button>
            <Button onClick={handleGuardar} variant="contained" color="primary">Guardar</Button>
          </Stack>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ModalRegistrarEvento;
