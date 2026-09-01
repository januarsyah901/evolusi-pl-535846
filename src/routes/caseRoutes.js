const express = require('express');
const { 
  getCases, 
  getCaseById, 
  getCaseStages, 
  getStageWithArticle, 
  exportCasesCsv, 
  exportCasePdf 
} = require('../controllers/caseController');

const router = express.Router();

/**
 * @swagger
 * /api/cases:
 *   get:
 *     summary: Mengambil semua daftar kasus aktif
 *     tags: [Kasus Hukum]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman data
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian judul, nomor perkara, atau deskripsi kasus
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PELAPORAN, PENYIDIKAN, PENUNTUTAN, PERSIDANGAN, PUTUSAN]
 *         description: Filter berdasarkan status hukum saat ini
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID kategori
 *     responses:
 *       200:
 *         description: Daftar kasus berhasil diambil
 */
router.get('/', getCases);

/**
 * @swagger
 * /api/cases/export/csv:
 *   get:
 *     summary: Mengekspor semua kasus ke file CSV (untuk riset)
 *     tags: [Kasus Hukum]
 *     responses:
 *       200:
 *         description: File CSV berhasil dibuat dan diunduh
 */
router.get('/export/csv', exportCasesCsv);

/**
 * @swagger
 * /api/cases/{id}:
 *   get:
 *     summary: Mengambil detail kasus lengkap beserta linimasa tahapan
 *     tags: [Kasus Hukum]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Kasus (UUID)
 *     responses:
 *       200:
 *         description: Detail kasus ditemukan
 *       404:
 *         description: Kasus tidak ditemukan
 */
router.get('/:id', getCaseById);

/**
 * @swagger
 * /api/cases/{id}/stages:
 *   get:
 *     summary: Mengambil seluruh tahapan timeline untuk satu kasus
 *     tags: [Kasus Hukum]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Kasus (UUID)
 *     responses:
 *       200:
 *         description: Daftar tahapan timeline berhasil diambil
 */
router.get('/:id/stages', getCaseStages);

/**
 * @swagger
 * /api/cases/{id}/stages/{stageId}:
 *   get:
 *     summary: Mengambil penjelasan artikel mendalam untuk satu tahapan kasus
 *     tags: [Kasus Hukum]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Kasus
 *       - in: path
 *         name: stageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Tahapan (Stage ID)
 *     responses:
 *       200:
 *         description: Detail tahapan dan artikel penjelasan berhasil diambil
 *       404:
 *         description: Tahapan tidak ditemukan
 */
router.get('/:id/stages/:stageId', getStageWithArticle);

/**
 * @swagger
 * /api/cases/{id}/export/pdf:
 *   get:
 *     summary: Mencetak laporan ringkasan detail kasus (PDF payload)
 *     tags: [Kasus Hukum]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Kasus
 *     responses:
 *       200:
 *         description: Payload cetak laporan PDF siap digunakan
 */
router.get('/:id/export/pdf', exportCasePdf);

module.exports = router;

