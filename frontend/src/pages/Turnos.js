import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Button,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  CircularProgress
} from '@mui/material';

const Turnos = () => {
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmarOpen, setConfirmarOpen] = useState(false);
  const [loadingGenerar, setLoadingGenerar] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:3000/turnos')
      .then(res => res.json())
      .then(data => {
        const eventosConColor = data.map(evento => {
          if (evento.estado === 'cancelado') {
            return { ...evento, backgroundColor: '#e57373', borderColor: '#ef5350' };
          } else if (evento.estado === 'reprogramado') {
            return { ...evento, backgroundColor: '#ff9800', borderColor: '#fb8c00' };
          } else {
            return { ...evento, backgroundColor: '#3788d8', borderColor: '#3788d8' };
          }
        });
        setEventos(eventosConColor);
      })
      .catch(err => console.error('Error al obtener turnos:', err));
  }, []);

  const generarTurno = () => {
    setLoadingGenerar(true);
    fetch('http://localhost:3000/turnos/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ porcentaje: 30 })
    })
      .then(res => res.json())
      .then(data => {
        if (data.existente) {
          toast.info(`⚠️ Ya hay un turno pendiente para el ${data.fecha}`);
        } else {
          toast.success(`✅ Turno generado para el ${data.fecha}`);
          setEventos(prev => [
            ...prev,
            {
              id: data.id || Date.now(),
              title: 'Turno de llenado (pendiente)',
              start: data.fecha,
              allDay: true,
              porcentaje: 30,
              backgroundColor: '#3788d8',
              borderColor: '#3788d8'
            }
          ]);
        }
      })
      .catch(() => toast.error('❌ Error generando turno'))
      .finally(() => {
        setLoadingGenerar(false);
      });
  };

  const cancelarTurno = async () => {
    if (!eventoSeleccionado) return;
    await fetch(`http://localhost:3000/turnos/cancelar/${eventoSeleccionado.id}`, { method: 'POST' });
    toast.success('✅ Turno cancelado');
    setEventos(eventos.filter(e => e.id !== eventoSeleccionado.id));
    setModalOpen(false);
  };

  const reprogramarTurno = async () => {
    if (!eventoSeleccionado) return;
    const res = await fetch(`http://localhost:3000/turnos/reprogramar/${eventoSeleccionado.id}`, { method: 'POST' });
    const data = await res.json();
    toast.success(`🔄 Turno reprogramado para el ${data.nuevaFecha}`);
    setEventos(prev => prev.map(e =>
      e.id === eventoSeleccionado.id
        ? {
            ...e,
            start: data.nuevaFecha,
            backgroundColor: '#ff9800',
            borderColor: '#fb8c00'
          }
        : e
    ));
    setModalOpen(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      <ToastContainer position="bottom-center" autoClose={3000} />

      <Paper elevation={4} sx={{ borderRadius: 4, p: 4, backgroundColor: 'rgba(255,255,255,0.95)' }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', color: '#0288d1', mb: 3 }}>
          Calendario de Turnos
        </Typography>

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={eventos}
          height="auto"
          eventClick={(info) => {
            if (info.event.title.includes('pendiente')) {
              setEventoSeleccionado(info.event);
              setModalOpen(true);
            }
          }}
          eventClassNames={() => 'evento-interactivo'}
        />

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#3788d8' }} />
              <Typography variant="body2">Turno generado</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#ff9800' }} />
              <Typography variant="body2">Reprogramado</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#e57373' }} />
              <Typography variant="body2">Cancelado</Typography>
            </Box>
          </Box>

          {loadingGenerar ? (
            <CircularProgress size={28} />
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setConfirmarOpen(true)}
              startIcon={
                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="white">
                  <path d="M0 0h24v24H0z" fill="none"/>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 13h-2v-2H9v-2h2V9h2v2h2v2h-2v2z"/>
                </svg>
              }
              sx={{ borderRadius: '20px' }}
            >
              Generar Turno Manual
            </Button>
          )}
        </Box>
      </Paper>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Gestionar Turno</DialogTitle>
        <DialogContent>
          ¿Deseás cancelar o reprogramar el turno del <strong>{eventoSeleccionado?.startStr}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cerrar</Button>
          <Button color="error" variant="contained" onClick={cancelarTurno}>Cancelar</Button>
          <Button color="primary" variant="contained" onClick={reprogramarTurno}>Reprogramar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmarOpen} onClose={() => setConfirmarOpen(false)}>
        <DialogTitle>Confirmar Turno Manual</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que querés generar un turno manual ahora?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmarOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => {
              generarTurno();
              setConfirmarOpen(false);
            }}
            disabled={loadingGenerar}
          >
            {loadingGenerar ? <CircularProgress size={24} color="inherit" /> : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Turnos;
