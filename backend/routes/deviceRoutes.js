const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener el deviceId por MAC
router.get('/device-id', (req, res) => {
  const mac = req.query.mac;

  if (!mac) {
    return res.status(400).json({ error: 'MAC address requerida' });
  }

  db.get('SELECT id FROM cisternas WHERE mac = ?', [mac], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error en base de datos' });
    }

    if (row) {
      res.json({ deviceId: row.id });
    } else {
      res.json({ deviceId: null });
    }
  });
});

// Registrar nueva cisterna
router.post('/cisternas', (req, res) => {
  const { id, mac, descripcion } = req.body;

  if (!id || !mac) {
    return res.status(400).json({ error: 'id y mac son obligatorios' });
  }

  const query = `
    INSERT INTO cisternas (id, mac, descripcion)
    VALUES (?, ?, ?)
  `;

  db.run(query, [id, mac, descripcion || null], function (err) {
    if (err) {
      console.error('❌ Error al insertar cisterna:', err.message);
      return res.status(500).json({ error: 'No se pudo registrar la cisterna' });
    }

    res.status(201).json({ success: true, id });
  });
});

// GET /api/cisternas
router.get('/cisternas', (req, res) => {
  db.all('SELECT * FROM cisternas ORDER BY id', [], (err, rows) => {
    if (err) {
      console.error('❌ Error al obtener cisternas:', err.message);
      return res.status(500).json({ error: 'Error al obtener cisternas' });
    }

    res.json(rows);
  });
});

// PUT /api/cisternas/:id/ip
router.put('/cisternas/:id/ip', (req, res) => {
  const { id } = req.params;
  const { ip } = req.body;

  if (!ip) {
    return res.status(400).json({ error: 'IP es requerida' });
  }

  const query = `
    UPDATE cisternas SET ultima_ip = ? WHERE id = ?
  `;

  db.run(query, [ip, id], function (err) {
    if (err) {
      console.error('❌ Error al actualizar IP:', err.message);
      return res.status(500).json({ error: 'No se pudo actualizar la IP' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Cisterna no encontrada' });
    }

    res.json({ success: true, id, ip });
  });
});

// POST /api/cisternas/descubrir
router.post('/cisternas/descubrir', (req, res) => {
  const { mac, ip } = req.body;

  if (!mac || !ip) {
    return res.status(400).json({ error: 'MAC e IP son requeridas' });
  }

  db.get('SELECT id FROM cisternas WHERE mac = ?', [mac], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });

    if (row) {
      // Si ya existe, actualiza IP y actividad
      db.run('UPDATE cisternas SET ultima_ip = ?, ultima_actividad = CURRENT_TIMESTAMP WHERE mac = ?', [ip, mac]);
      return res.json({ deviceId: row.id });
    }

    // Si no existe, generar nuevo ID incremental
    db.get('SELECT id FROM cisternas ORDER BY id DESC LIMIT 1', [], (err, lastRow) => {
      let nextNumber = 1;
      if (lastRow && lastRow.id) {
        const match = lastRow.id.match(/cisterna(\d+)/);
        if (match) nextNumber = parseInt(match[1]) + 1;
      }

      const newId = `cisterna${String(nextNumber).padStart(3, '0')}`;

      db.run(
        'INSERT INTO cisternas (id, mac, ultima_ip, descripcion, ultima_actividad) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [newId, mac, ip, 'Sin registrar'],
        (err) => {
          if (err) return res.status(500).json({ error: 'No se pudo registrar' });
          res.json({ deviceId: newId });
        }
      );
    });
  });
});

// GET /api/cisternas/estado
router.get('/cisternas/estado', (req, res) => {
  db.all('SELECT id, ultima_actividad FROM cisternas', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });

    const now = new Date();
    const result = rows.map(c => {
      let online = false;

      if (c.ultima_actividad) {
        const ultima = new Date(c.ultima_actividad);
        const diffMin = (now - ultima) / (1000 * 60);
        online = diffMin <= 10;
      }

      return {
        id: c.id,
        online
      };
    });

    res.json(result);
  });
});

