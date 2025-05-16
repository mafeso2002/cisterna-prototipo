// routes/reporteRoutes.js
const express = require('express');
const router = express.Router();
const { getReporteMensual } = require('../controllers/reporteController');

router.get('/mensual', getReporteMensual);

module.exports = router;
