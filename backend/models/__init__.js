const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta donde se guarda la base de datos
const dbPath = path.resolve(__dirname, '../../database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al abrir la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite');
  }
});

// Crear tabla de configuración si no existe
db.run(`
  CREATE TABLE IF NOT EXISTS configuracion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alto_cisterna REAL,
    ancho_cisterna REAL,
    centimetros_critico INTEGER,
    centimetros_lleno INTEGER,
    enviar_whatsapp INTEGER,
    latitud REAL,
    longitud REAL
  )
`);

// Crear tabla de medidas si no existe
db.run(`
  CREATE TABLE IF NOT EXISTS medidas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT,
    valor INTEGER
  )
`);

// Agregar columnas si no existen
db.serialize(() => {
  db.run(`ALTER TABLE configuracion ADD COLUMN latitud REAL`, (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('La columna latitud ya existe.');
      } else {
        console.error('Error agregando columna latitud:', err.message);
      }
    } else {
      console.log('Columna latitud agregada exitosamente.');
    }
  });

  db.run(`ALTER TABLE configuracion ADD COLUMN longitud REAL`, (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('La columna longitud ya existe.');
      } else {
        console.error('Error agregando columna longitud:', err.message);
      }
    } else {
      console.log('Columna longitud agregada exitosamente.');
    }
  });
});

module.exports = db;
