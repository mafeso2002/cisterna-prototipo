import React, { useEffect, useState } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  TablePagination,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import OpacityIcon from '@mui/icons-material/Opacity';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';

const Mediciones = () => {
  const [mediciones, setMediciones] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtro, setFiltro] = useState('');
  const [cargandoMedicion, setCargandoMedicion] = useState(false);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const fetchMediciones = () => {
      axios
        .get('http://localhost:3000/api/medidas')
        .then((response) => setMediciones(response.data))
        .catch((error) => console.error(error));
    };

    fetchMediciones();
    const interval = setInterval(fetchMediciones, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFiltroChange = (event) => {
    setFiltro(event.target.value.toLowerCase());
    setPage(0);
  };

  const limpiarFiltro = () => setFiltro('');

  const formatoFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const exportarCSV = () => {
    const headers = ['Fecha', 'Altura del Agua (cm)', 'Volumen (lts)', 'Porcentaje (%)'];
    const filas = medicionesFiltradas.map((med) => [
      formatoFecha(med.fecha),
      med.alturaAgua,
      med.volumen,
      `${med.porcentaje}%`,
    ]);

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += headers.join(';') + '\n';
    filas.forEach((fila) => {
      csvContent += fila.join(';') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'mediciones.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const medirAhora = async () => {
    setCargandoMedicion(true);
    try {
      await axios.post('http://localhost:3000/api/medidas/forzar');
      setSnackbarMessage('✅ Medición solicitada correctamente.');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      const response = await axios.get('http://localhost:3000/api/medidas');
      setMediciones(response.data);
    } catch (error) {
      console.error('❌ Error al solicitar medición:', error);
      setSnackbarMessage('❌ Error al solicitar medición.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setCargandoMedicion(false);
    }
  };

  const medicionesFiltradas = mediciones.filter((medicion) => {
    const fechaTexto = formatoFecha(medicion.fecha).toLowerCase();
    const alturaTexto = medicion.alturaAgua.toString().toLowerCase();
    const volumenTexto = medicion.volumen.toString().toLowerCase();
    const porcentajeTexto = medicion.porcentaje.toString().toLowerCase();
    return (
      fechaTexto.includes(filtro) ||
      alturaTexto.includes(filtro) ||
      volumenTexto.includes(filtro) ||
      porcentajeTexto.includes(filtro)
    );
  });

  return (
    <Box sx={{ textAlign: 'center', mt: 5, mb: 5 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#0288d1', fontWeight: 'bold' }}>
        Listado de Mediciones
      </Typography>

      <Box sx={{ maxWidth: '1000px', margin: '20px auto', display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          label="Buscar..."
          variant="outlined"
          fullWidth
          value={filtro}
          onChange={handleFiltroChange}
          InputProps={{
            endAdornment: (
              filtro && (
                <InputAdornment position="end">
                  <IconButton onClick={limpiarFiltro}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            ),
          }}
        />

        <Tooltip title="Exportar a Excel">
          <IconButton color="primary" onClick={exportarCSV}>
            <FileDownloadIcon />
          </IconButton>
        </Tooltip>

        <LoadingButton
          variant="outlined"
          color="primary"
          size="small"
          onClick={medirAhora}
          loading={cargandoMedicion}
          loadingPosition="start"
          startIcon={<OpacityIcon />}
          sx={{ height: '36px', whiteSpace: 'nowrap', textTransform: 'none', fontWeight: 'bold' }}
        >
          Medir Agua
        </LoadingButton>
      </Box>

      <Box
        sx={{
          maxWidth: '1000px',
          margin: 'auto',
          padding: 2,
          borderRadius: 5,
          backgroundColor: '#ffffff',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e1f5fe' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#01579b' }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#01579b' }}>Altura del Agua (cm)</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#01579b' }}>Volumen (lts)</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#01579b' }}>Porcentaje (%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medicionesFiltradas
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((medicion) => (
                  <TableRow key={medicion.id} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                    <TableCell>{formatoFecha(medicion.fecha)}</TableCell>
                    <TableCell>{medicion.alturaAgua}</TableCell>
                    <TableCell>{medicion.volumen}</TableCell>
                    <TableCell>{medicion.porcentaje}%</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={medicionesFiltradas.length}
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
    </Box>
  );
};

export default Mediciones;
