const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Cek status kesehatan sistem API
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Layanan API beroperasi normal
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'UP',
    message: 'Layanan API Platform Transparansi Hukum beroperasi dengan normal',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

/**
 * @swagger
 * /api/health/ping:
 *   get:
 *     summary: Ping endpoint sederhana
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Pong
 */
router.get('/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'pong',
    timestamp: Date.now()
  });
});

module.exports = router;
