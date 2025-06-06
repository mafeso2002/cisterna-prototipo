const db = require('../db');

const getReporteMensual = (req, res) => {
  const { anio, mes } = req.query;

  if (!anio || !mes) {
    return res.status(400).json({ error: 'Falta especificar el año y el mes' });
  }

  const fechaInicio = `${anio}-${mes.padStart(2, '0')}-01`;
  // Calcula último día del mes de forma dinámica
  const fechaFin = new Date(anio, parseInt(mes), 0).toISOString().split('T')[0];

  const queryMediciones = `
    SELECT 
      strftime('%Y-%m-%d', fecha) AS dia,
      AVG(porcentaje) AS promedio_diario
    FROM 
      mediciones
    WHERE 
      fecha BETWEEN ? AND ?
    GROUP BY 
      dia
    ORDER BY 
      dia
  `;

  const queryEventos = `
    SELECT 
      tipo, descripcion, consumo_estimado, timestamp
    FROM 
      eventos_consumo
    WHERE 
      timestamp BETWEEN ? AND ?
    ORDER BY 
      timestamp
  `;

  db.all(queryMediciones, [fechaInicio, fechaFin], (err, mediciones) => {
    if (err) {
      console.error('Error al obtener mediciones:', err.message);
      return res.status(500).json({ error: 'Error al obtener mediciones' });
    }

    db.all(queryEventos, [fechaInicio, fechaFin], (err, eventos) => {
      if (err) {
        console.error('Error al obtener eventos:', err.message);
        return res.status(500).json({ error: 'Error al obtener eventos' });
      }

      res.json({ mediciones, eventos });
    });
  });
};

module.exports = {
  getReporteMensual
};
