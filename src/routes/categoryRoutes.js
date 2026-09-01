const express = require('express');
const { getCategories } = require('../controllers/categoryController');

const router = express.Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Mengambil semua daftar kategori kasus
 *     tags: [Kategori]
 *     responses:
 *       200:
 *         description: Daftar kategori berhasil diambil
 */
router.get('/', getCategories);

module.exports = router;

