import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Stack, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Snackbar, Alert, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const Empresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState({ id: null, nombre: '' });
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [mensajeSnackbar, setMensajeSnackbar] = useState('');

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/empresas');
      setEmpresas(response.data);
    } catch (error) {
      console.error('Error al obtener empresas:', error);
    }
  };

  const handleOpenDialog = (empresa = { id: null, nombre: '' }) => {
    setEmpresaSeleccionada(empresa);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEmpresaSeleccionada({ id: null, nombre: '' });
  };

  const handleInputChange = (e) => {
    setEmpresaSeleccionada({ ...empresaSeleccionada, nombre: e.target.value });
  };

  const handleGuardar = async () => {
    try {
      if (empresaSeleccionada.id) {
        await axios.put(`http://localhost:3000/api/empresas/${empresaSeleccionada.id}`, {
          nombre: empresaSeleccionada.nombre
        });
        setMensajeSnackbar('Empresa actualizada correctamente.');
      } else {
        await axios.post(`http://localhost:3000/api/empresas`, {
          nombre: empresaSeleccionada.nombre
        });
        setMensajeSnackbar('Empresa creada correctamente.');
      }

      fetchEmpresas();
      handleCloseDialog();
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error al guardar empresa:', error);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta empresa?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/empresas/${id}`);
      setMensajeSnackbar('Empresa eliminada correctamente.');
      fetchEmpresas();
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error al eliminar empresa:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const empresasFiltradas = empresas.filter((e) =>
    e.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <Box sx={{ textAlign: 'center', mt: 5, px: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#0288d1', fontWeight: 'bold' }}>
        Administración de Empresas
      </Typography>

      <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', mb: 3 }}>
        <TextField
          label="Buscar empresa"
          variant="outlined"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Agregar Empresa
        </Button>
      </Stack>

      <Box
        sx={{
          maxWidth: '600px',
          margin: 'auto',
          backgroundColor: '#ffffff',
          padding: 3,
          borderRadius: 5,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e1f5fe' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {empresasFiltradas.map((empresa) => (
                <TableRow key={empresa.id}>
                  <TableCell>{empresa.nombre}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(empresa)} size="small" color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleEliminar(empresa.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {empresasFiltradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No se encontraron empresas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Dialogo Crear/Editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{empresaSeleccionada.id ? 'Editar Empresa' : 'Agregar Empresa'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            type="text"
            fullWidth
            value={empresaSeleccionada.nombre}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardar}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {mensajeSnackbar}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Empresas;
