import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Table, TableHead, TableRow, TableCell, TableBody,
  Paper, TableContainer, TablePagination, TextField, InputAdornment,
  IconButton, Tooltip, Snackbar, Alert
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import ModalRegistrarEvento from '../components/ModalRegistrarEvento';

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtro, setFiltro] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [modalAgregar, setModalAgregar] = useState(false);

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    try {
      const res = await axios.get('http://localhost:3000/eventos');
      setEventos(res.data);
    } catch (err) {
      console.error('Error al obtener eventos:', err);
    }
  };

  const handleFiltroChange = (e) => {
    setFiltro(e.target.value.toLowerCase());
    setPage(0);
  };

  const limpiarFiltro = () => setFiltro('');

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const eventosFiltrados = eventos.filter(e =>
    e.tipo.toLowerCase().includes(filtro) ||
    (e.descripcion || '').toLowerCase().includes(filtro)
  );

  return (
    <Box sx={{ textAlign: 'center', mt: 5, mb: 5 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#0288d1', fontWeight: 'bold' }}>
        Eventos de Consumo
      </Typography>

      <Box sx={{ maxWidth: '1000px', margin: '20px auto', display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          label="Buscar..."
          variant="outlined"
          fullWidth
          value={filtro}
          onChange={handleFiltroChange}
          InputProps={{
            endAdornment: filtro && (
              <InputAdornment position="end">
                <IconButton onClick={limpiarFiltro}><ClearIcon /></IconButton>
              </InputAdornment>
            )
          }}
        />

        <Tooltip title="Agregar nuevo evento">
          <IconButton color="primary" onClick={() => setModalAgregar(true)}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ maxWidth: '1000px', margin: 'auto', padding: 2, borderRadius: 5, backgroundColor: '#fff', boxShadow: 3 }}>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e1f5fe' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#01579b' }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#01579b' }}>Descripción</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#01579b' }}>Consumo Estimado (lts)</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#01579b' }}>Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eventosFiltrados
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((e, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{e.tipo}</TableCell>
                    <TableCell>{e.descripcion}</TableCell>
                    <TableCell>{e.consumo_estimado || '-'}</TableCell>
                    <TableCell>{new Date(e.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={eventosFiltrados.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Filas por página"
          />
        </TableContainer>
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

      <ModalRegistrarEvento
        open={modalAgregar}
        handleClose={() => {
          setModalAgregar(false);
          fetchEventos(); // recargar al cerrar modal
        }}
      />
    </Box>
  );
};

export default Eventos;
