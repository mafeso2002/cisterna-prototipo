import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
  TablePagination, Button, Stack, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Snackbar, Alert
} from '@mui/material';
import axios from 'axios';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';

const HistorialLlenados = () => {
  const [llenados, setLlenados] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openDialog, setOpenDialog] = useState(false);
  const [llenadoSeleccionado, setLlenadoSeleccionado] = useState({
    id: null,
    fecha: '',
    empresa: '',
    volumen: '',
    observaciones: ''
  });

  const [openSnackbar, setOpenSnackbar] = useState(false); // 👈 Para mostrar el mensaje

  useEffect(() => {
    fetchLlenados();
  }, []);

  const fetchLlenados = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/llenados');
      setLlenados(response.data);
    } catch (error) {
      console.error('Error al obtener llenados:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const exportarCSV = () => {
    if (llenados.length === 0) return;

    const headers = ['Fecha', 'Empresa', 'Volumen (lts)', 'Observaciones'];
    const filas = llenados.map((llenado) => [
      llenado.fecha ? llenado.fecha.split('T')[0] : '-',
      llenado.empresa,
      llenado.volumen !== null ? llenado.volumen : '-',
      llenado.observaciones || '-'
    ]);

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += headers.join(';') + '\n';
    filas.forEach((fila) => {
      csvContent += fila.join(';') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'historial_llenados.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditarClick = (llenado) => {
    setLlenadoSeleccionado({
      id: llenado.id,
      fecha: llenado.fecha ? llenado.fecha.split('T')[0] : '',
      empresa: llenado.empresa || '',
      volumen: llenado.volumen || '',
      observaciones: llenado.observaciones || ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLlenadoSeleccionado({ ...llenadoSeleccionado, [name]: value });
  };

  const handleGuardar = async () => {
    try {
      await axios.put(`http://localhost:3000/api/llenados/${llenadoSeleccionado.id}`, {
        fecha: llenadoSeleccionado.fecha,
        empresa: llenadoSeleccionado.empresa,
        volumen: llenadoSeleccionado.volumen,
        observaciones: llenadoSeleccionado.observaciones
      });
      fetchLlenados(); // Refrescar listado
      setOpenDialog(false); // Cerrar modal
      setOpenSnackbar(true); // 👈 Mostrar mensaje
    } catch (error) {
      console.error('Error al actualizar llenado:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ textAlign: 'center', mt: 5, px: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#0288d1', fontWeight: 'bold' }}>
        Historial de Llenados
      </Typography>

      {/* Botón Exportar */}
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', mb: 4 }}>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportarCSV}>
          Exportar CSV
        </Button>
      </Stack>

      {/* Tabla */}
      <Box
        sx={{
          maxWidth: '1000px',
          margin: 'auto',
          backgroundColor: '#ffffff',
          padding: 3,
          borderRadius: 5,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e1f5fe' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#01579b' }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#01579b' }}>Empresa</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#01579b' }}>Volumen (lts)</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#01579b' }}>Observaciones</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#01579b' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {llenados
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((llenado) => (
                  <TableRow key={llenado.id}>
                    <TableCell>{llenado.fecha ? llenado.fecha.split('T')[0] : '-'}</TableCell>
                    <TableCell>{llenado.empresa}</TableCell>
                    <TableCell>{llenado.volumen !== null ? `${llenado.volumen} lts` : '-'}</TableCell>
                    <TableCell>{llenado.observaciones || '-'}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditarClick(llenado)}
                      >
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {/* Paginación */}
          <TablePagination
            component="div"
            count={llenados.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Filas por página"
          />
        </TableContainer>
      </Box>

      {/* Diálogo de edición */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Editar Llenado</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Fecha"
            type="date"
            name="fecha"
            value={llenadoSeleccionado.fecha}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            label="Empresa"
            name="empresa"
            value={llenadoSeleccionado.empresa}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Volumen (lts)"
            name="volumen"
            type="number"
            value={llenadoSeleccionado.volumen}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Observaciones"
            name="observaciones"
            value={llenadoSeleccionado.observaciones}
            onChange={handleInputChange}
            multiline
            rows={2}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardar}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de éxito */}
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Llenado actualizado correctamente.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HistorialLlenados;
