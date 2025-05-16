const express = require('express');
const router = express.Router();
const { obtenerConfiguracion, actualizarConfiguracion } = require('../models/configuracion');
const { iniciarTareaCron } = require('../controllers/cronController'); // 👈 sigue como antes

// Obtener toda la configuración
router.get('/', async (req, res) => {
  try {
    const config = await obtenerConfiguracion();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la configuración' });
  }
});

// Actualizar toda la configuración
router.post('/', async (req, res) => {
  try {
    const resultado = await actualizarConfiguracion(req.body);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la configuración' });
  }
});

// Obtener solo el intervalo de medición (Actualizado aquí 👇)
router.get('/intervalo', async (req, res) => {
  try {
    const config = await obtenerConfiguracion();
    res.json({
      horas: config.intervalo_horas || 0,
      minutos: config.intervalo_minutos || 0,
      segundos: config.intervalo_segundos || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el intervalo' });
  }
});

// Obtener solo la frecuencia de envío de WhatsApp
router.get('/frecuencia', async (req, res) => {
  try {
    const config = await obtenerConfiguracion();
    res.json({ frecuenciaEnvioWhatsapp: config.frecuenciaEnvioWhatsapp });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la frecuencia de envío' });
  }
});

// Actualizar solo la frecuencia de envío de WhatsApp y reiniciar cron
router.put('/frecuencia', async (req, res) => {
  try {
    const { frecuenciaEnvioWhatsapp } = req.body;

    if (!frecuenciaEnvioWhatsapp || isNaN(frecuenciaEnvioWhatsapp)) {
      return res.status(400).json({ error: 'frecuenciaEnvioWhatsapp debe ser un número válido.' });
    }

    const configActual = await obtenerConfiguracion();

    const nuevaConfig = {
      ...configActual,
      frecuenciaEnvioWhatsapp: frecuenciaEnvioWhatsapp
    };

    const resultado = await actualizarConfiguracion(nuevaConfig);

    // Reiniciar cron después de actualizar la frecuencia
    await iniciarTareaCron();

    res.json({ mensaje: 'Frecuencia actualizada y tarea reiniciada correctamente.' });

  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la frecuencia de envío' });
  }
});

module.exports = router;
