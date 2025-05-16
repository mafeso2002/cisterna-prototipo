const db = require('../db');

const getReporteMensual = (req, res) => {
  const { anio, mes } = req.query;

  if (!anio || !mes) {
    return res.status(400).json({ error: 'Falta especificar el año y el mes' });
  }

  const fechaInicio = `${anio}-${mes.padStart(2, '0')}-01`;
  const fechaFin = `${anio}-${mes.padStart(2, '0')}-31`;

  const query = `
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

  db.all(query, [fechaInicio, fechaFin], (err, rows) => {
    if (err) {
      console.error('Error al obtener el reporte mensual:', err.message);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    res.json(rows);
  });
};

module.exports = {
  getReporteMensual
};
