const express = require('express');
const router = express.Router();
const db = require('../db');

// Crear tabla de empresas si no existe
db.run(`
  CREATE TABLE IF NOT EXISTS empresas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
  )
`);

// Obtener todas las empresas
router.get('/', (req, res) => {
  db.all('SELECT * FROM empresas ORDER BY nombre ASC', [], (err, rows) => {
    if (err) {
      console.error('Error al obtener empresas:', err.message);
      return res.status(500).json({ error: 'Error al obtener empresas.' });
    }
    res.json(rows);
  });
});

// Crear una nueva empresa
router.post('/', (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio.' });
  }

  db.run('INSERT INTO empresas (nombre) VALUES (?)', [nombre], function (err) {
    if (err) {
      console.error('Error al insertar empresa:', err.message);
      return res.status(500).json({ error: 'Error al insertar empresa.' });
    }
    res.status(201).json({ id: this.lastID, nombre });
  });
});

// Actualizar empresa existente
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio.' });
  }

  db.run('UPDATE empresas SET nombre = ? WHERE id = ?', [nombre, id], function (err) {
    if (err) {
      console.error('Error al actualizar empresa:', err.message);
      return res.status(500).json({ error: 'Error al actualizar empresa.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Empresa no encontrada.' });
    }
    res.json({ mensaje: 'Empresa actualizada correctamente.' });
  });
});

// Eliminar empresa
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM empresas WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Error al eliminar empresa:', err.message);
      return res.status(500).json({ error: 'Error al eliminar empresa.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Empresa no encontrada.' });
    }
    res.json({ mensaje: 'Empresa eliminada correctamente.' });
  });
});

module.exports = router;
