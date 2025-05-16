const db = require('../models/db');

exports.listarMediciones = (req, res) => {
   console.log('✅ Entre en el medicioncontrollll');
  db.all('SELECT * FROM mediciones ORDER BY fecha DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};
