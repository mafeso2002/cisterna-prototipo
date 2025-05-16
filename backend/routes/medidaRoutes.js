const express = require('express');
const router = express.Router();
const db = require('../db');
const axios = require('axios');
const gestorTurnos = require('../utils/gestorTurnos');

// Obtener todas las mediciones ordenadas por fecha descendente
router.get('/', (req, res) => {
  
  db.all('SELECT * FROM mediciones ORDER BY fecha DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Error al obtener las mediciones' });
    } else {
      res.json(rows);
    }
  });
});



// Obtener la última medición
router.get('/ultima', (req, res) => {
  db.get('SELECT * FROM mediciones ORDER BY fecha DESC LIMIT 1', (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Error al obtener la última medición' });
    } else if (!row) {
      res.status(404).json({ error: 'No hay mediciones registradas' });
    } else {
      res.json({
        porcentaje: row.porcentaje,
        fecha: row.fecha
      });
    }
  });
});

// Forzar medición instantánea en NodeMCU
router.post('/forzar', async (req, res) => {
  try {
    const NODEMCU_IP = 'http://192.168.1.46';
    const response = await axios.post(`${NODEMCU_IP}/medir`);
    console.log('✅ Medición instantánea solicitada al NodeMCU');

    res.status(200).json({ message: 'Medición instantánea solicitada al NodeMCU' });
  } catch (error) {
    console.error('❌ Error enviando medición instantánea al NodeMCU:', error.message);
    res.status(500).json({ error: 'Error enviando orden de medición al NodeMCU' });
  }
});

module.exports = router;
