const db = require('../db');

// Busca la primera fecha libre desde hoy que no tenga ya un turno generado
function buscarProximaFechaDisponible(callback) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  function revisar(dia) {
    const fechaStr = dia.toISOString().split('T')[0]; // solo yyyy-mm-dd
    db.get('SELECT * FROM turnos_llenado WHERE fecha_turno = ?', [fechaStr], (err, row) => {
      if (err) return callback(err);

      if (!row) {
        callback(null, fechaStr);
      } else {
        const siguiente = new Date(dia);
        siguiente.setDate(siguiente.getDate() + 1);
        revisar(siguiente);
      }
    });
  }

  revisar(hoy);
}

function crearTurnoAutomatico(porcentaje, callback) {
  // Verificamos si ya hay un turno pendiente
  db.get("SELECT * FROM turnos_llenado WHERE estado = 'pendiente' ORDER BY fecha_turno ASC LIMIT 1", [], (err, row) => {
    if (err) return callback(err);

    if (row) {
      return callback(null, row.fecha_turno, true); // ya existe
    }

    buscarProximaFechaDisponible((err, fechaDisponible) => {
      if (err) return callback(err);

      const ahora = new Date().toISOString();
      db.run(
        'INSERT INTO turnos_llenado (fecha_creacion, fecha_turno, estado, nivel_porcentaje) VALUES (?, ?, ?, ?)',
        [ahora, fechaDisponible, 'pendiente', porcentaje],
        function (err) {
          if (err) return callback(err);
          callback(null, fechaDisponible, false); // creado nuevo
        }
      );
    });
  });
}


module.exports = {
  buscarProximaFechaDisponible,
  crearTurnoAutomatico
};
