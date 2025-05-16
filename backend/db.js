const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta absoluta hacia el archivo db.sqlite, en el mismo directorio que db.js
const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al abrir la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS mediciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alturaAgua REAL,
    volumen REAL,
    porcentaje INTEGER,
    fecha TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS configuracion (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    alto INTEGER DEFAULT 250,
    largo INTEGER DEFAULT 310,
    ancho INTEGER DEFAULT 240,
    umbral_vacio INTEGER DEFAULT 20,
    umbral_lleno INTEGER DEFAULT 10
  )`);

  db.get("SELECT COUNT(*) as count FROM configuracion", (err, row) => {
    if (err) {
      console.error('Error al consultar la tabla configuracion:', err.message);
    } else if (row.count === 0) {
      db.run("INSERT INTO configuracion (id) VALUES (1)");
    }
  });
});

module.exports = db;
