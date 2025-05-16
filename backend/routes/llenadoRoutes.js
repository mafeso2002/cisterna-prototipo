const express = require('express');
const router = express.Router();
const db = require('../db'); // conexión a la base de datos

// Insertar un nuevo llenado
router.post('/', (req, res) => {
  const { fecha, empresa, volumen, observaciones } = req.body;

  if (!fecha || !empresa) {
    return res.status(400).json({ error: 'Fecha y Empresa son obligatorios.' });
  }

  db.run(
    `INSERT INTO llenados (fecha, empresa, volumen, observaciones) VALUES (?, ?, ?, ?)`,
    [fecha, empresa, volumen || null, observaciones || null],
    function(err) {
      if (err) {
        console.error('Error al insertar llenado:', err.message);
        return res.status(500).json({ error: 'Error al insertar llenado.' });
      }
      res.json({ mensaje: 'Llenado registrado correctamente.', id: this.lastID });
    }
  );
});

// Obtener todos los llenados
router.get('/', (req, res) => {
    db.all('SELECT * FROM llenados ORDER BY fecha DESC', [], (err, rows) => {
      if (err) {
        console.error('Error al obtener llenados:', err.message);
        return res.status(500).json({ error: 'Error al obtener los llenados.' });
      }
      res.json(rows);
    });
  });

  router.get('/ultimo', (req, res) => {
    db.get('SELECT * FROM llenados ORDER BY fecha DESC LIMIT 1', [], (err, row) => {
      if (err) {
        console.error('Error al obtener último llenado:', err.message);
        return res.status(500).json({ error: 'Error al obtener el último llenado.' });
      }
      if (!row) {
        return res.json(null);
      }
      res.json(row);
    });
  });

// Actualizar un llenado existente
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { fecha, empresa, volumen, observaciones } = req.body;

  if (!fecha || !empresa) {
    return res.status(400).json({ error: 'Fecha y Empresa son obligatorios.' });
  }

  const sql = `
    UPDATE llenados
    SET fecha = ?, empresa = ?, volumen = ?, observaciones = ?
    WHERE id = ?
  `;
  const params = [fecha, empresa, volumen || null, observaciones || null, id];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Error al actualizar llenado:', err.message);
      return res.status(500).json({ error: 'Error al actualizar el llenado.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'No se encontró el llenado.' });
    }
    res.json({ mensaje: 'Llenado actualizado correctamente.' });
  });
});


module.exports = router;
