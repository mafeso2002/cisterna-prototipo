const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los eventos
router.get('/', (req, res) => {
  db.all('SELECT * FROM eventos_consumo ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener eventos' });
    }
    res.json(rows);
  });
});

// Crear un nuevo evento
router.post('/', (req, res) => {
  const { tipo, descripcion = '', timestamp = new Date().toISOString(), consumo_estimado = 0 } = req.body;

  if (!tipo) {
    return res.status(400).json({ error: 'Tipo es requerido' });
  }

  db.run(
    `INSERT INTO eventos_consumo (tipo, descripcion, timestamp, consumo_estimado) VALUES (?, ?, ?, ?)`,
    [tipo, descripcion, timestamp, consumo_estimado],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al insertar evento' });
      }
      res.json({ id: this.lastID, tipo, descripcion, timestamp, consumo_estimado });
    }
  );
});

module.exports = router;
