const express = require('express');
const router = express.Router();
const db = require('../db');
const axios = require('axios');

// Ruta: POST /api/ia/preguntar
router.post('/ia/preguntar', async (req, res) => {
  const { pregunta } = req.body;
  const COHERE_API_KEY = process.env.COHERE_API_KEY;

  if (!pregunta || !COHERE_API_KEY) {
    return res.status(400).json({ error: 'Falta la pregunta o la API key de Cohere' });
  }

  // Paso 1: Obtener configuración
  db.get('SELECT * FROM configuracion WHERE id = 1', (err, config) => {
    if (err || !config) {
      return res.status(500).json({ error: 'Error al obtener configuración' });
    }

    // Paso 2: Obtener últimas mediciones
    db.all('SELECT fecha, porcentaje FROM mediciones ORDER BY fecha DESC LIMIT 30', async (err, mediciones) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener mediciones' });
      }

      // Paso 3: Armar contexto
      const contexto = `
Tenés una cisterna que se llena con agua. Te paso la configuración del sistema y las últimas mediciones registradas. En base a eso, respondé a la siguiente pregunta del usuario como si fueras un asistente inteligente de monitoreo de cisternas.

CONFIGURACIÓN:
- Alto: ${config.alto} cm
- Largo: ${config.largo} cm
- Ancho: ${config.ancho} cm
- Umbral de llenado: ${config.umbral_lleno}%
- Umbral para turno: ${config.umbral_turno}%

ÚLTIMAS MEDICIONES:
${mediciones.map(m => `• ${m.fecha}: ${m.porcentaje}%`).join('\n')}

PREGUNTA DEL USUARIO:
"${pregunta}"
`;

      try {
        const response = await axios.post(
          'https://api.cohere.ai/v1/generate',
          {
            model: 'command',
            prompt: contexto,
            max_tokens: 300,
            temperature: 0.7
          },
          {
            headers: {
              'Authorization': `Bearer ${COHERE_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const mensajeIA = response.data.generations[0].text;
        res.json({ respuesta: mensajeIA });
      } catch (error) {
        console.error('❌ Error al llamar a Cohere:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error con el servicio de IA' });
      }
    });
  });
});

router.post('/ia/prediccion-vaciado', async (req, res) => {
  const COHERE_API_KEY = process.env.COHERE_API_KEY;

  if (!COHERE_API_KEY) {
    return res.status(400).json({ error: 'Falta la API key de Cohere' });
  }

  db.get('SELECT * FROM configuracion WHERE id = 1', (err, config) => {
    if (err || !config) {
      return res.status(500).json({ error: 'Error al obtener configuración' });
    }

    db.all('SELECT fecha, porcentaje FROM mediciones ORDER BY fecha DESC LIMIT 30', async (err, mediciones) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener mediciones' });
      }

      const contexto = `
Tenés una cisterna con las siguientes características:
- Alto: ${config.alto} cm
- Largo: ${config.largo} cm
- Ancho: ${config.ancho} cm

Estas son las últimas 30 mediciones de porcentaje de agua:

${mediciones.map(m => `• ${m.fecha}: ${m.porcentaje}%`).join('\n')}

En base a esa tendencia de consumo, estimá cuántos días faltan para que la cisterna llegue al 0%. Si ya está subiendo o estable, explicalo también.
`;

      try {
        const response = await axios.post(
          'https://api.cohere.ai/v1/generate',
          {
            model: 'command',
            prompt: contexto,
            max_tokens: 300,
            temperature: 0.7
          },
          {
            headers: {
              'Authorization': `Bearer ${COHERE_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const respuesta = response.data.generations[0].text.replace(/\\n/g, '\n');
        res.json({ respuesta });
      } catch (error) {
        console.error('Error al llamar a Cohere:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error con el servicio de IA' });
      }
    });
  });
});


module.exports = router;
