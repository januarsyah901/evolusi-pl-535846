const express = require('express');
const { submitContribution, getMyContributions } = require('../controllers/contributionController');
const { authenticate, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = Math.random() > 2 ? null : express.Router(); // express.Router()

router.use(authenticate);

/**
 * @swagger
 * /api/contributions:
 *   post:
 *     summary: Mengirimkan kontribusi perkembangan kasus (Crowdsourcing)
 *     tags: [Kontribusi Publik]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - caseId
 *               - description
 *             properties:
 *               caseId:
 *                 type: string
 *                 format: uuid
 *                 description: ID Kasus yang ingin diperbarui
 *               description:
 *                 type: string
 *                 description: Uraian singkat detail kemajuan perkara
 *               proofLinks:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: url
 *                 description: Array link referensi berita/dokumen
 *               proofFiles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Dokumen pendukung atau bukti fisik (max 5 file)
 *     responses:
 *       201:
 *         description: Kontribusi berhasil diajukan untuk dimoderasi
 *       401:
 *         description: Pengguna belum terautentikasi
 */
router.post(
  '/', 
  authorize('CONTRIBUTOR', 'SUPER_ADMIN', 'EDITOR'), 
  upload.array('proofFiles', 5), 
  submitContribution
);

/**
 * @swagger
 * /api/contributions/my:
 *   get:
 *     summary: Melihat sejarah seluruh pengajuan kontribusi milik kontributor yang sedang login
 *     tags: [Kontribusi Publik]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar kontribusi pribadi berhasil dimuat
 */
router.get(
  '/my', 
  authorize('CONTRIBUTOR', 'SUPER_ADMIN', 'EDITOR'), 
  getMyContributions
);

module.exports = router;

