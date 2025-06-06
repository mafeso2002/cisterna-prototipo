import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Scatter
} from 'recharts';
import {
  TextField, Typography, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, Stack,
  Dialog, DialogTitle, DialogContent
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';

const Reporte = () => {
  const [data, setData] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  const fetchData = async () => {
    try {
      const anio = fechaSeleccionada.getFullYear();
      const mes = (fechaSeleccionada.getMonth() + 1).toString().padStart(2, '0');
      const response = await axios.get(`http://localhost:3000/api/reporte/mensual?anio=${anio}&mes=${mes}`);
      setData(response.data.mediciones);
      setEventos(response.data.eventos);
    } catch (error) {
      console.error('Error al obtener reporte:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fechaSeleccionada]);

  const formatoPorcentaje = (valor) => valor == null ? '-' : `${valor.toFixed(1)}%`;

  const obtenerColorPorcentaje = (valor) => {
    if (valor == null) return 'black';
    return valor < 30 ? 'red' : 'blue';
  };

  const customTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    const evento = eventos.find(e => new Date(e.timestamp).toISOString().split('T')[0] === label);
    return (
      <Box sx={{ backgroundColor: 'white', border: '1px solid #ccc', p: 1 }}>
        <Typography variant="subtitle2"><strong>Día:</strong> {label}</Typography>
        <Typography variant="subtitle2"><strong>Promedio:</strong> {formatoPorcentaje(payload[0].value)}</Typography>
        {evento && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 1 }}><strong>Evento:</strong> {evento.tipo}</Typography>
            <Typography variant="body2"><strong>Descripción:</strong> {evento.descripcion}</Typography>
            <Typography variant="body2"><strong>Consumo:</strong> {evento.consumo_estimado} lts</Typography>
          </>
        )}
      </Box>
    );
  };

  const exportarCSV = () => {
    if (!data.length) return;

    const headers = ['Día', 'Promedio Diario (%)'];
    const filas = data.map((registro) => [
      registro.dia,
      registro.promedio_diario !== null ? registro.promedio_diario.toFixed(1) : '-'
    ]);

    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(';') + '\n';
    filas.forEach((fila) => csvContent += fila.join(';') + '\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_${fechaSeleccionada.getFullYear()}_${fechaSeleccionada.getMonth() + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const eventosEnPuntos = eventos.map((e) => {
    const diaEvento = new Date(e.timestamp).toISOString().split('T')[0];
    const punto = data.find(d => d.dia === diaEvento);
    return punto ? {
      ...e,
      dia: diaEvento,
      porcentaje: punto.promedio_diario
    } : null;
  }).filter(Boolean);

  return (
    <Box sx={{ mt: 5, px: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#0288d1', fontWeight: 'bold', textAlign: 'center' }}>
        Reporte Mensual
      </Typography>

      <Box sx={{ maxWidth: '400px', margin: '20px auto' }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            views={['year', 'month']}
            label="Seleccionar Mes y Año"
            minDate={new Date('2020-01-01')}
            maxDate={new Date('2030-12-31')}
            value={fechaSeleccionada}
            onChange={(newValue) => setFechaSeleccionada(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth helperText={null} />}
          />
        </LocalizationProvider>
      </Box>

      <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', mb: 4 }}>
        <Button variant="contained" startIcon={<RefreshIcon />} onClick={fetchData}>Actualizar</Button>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportarCSV}>Exportar CSV</Button>
      </Stack>

      <Box sx={{
        maxWidth: '1000px', margin: 'auto', backgroundColor: '#ffffff',
        padding: 3, borderRadius: 5, boxShadow: '0px 4px 20px rgba(0,0,0,0.1)', mb: 5
      }}>
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
          Gráfico de Consumo Diario (%)
        </Typography>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dia" type="category" />
            <YAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            <Tooltip content={customTooltip} />
            <Legend />
            <Line
              type="monotone"
              dataKey="promedio_diario"
              stroke="#1976d2"
              activeDot={{ r: 10 }}
              dot={{ r: 4 }}
            />
            <Scatter
              name="Eventos"
              data={eventosEnPuntos}
              fill="red"
              shape={({ cx, cy }) => (
                <svg x={cx - 8} y={cy - 12} width={16} height={24} viewBox="0 0 24 24">
                  <path
                    d="M12 0C7 7 4 10 4 14a8 8 0 0016 0c0-4-3-7-8-14z"
                    fill="#d32f2f"
                  />
                </svg>
              )}
            >
              <XAxis dataKey="dia" type="category" />
              <YAxis dataKey="porcentaje" type="number" />
            </Scatter>
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{
        maxWidth: '1000px', margin: 'auto', backgroundColor: '#ffffff',
        padding: 3, borderRadius: 5, boxShadow: '0px 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
          Tabla de Promedios Diarios
        </Typography>

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e1f5fe' }}>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#01579b' }}>Día</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#01579b' }}>Promedio Diario (%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((registro, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{registro.dia}</TableCell>
                  <TableCell align="center" sx={{ color: obtenerColorPorcentaje(registro.promedio_diario) }}>
                    {formatoPorcentaje(registro.promedio_diario)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={!!eventoSeleccionado} onClose={() => setEventoSeleccionado(null)}>
        <DialogTitle>Detalle del Evento</DialogTitle>
        <DialogContent>
          {eventoSeleccionado && (
            <Box sx={{ minWidth: '300px' }}>
              <Typography variant="body1"><strong>Tipo:</strong> {eventoSeleccionado.tipo}</Typography>
              <Typography variant="body1"><strong>Descripción:</strong> {eventoSeleccionado.descripcion}</Typography>
              <Typography variant="body1"><strong>Consumo estimado:</strong> {eventoSeleccionado.consumo_estimado} lts</Typography>
              <Typography variant="body1"><strong>Fecha:</strong> {new Date(eventoSeleccionado.timestamp).toLocaleString()}</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Reporte;
