import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, Modal, Stack, Snackbar, Alert
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

const ModalRegistrarLlenado = ({ open, handleClose }) => {
  const [fecha, setFecha] = useState(new Date());
  const [empresa, setEmpresa] = useState('');
  const [volumen, setVolumen] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleGuardar = async () => {
    if (!empresa.trim()) {
      setSnackbarMessage('Debe ingresar la empresa.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/llenados', {
        fecha: fecha.toISOString(), // Enviamos en formato ISO
        empresa,
        volumen: volumen ? parseFloat(volumen) : null,
        observaciones: observaciones || null,
      });

      setSnackbarMessage('Llenado registrado correctamente.');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      handleClose(); // Cerrar modal después de guardar
    } catch (error) {
      console.error('Error al registrar llenado:', error);
      setSnackbarMessage('Error al registrar el llenado.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box sx={styleModal}>
          <Typography variant="h6" gutterBottom>
            Registrar Nuevo Llenado
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
            label="Empresa"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Volumen (lts)"
            value={volumen}
            onChange={(e) => setVolumen(e.target.value)}
            fullWidth
            margin="normal"
            type="number"
          />
          <TextField
            label="Observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />

          <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
            <Button onClick={handleClose} variant="outlined">Cancelar</Button>
            <Button onClick={handleGuardar} variant="contained" color="primary">Guardar</Button>
          </Stack>
        </Box>
      </Modal>

      {/* Snackbar para mostrar mensajes */}
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
    </>
  );
};

export default ModalRegistrarLlenado;
