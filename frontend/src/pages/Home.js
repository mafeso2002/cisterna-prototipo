import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import ModalRegistrarLlenado from '../components/ModalRegistrarLlenado';

const Home = () => {
  const [porcentaje, setPorcentaje] = useState(null);
  const [fechaUltimaMedicion, setFechaUltimaMedicion] = useState('');
  const [ultimoLlenado, setUltimoLlenado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [turnoPendiente, setTurnoPendiente] = useState(null);

  const fetchUltimaMedicion = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/medidas/ultima');
      if (response.data && response.data.porcentaje !== undefined) {
        setPorcentaje(response.data.porcentaje);
        if (response.data.fecha) {
          setFechaUltimaMedicion(response.data.fecha);
        }
      } else {
        setPorcentaje(0);
      }
    } catch (error) {
      console.error('Error al obtener la última medición:', error);
      setPorcentaje(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchUltimoLlenado = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/llenados/ultimo');
      setUltimoLlenado(response.data);
    } catch (error) {
      console.error('Error al obtener último llenado:', error);
    }
  };

  const fetchTurnoPendiente = async () => {
    try {
      const res = await axios.get('http://localhost:3000/turnos/pendiente');
      if (res.data && res.data.pendiente) {
        setTurnoPendiente(res.data);
      }
    } catch (err) {
      console.error('Error al obtener turno pendiente:', err);
    }
  };

  useEffect(() => {
    fetchUltimaMedicion();
    fetchUltimoLlenado();
    fetchTurnoPendiente();
  }, []);

  const getColorAgua = (nivel) => {
    if (nivel >= 50) {
      return 'linear-gradient(to top, #4fc3f7, #81d4fa)';
    } else if (nivel >= 30) {
      return 'linear-gradient(to top, #ffeb3b, #fff176)';
    } else {
      return 'linear-gradient(to top, #f44336, #e57373)';
    }
  };

  return (
    <Box sx={{ textAlign: 'center', mt: 5, px: 2 }}>
      {turnoPendiente && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
            mx: 'auto',
            maxWidth: 600,
            backgroundColor: '#e1f5fe',
            borderLeft: '6px solid #0288d1',
            textAlign: 'left'
          }}
        >
          🚚 Hay un turno de llenado pendiente para el{' '}
          <strong>{new Date(turnoPendiente.fecha).toLocaleString('es-AR')}</strong>{' '}
          (nivel registrado: {turnoPendiente.porcentaje}%)
        </Alert>
      )}

      <Typography variant="h4" gutterBottom sx={{ color: '#0288d1', fontWeight: 'bold' }}>
        Estado Actual de la Cisterna
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        Visualización del nivel de agua en tiempo real.
      </Typography>

      <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 10 }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <Box sx={{ position: 'relative', width: 200, height: 400 }}>
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: '6px solid black',
                borderRadius: '20px',
                backgroundColor: '#ffffff',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: `${porcentaje}%`,
                  background: getColorAgua(porcentaje),
                  borderBottomLeftRadius: '20px',
                  borderBottomRightRadius: '20px',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 5%, transparent 10%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.3) 5%, transparent 10%)',
                    backgroundSize: '50px 50px',
                    animation: 'moverBurbujas 6s infinite linear',
                  }}
                />
              </Box>
            </Box>

            <Typography
              variant="h5"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontWeight: 'bold',
                color: porcentaje > 30 ? '#01579b' : 'red',
                zIndex: 2,
              }}
            >
              {porcentaje}%
            </Typography>
          </Box>
        )}

        {!loading && (
          <Box sx={{ height: 400, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', pt: 1, pb: 1 }}>
            {[100, 75, 50, 25, 0].map((mark) => (
              <Typography key={mark} variant="body2" sx={{ color: '#0288d1', fontWeight: 'bold' }}>
                {mark}%
              </Typography>
            ))}
          </Box>
        )}
      </Box>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 4 }}
        onClick={() => setModalOpen(true)}
      >
        Registrar Llenado
      </Button>

      <ModalRegistrarLlenado open={modalOpen} handleClose={() => setModalOpen(false)} />

      {!loading && fechaUltimaMedicion && (
        <Typography variant="body2" sx={{ mt: 2, color: 'gray' }}>
          Última medición: {new Date(fechaUltimaMedicion).toLocaleString('es-AR')}
        </Typography>
      )}

      {!loading && (
        <Typography variant="body2" sx={{ mt: 1, color: 'gray' }}>
          {ultimoLlenado ? (
            <>Último llenado: {new Date(ultimoLlenado.fecha).toLocaleString('es-AR')}</>
          ) : (
            <>Sin registros de llenado aún.</>
          )}
        </Typography>
      )}
    </Box>
  );
};

export default Home;
