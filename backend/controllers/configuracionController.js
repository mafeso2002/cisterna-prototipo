const db = require('../models/db');

exports.obtenerConfiguracion = (req, res) => {
  db.get('SELECT * FROM configuracion LIMIT 1', [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(row);
  });
};

exports.actualizarConfiguracion = (req, res) => {
  const {
    alto,
    largo,
    ancho,
    umbral_vacio,
    umbral_lleno,
    intervalo_medicion,
    frecuenciaEnvioWhatsapp,
    longitud,
    latitud,
    intervalo_horas,
    intervalo_minutos,
    intervalo_segundos
  } = req.body;

  db.run(`UPDATE configuracion 
            SET alto = ?, largo = ?, ancho = ?, umbral_vacio = ?, umbral_lleno = ?, 
                intervalo_medicion = ?, frecuenciaEnvioWhatsapp = ?, longitud = ?, latitud = ?,
                intervalo_horas = ?, intervalo_minutos = ?, intervalo_segundos = ?
            WHERE id = 1`,
    [
      alto, 
      largo, 
      ancho, 
      umbral_vacio, 
      umbral_lleno,
      intervalo_medicion,
      frecuenciaEnvioWhatsapp,
      longitud,
      latitud,
      intervalo_horas,
      intervalo_minutos,
      intervalo_segundos
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ actualizado: true });
    });
};
