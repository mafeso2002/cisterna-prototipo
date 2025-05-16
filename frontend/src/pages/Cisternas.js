import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Table, TableHead, TableRow, TableCell, TableBody,
  Paper, TableContainer, TablePagination, TextField, InputAdornment,
  IconButton, Tooltip, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SettingsRemoteIcon from '@mui/icons-material/SettingsRemote';
import CircleIcon from '@mui/icons-material/Circle';
import axios from 'axios';
import { keyframes } from '@emotion/react';

// 🔁 Animación "latido"
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const Cisternas = () => {
  const [cisternas, setCisternas] = useState([]);
  const [estadoOnline, setEstadoOnline] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtro, setFiltro] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [modalAgregar, setModalAgregar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [form, setForm] = useState({ id: '', mac: '', descripcion: '' });
  const [ipNueva, setIpNueva] = useState('');
  const [idSeleccionado, setIdSeleccionado] = useState('');

  useEffect(() => {
    fetchCisternas();
    fetchEstado();
    const interval = setInterval(fetchEstado, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCisternas = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/cisternas');
      setCisternas(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEstado = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/cisternas/estado');
      const estadoMap = {};
      res.data.forEach((item) => {
        estadoMap[item.id] = item.online;
      });
      setEstadoOnline(estadoMap);
    } catch (err) {
      console.error('Error al obtener estados:', err);
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

  const exportarCSV = () => {
    const headers = ['ID', 'MAC', 'Descripción', 'Última IP'];
    const filas = cisternasFiltradas.map((c) => [c.id, c.mac, c.descripcion, c.ultima_ip || '-']);
    let csv = 'data:text/csv;charset=utf-8,' + headers.join(';') + '\n';
    filas.forEach(f => csv += f.join(';') + '\n');
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', 'cisternas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const abrirModalAgregar = () => {
    setForm({ id: '', mac: '', descripcion: '' });
    setModalAgregar(true);
  };

  const guardarCisterna = async () => {
    try {
      await axios.post('http://localhost:3000/api/cisternas', form);
      setSnackbarMessage('✅ Cisterna registrada correctamente.');
      setSnackbarSeverity('success');
      fetchCisternas();
      fetchEstado();
    } catch {
      setSnackbarMessage('❌ Error al registrar cisterna.');
      setSnackbarSeverity('error');
    } finally {
      setOpenSnackbar(true);
      setModalAgregar(false);
    }
  };

  const abrirModalEditar = (id, ipActual) => {
    setIdSeleccionado(id);
    setIpNueva(ipActual || '');
    setModalEditar(true);
  };

  const actualizarIp = async () => {
    try {
      await axios.put(`http://localhost:3000/api/cisternas/${idSeleccionado}/ip`, { ip: ipNueva });
      setSnackbarMessage('✅ IP actualizada correctamente.');
      setSnackbarSeverity('success');
      fetchCisternas();
    } catch {
      setSnackbarMessage('❌ Error al actualizar IP.');
      setSnackbarSeverity('error');
    } finally {
      setOpenSnackbar(true);
      setModalEditar(false);
    }
  };

  const forzarWifiManager = async (ip) => {
    try {
      await axios.get(`http://${ip}/wifi`, { timeout: 3000 });
      setSnackbarMessage(`🔧 Se solicitó WiFiManager en ${ip}`);
      setSnackbarSeverity('success');
    } catch {
      setSnackbarMessage(`❌ No se pudo contactar a ${ip}`);
      setSnackbarSeverity('error');
    } finally {
      setOpenSnackbar(true);
    }
  };

  const cisternasFiltradas = cisternas.filter(c =>
    c.id.toLowerCase().includes(filtro) ||
    c.mac.toLowerCase().includes(filtro) ||
    (c.descripcion || '').toLowerCase().includes(filtro)
  );

  return (
    <Box sx={{ textAlign: 'center', mt: 5, mb: 5 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#0288d1', fontWeight: 'bold' }}>
        Lista de Cisternas
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

        <Tooltip title="Exportar CSV">
          <IconButton color="primary" onClick={exportarCSV}>
            <FileDownloadIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Agregar nueva cisterna">
          <IconButton color="primary" onClick={abrirModalAgregar}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ maxWidth: '1000px', margin: 'auto', padding: 2, borderRadius: 5, backgroundColor: '#fff', boxShadow: 3 }}>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e1f5fe' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#01579b' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#01579b' }}>MAC</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#01579b' }}>Descripción</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#01579b' }}>Última IP</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#01579b' }}>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cisternasFiltradas
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.id}</TableCell>
                    <TableCell>{c.mac}</TableCell>
                    <TableCell>{c.descripcion}</TableCell>
                    <TableCell>{c.ultima_ip || '-'}</TableCell>
                    <TableCell>
                      <Tooltip title={estadoOnline[c.id] ? 'Online' : 'Offline'}>
                        <CircleIcon
                          fontSize="small"
                          sx={{
                            color: estadoOnline[c.id] ? 'limegreen' : 'gray',
                            animation: estadoOnline[c.id] ? `${pulse} 1.5s infinite` : 'none'
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar IP">
                        <IconButton onClick={() => abrirModalEditar(c.id, c.ultima_ip)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reconfigurar WiFi">
                        <IconButton onClick={() => forzarWifiManager(c.ultima_ip)}>
                          <SettingsRemoteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={cisternasFiltradas.length}
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

      <Dialog open={modalAgregar} onClose={() => setModalAgregar(false)}>
        <DialogTitle>Registrar nueva cisterna</DialogTitle>
        <DialogContent>
          <TextField label="ID" fullWidth margin="dense" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} />
          <TextField label="MAC" fullWidth margin="dense" value={form.mac} onChange={(e) => setForm({ ...form, mac: e.target.value })} />
          <TextField label="Descripción" fullWidth margin="dense" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalAgregar(false)}>Cancelar</Button>
          <Button variant="contained" onClick={guardarCisterna}>Registrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalEditar} onClose={() => setModalEditar(false)}>
        <DialogTitle>Actualizar IP de la cisterna</DialogTitle>
        <DialogContent>
          <TextField
            label="Nueva IP"
            fullWidth
            margin="dense"
            value={ipNueva}
            onChange={(e) => setIpNueva(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalEditar(false)}>Cancelar</Button>
          <Button variant="contained" onClick={actualizarIp}>Actualizar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Cisternas;
