const db = require('../db');
const axios = require('axios');

let tareaIntervalo = null;
let frecuenciaAnterior = null;

const WHATSAPP_NUMBER = '+5492616157904';
const API_KEY = '9952933';

// Función para formatear fecha
function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${anio} ${horas}:${minutos} hs`;
}

// Función para obtener la última medición
function obtenerUltimaMedicion() {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM mediciones ORDER BY fecha DESC LIMIT 1', (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Función para enviar WhatsApp
async function enviarMensajeWhatsApp(mensaje) {
  const url = `https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(mensaje)}&apikey=${API_KEY}`;
  await axios.get(url);
}

// Función para enviar estado de cisterna
async function revisarCisternaYNotificar() {
  try {
    const ultimaMedicion = await obtenerUltimaMedicion();
    if (!ultimaMedicion || ultimaMedicion.porcentaje == null) {
      console.log('No hay mediciones válidas registradas.');
      return;
    }

    const fechaFormateada = formatearFecha(ultimaMedicion.fecha);
    const porcentaje = ultimaMedicion.porcentaje;

    let estado = '';
    if (porcentaje >= 70) {
      estado = '✅ Nivel alto. Todo OK.';
    } else if (porcentaje >= 30) {
      estado = '⚠️ Nivel medio. Vigilar.';
    } else {
      estado = '🚨 Nivel bajo. Urgente recargar.';
    }

    const mensaje =
      `🔔 Estado actual de la cisterna:\n` +
      `📅 Fecha: ${fechaFormateada}\n` +
      `💧 Nivel: ${porcentaje}%\n` +
      `${estado}`;

    await enviarMensajeWhatsApp(mensaje);
    console.log('✅ Mensaje enviado por WhatsApp.');
  } catch (error) {
    console.error('❌ Error en revisión automática:', error);
  }
}

// Obtener frecuencia actual de la base de datos
function obtenerFrecuenciaEnvio() {
  return new Promise((resolve, reject) => {
    db.get('SELECT frecuenciaEnvioWhatsapp FROM configuracion WHERE id = 1', (err, row) => {
      if (err) reject(err);
      else if (row && row.frecuenciaEnvioWhatsapp) resolve(parseInt(row.frecuenciaEnvioWhatsapp));
      else resolve(120); // Default en caso de error o nulo
    });
  });
}

// Iniciar o reiniciar la tarea con nueva frecuencia
async function iniciarTareaCron() {
  const frecuenciaMinutos = await obtenerFrecuenciaEnvio();
  if (frecuenciaMinutos === frecuenciaAnterior) {
    return; // No cambió, no hace falta reiniciar
  }

  frecuenciaAnterior = frecuenciaMinutos;

  if (tareaIntervalo) {
    console.log('♻️ Cancelando tarea anterior...');
    clearInterval(tareaIntervalo);
  }

  console.log(`🕒 Iniciando tarea cada ${frecuenciaMinutos} minutos.`);

  const milisegundos = frecuenciaMinutos * 60 * 1000;
  tareaIntervalo = setInterval(() => {
    console.log('⏰ Ejecutando revisión programada de cisterna...');
    revisarCisternaYNotificar();
  }, milisegundos);
}

// Monitor de cambios de frecuencia cada 1 minuto
function iniciarMonitorFrecuencia() {
  setInterval(async () => {
    try {
      await iniciarTareaCron();
    } catch (err) {
      console.error('❌ Error verificando frecuencia:', err);
    }
  }, 60000); // Verifica cada 60 segundos
}

module.exports = {
  iniciarTareaCron,
  iniciarMonitorFrecuencia
};