// POST /api/medidas/:deviceId (versión corregida)
/*router.post('/medidas/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const { distancia } = req.body;

  if (!distancia || isNaN(distancia)) {
    return res.status(400).json({ error: 'Distancia inválida' });
  }

  db.get('SELECT * FROM configuracion WHERE id = 1', (err, config) => {
    if (err || !config) {
      return res.status(500).json({ error: 'Error al obtener configuración' });
    }

    const alto = config.alto;
    const largo = config.largo;
    const ancho = config.ancho;
    const umbral_lleno = config.umbral_lleno;

    const alturaAgua = Math.max(0, alto - distancia);
    const alturaUtil = alto - umbral_lleno;
    const volumen = (alturaAgua * largo * ancho) / 1000; // en litros
    const porcentaje = Math.round((alturaAgua / alturaUtil) * 100);
    const fecha = new Date().toISOString();

    const query = `
      INSERT INTO mediciones (alturaAgua, volumen, porcentaje, fecha)
      VALUES (?, ?, ?, ?)
    `;

    db.run(query, [alturaAgua, volumen, porcentaje, fecha], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al guardar medición' });
      }

      // ✅ actualizar actividad
      db.run('UPDATE cisternas SET ultima_actividad = CURRENT_TIMESTAMP WHERE id = ?', [deviceId]);
      res.json({ success: true });
    });
  });
});*/


// POST /api/medidas/:deviceId (con lógica de generación de turno y logs)
/*router.post('/medidas/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const { distancia } = req.body;

  console.log('✅ Recibida distancia desde dispositivo:', distancia);

  if (!distancia || isNaN(distancia)) {
    return res.status(400).json({ error: 'Distancia inválida' });
  }

  db.get('SELECT * FROM configuracion WHERE id = 1', (err, config) => {
    if (err || !config) {
      console.error('❌ Error al obtener configuración:', err?.message);
      return res.status(500).json({ error: 'Error al obtener configuración' });
    }

    const { alto, largo, ancho, umbral_lleno, umbral_turno, turno_generado } = config;

    const alturaAgua = Math.max(0, alto - distancia);
    const alturaUtil = alto - umbral_lleno;
    const volumen = (alturaAgua * largo * ancho) / 1000; // litros
    const porcentaje = Math.round((alturaAgua / alturaUtil) * 100);
    const fecha = new Date().toISOString();

    const insertSql = `
      INSERT INTO mediciones (alturaAgua, volumen, porcentaje, fecha, id_dispositivo)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(insertSql, [alturaAgua, volumen, porcentaje, fecha, deviceId], (err) => {
      if (err) {
        console.error('❌ Error al guardar medición:', err.message);
        return res.status(500).json({ error: 'Error al guardar medición' });
      }

      console.log('💾 Medición guardada');

      db.run('UPDATE cisternas SET ultima_actividad = CURRENT_TIMESTAMP WHERE id = ?', [deviceId]);

      // 🔁 Reset turno si se llenó
      if (porcentaje >= umbral_lleno && turno_generado === 1) {
        db.run('UPDATE configuracion SET turno_generado = 0 WHERE id = 1', (err) => {
          if (err) console.error('❌ Error reseteando turno_generado:', err.message);
          else console.log('🔁 turno_generado reseteado');
        });
      }

      // 📅 Verificar si hay que generar turno
      if (porcentaje <= umbral_turno && turno_generado === 0) {
        console.log(`📅 Evaluando generación de turno: %${porcentaje} <= %${umbral_turno}`);

        const gestorTurnos = require('../utils/gestorTurnos');
        gestorTurnos.crearTurnoAutomatico(porcentaje, (err, fechaTurno, yaExistia) => {
          if (err) {
            console.error('❌ Error al generar turno:', err.message);
          } else if (yaExistia) {
            console.log('⚠️ Ya existía un turno pendiente. No se genera otro.');
          } else {
            console.log('✅ Turno generado automáticamente para:', fechaTurno);
            db.run('UPDATE configuracion SET turno_generado = 1 WHERE id = 1');
          }
        });
      }

      // Respuesta inmediata
      res.json({ success: true, porcentaje, volumen, alturaAgua, fecha });
    });
  });
}); */

