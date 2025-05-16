const express = require('express');
const router = express.Router();
const db = require('../db');
const gestorTurnos = require('../utils/gestorTurnos');

// Obtener todos los turnos
router.get('/', (req, res) => {
  db.all('SELECT * FROM turnos_llenado ORDER BY fecha_turno ASC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Error al obtener los turnos' });
    } else {
      const eventos = rows.map(turno => {
        let color = {};
        if (turno.estado === 'reprogramado') {
          color = {
            backgroundColor: '#ff9800',
            borderColor: '#fb8c00'
          };
        }
        return {
          id: turno.id,
          title: `Turno de llenado (${turno.estado})`,
          start: turno.fecha_turno,
          allDay: true,
          porcentaje: turno.nivel_porcentaje,
          ...color
        };
      });
      res.json(eventos);
    }
  });
});


// Crear turno manualmente
router.post('/crear', (req, res) => {
  const porcentaje = req.body.porcentaje || 0;

  gestorTurnos.crearTurnoAutomatico(porcentaje, (err, fechaTurno, yaExistia) => {
    if (err) {
      return res.status(500).json({ error: 'No se pudo generar el turno' });
    }

    if (yaExistia) {
      return res.status(200).json({
        message: `Ya existe un turno pendiente para el ${fechaTurno}`,
        fecha: fechaTurno,
        existente: true
      });
    }

    db.run('UPDATE configuracion SET turno_generado = 1 WHERE id = 1');
    res.status(200).json({ message: 'Turno generado', fecha: fechaTurno, existente: false });
  });
});

// Obtener próximo turno pendiente
router.get('/pendiente', (req, res) => {
  db.get("SELECT * FROM turnos_llenado WHERE estado = 'pendiente' ORDER BY fecha_turno ASC LIMIT 1", [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error al buscar turno pendiente' });
    }
    if (!row) {
      return res.status(200).json({ pendiente: false });
    }
    res.status(200).json({
      pendiente: true,
      fecha: row.fecha_turno,
      porcentaje: row.nivel_porcentaje
    });
  });
});

// Cancelar turno por ID
router.post('/cancelar/:id', (req, res) => {
  const id = req.params.id;

  db.run('UPDATE turnos_llenado SET estado = "cancelado" WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Error al cancelar el turno' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    db.run('UPDATE configuracion SET turno_generado = 0 WHERE id = 1');
    res.status(200).json({ message: 'Turno cancelado exitosamente' });
  });
});

// Reprogramar turno
router.post('/reprogramar/:id', (req, res) => {
  const id = req.params.id;

  gestorTurnos.buscarProximaFechaDisponible((err, nuevaFecha) => {
    if (err) return res.status(500).json({ error: 'Error buscando nueva fecha' });

    db.run(
      'UPDATE turnos_llenado SET fecha_turno = ?, estado = "reprogramado" WHERE id = ?',
      [nuevaFecha, id],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Error al reprogramar el turno' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Turno no encontrado' });
        }
        res.status(200).json({ message: 'Turno reprogramado', nuevaFecha });
      }
    );
  });
});


module.exports = router;
