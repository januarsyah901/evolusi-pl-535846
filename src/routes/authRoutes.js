const express = require('express');
const { register, login, refresh, getMe } = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrasi kontributor publik baru
 *     tags: [Autentikasi]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Januar
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jan@hallojanu.xyz
 *               password:
 *                 type: string
 *                 format: password
 *                 example: rahasia123
 *     responses:
 *       201:
 *         description: Registrasi berhasil
 *       400:
 *         description: Email sudah terdaftar atau input tidak valid
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login pengguna atau admin
 *     tags: [Autentikasi]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jan@hallojanu.xyz
 *               password:
 *                 type: string
 *                 format: password
 *                 example: rahasia123
 *     responses:
 *       200:
 *         description: Login berhasil, mengembalikan token JWT
 *       400:
 *         description: Kredensial tidak cocok
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Memperbarui token akses (Access Token) yang kedaluwarsa
 *     tags: [Autentikasi]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token berhasil diperbarui
 *       401:
 *         description: Refresh token tidak valid
 */
router.post('/refresh', refresh);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Mengambil profil pengguna yang sedang login
 *     tags: [Autentikasi]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil pengguna berhasil diambil
 *       401:
 *         description: Token tidak valid atau tidak disertakan
 */
router.get('/me', authenticate, getMe);

module.exports = router;