// POST /api/medidas/:deviceId (con tolerancia de variación menor al 2%)
router.post('/medidas/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const { distancia } = req.body;

  console.log('✅ Recibida distancia desde dispositivo:', distancia);

  if (!distancia || isNaN(distancia)) {
    return res.status(400).json({ error: 'Distancia inválida' });
  }

  db.get('SELECT * FROM configuracion WHERE id = 1', (err, config) => {
    if (err || !config) {
      console.error('❌ Error al obtener configuración:', err?.message);
      return res.status(500).json({ error: 'Error al obtener configuración' });
    }

    const { alto, largo, ancho, umbral_lleno, umbral_turno, turno_generado } = config;

    const alturaAgua = Math.max(0, alto - distancia);
    const alturaUtil = alto - umbral_lleno;
    const volumen = (alturaAgua * largo * ancho) / 1000; // litros
    let porcentaje = Math.round((alturaAgua / alturaUtil) * 100);
    const fecha = new Date().toISOString();

    // Verificar última medición
    db.get(
      'SELECT * FROM mediciones WHERE id_dispositivo = ? ORDER BY fecha DESC LIMIT 1',
      [deviceId],
      (err, ultimaMedicion) => {
        if (err) {
          console.error('❌ Error consultando última medición:', err.message);
          return res.status(500).json({ error: 'Error consultando última medición' });
        }

        let usarUltima = false;

        if (ultimaMedicion && Math.abs(ultimaMedicion.porcentaje - porcentaje) <= 2) {
          console.log(`⚠️ Variación de porcentaje (${porcentaje}%) dentro del umbral respecto a última (${ultimaMedicion.porcentaje}%). Se descarta.`);
          porcentaje = ultimaMedicion.porcentaje;
          usarUltima = true;
        }

        const insertSql = `
          INSERT INTO mediciones (alturaAgua, volumen, porcentaje, fecha, id_dispositivo)
          VALUES (?, ?, ?, ?, ?)
        `;

        db.run(insertSql, [alturaAgua, volumen, porcentaje, fecha, deviceId], (err) => {
          if (err) {
            console.error('❌ Error al guardar medición:', err.message);
            return res.status(500).json({ error: 'Error al guardar medición' });
          }

          console.log('💾 Medición guardada', usarUltima ? '(valor anterior usado)' : '');

          db.run('UPDATE cisternas SET ultima_actividad = CURRENT_TIMESTAMP WHERE id = ?', [deviceId]);

          if (porcentaje >= umbral_lleno && turno_generado === 1) {
            db.run('UPDATE configuracion SET turno_generado = 0 WHERE id = 1', (err) => {
              if (err) console.error('❌ Error reseteando turno_generado:', err.message);
              else console.log('🔁 turno_generado reseteado');
            });
          }

          if (porcentaje <= umbral_turno && turno_generado === 0) {
            console.log(`📅 Evaluando generación de turno: %${porcentaje} <= %${umbral_turno}`);

            const gestorTurnos = require('../utils/gestorTurnos');
            gestorTurnos.crearTurnoAutomatico(porcentaje, (err, fechaTurno, yaExistia) => {
              if (err) {
                console.error('❌ Error al generar turno:', err.message);
              } else if (yaExistia) {
                console.log('⚠️ Ya existía un turno pendiente. No se genera otro.');
              } else {
                console.log('✅ Turno generado automáticamente para:', fechaTurno);
                db.run('UPDATE configuracion SET turno_generado = 1 WHERE id = 1');
              }
            });
          }

          res.json({ success: true, porcentaje, volumen, alturaAgua, fecha, usarUltima });
        });
      }
    );
  });
});



module.exports = router;
