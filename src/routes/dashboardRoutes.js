const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Mengambil ringkasan statistik untuk grafik dasbor visual publik
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Statistik berhasil dihitung dan diambil
 */
router.get('/stats', getDashboardStats);

module.exports = router;

