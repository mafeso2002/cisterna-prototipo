require('dotenv').config(); // <--- esta línea
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const configRoutes = require('./routes/configRoutes');
const medidaRoutes = require('./routes/medidaRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const llenadoRoutes = require('./routes/llenadoRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const turnoRoutes = require('./routes/turnoRoutes');
const iaRoutes = require('./routes/iaRoutes');
const eventosRoutes = require('./routes/eventosRoutes');
const empresaRoutes = require('./routes/empresaRoutes');
const path = require('path');
const { iniciarTareaCron } = require('./controllers/cronController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/config', configRoutes);
app.use('/api/medidas', medidaRoutes);
app.use('/api/reporte', reporteRoutes);
app.use('/api/llenados', llenadoRoutes);
app.use('/api', deviceRoutes);
app.use('/turnos', turnoRoutes);
app.use('/api', iaRoutes);
app.use('/eventos', eventosRoutes);
app.use('/api/empresas', empresaRoutes);


// ✅ Cambio acá:
app.get('/', (req, res) => {
  res.send('Backend funcionando correctamente 🚀');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});

iniciarTareaCron();
