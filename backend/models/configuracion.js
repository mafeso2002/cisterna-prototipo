const db = require('../db');

// Obtener toda la configuración
exports.obtenerConfiguracion = () => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM configuracion LIMIT 1', [], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Actualizar toda la configuración
exports.actualizarConfiguracion = (data) => {
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
    intervalo_segundos,
    umbral_turno // ✅ nuevo campo
  } = data;

  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE configuracion 
       SET alto = ?, 
           largo = ?, 
           ancho = ?, 
           umbral_vacio = ?, 
           umbral_lleno = ?, 
           intervalo_medicion = ?, 
           frecuenciaEnvioWhatsapp = ?,            
           longitud = ?,
           latitud = ?,
           intervalo_horas = ?,
           intervalo_minutos = ?,
           intervalo_segundos = ?,
           umbral_turno = ? -- ✅ agregado aquí
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
        intervalo_segundos,
        umbral_turno // ✅ agregado aquí
      ],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ mensaje: 'Configuración actualizada correctamente.' });
        }
      }
    );
  });
};
