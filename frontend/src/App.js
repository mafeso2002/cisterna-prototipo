import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Mediciones from './pages/Mediciones';
import Configuracion from './pages/Configuracion';
import Reporte from './pages/Reporte';
import HistorialLlenados from './pages/HistorialLlenados';
import Ubicacion from './pages/Ubicacion'; // 👉 Nueva importación
import Cisternas from './pages/Cisternas';
import Turnos from './pages/Turnos';
import Asistente from './pages/Asistente';
import Eventos from './pages/Eventos';
import { Box } from '@mui/material';
import { ToastContainer } from 'react-toastify'; // 👈 Importar Toastify
import 'react-toastify/dist/ReactToastify.css'; // 👈 Estilos de Toastify
import Empresas from './pages/Empresas';



const App = () => {
  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url(/imagenAgua.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mediciones" element={<Mediciones />} />
            <Route path="/configuracion" element={<Configuracion />} />
            <Route path="/reporte" element={<Reporte />} />
            <Route path="/historial-llenados" element={<HistorialLlenados />} />
            <Route path="/ubicacion" element={<Ubicacion />} /> {/* 👉 Nueva ruta agregada */}
            <Route path="/cisternas" element={<Cisternas />} />
            <Route path="/turnos" element={<Turnos />} />
            <Route path="/asistente" element={<Asistente />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/empresas" element={<Empresas />} />
          </Routes>
        </Box>
      </Box>

      {/* 👇 Agregamos el contenedor de Toastify fuera de todo */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Router>
  );
};

export default App;
