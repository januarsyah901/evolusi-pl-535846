const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const logActivity = require('../middlewares/activityLogger');
const { getPendingContributions, verifyContribution } = require('../controllers/contributionController');
const {
  createCase,
  updateCase,
  deleteCase,
  createStage,
  updateStage,
  deleteStage,
  createArticle,
  updateArticle,
  deleteArticle,
  getUsers,
  updateUserRole,
  getActivityLogs,
} = require('../controllers/adminController');

const router = express.Router();

// Require authenticating for all admin routes and check for admin/editor status
router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'EDITOR'));

/**
 * @swagger
 * /api/admin/contributions:
 *   get:
 *     summary: Mengambil semua pengajuan kontribusi publik dengan status PENDING
 *     tags: [Admin & Moderasi]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil memuat daftar kontribusi pending
 */
router.get('/contributions', getPendingContributions);

/**
 * @swagger
 * /api/admin/contributions/{id}/verify:
 *   put:
 *     summary: Memoderasi pengajuan kontribusi publik (Setuju / Tolak)
 *     tags: [Admin & Moderasi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Kontribusi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *               rejectionReason:
 *                 type: string
 *                 description: Wajib diisi jika status REJECTED
 *     responses:
 *       200:
 *         description: Kontribusi berhasil di-update statusnya
 */
router.put('/contributions/:id/verify', verifyContribution);

/**
 * @swagger
 * /api/admin/cases:
 *   post:
 *     summary: Membuat kasus hukum baru
 *     tags: [Admin - Kasus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - caseNumber
 *               - title
 *               - description
 *               - categoryId
 *             properties:
 *               caseNumber:
 *                 type: string
 *                 example: "123/Pid.B/2026/PN.Jkt"
 *               title:
 *                 type: string
 *                 example: "Dugaan Tindak Pidana Korupsi Pengadaan Barang"
 *               description:
 *                 type: string
 *                 example: "Kasus korupsi bernilai miliaran rupiah..."
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               currentStatus:
 *                 type: string
 *                 enum: [PELAPORAN, PENYIDIKAN, PENUNTUTAN, PERSIDANGAN, PUTUSAN]
 *                 default: PELAPORAN
 *               defendants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - role
 *                   properties:
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                     description:
 *                       type: string
 *     responses:
 *       201:
 *         description: Kasus berhasil dibuat
 */
router.post('/cases', logActivity('CREATE_CASE', 'Case'), createCase);

/**
 * @swagger
 * /api/admin/cases/{id}:
 *   put:
 *     summary: Memperbarui data kasus hukum
 *     tags: [Admin - Kasus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Case'
 *     responses:
 *       200:
 *         description: Kasus berhasil diperbarui
 */
router.put('/cases/:id', logActivity('UPDATE_CASE', 'Case'), updateCase);

/**
 * @swagger
 * /api/admin/cases/{id}:
 *   delete:
 *     summary: Menonaktifkan kasus (soft delete)
 *     tags: [Admin - Kasus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kasus berhasil dinonaktifkan
 */
router.delete('/cases/:id', logActivity('DELETE_CASE', 'Case'), deleteCase);

/**
 * @swagger
 * /api/admin/cases/{id}/stages:
 *   post:
 *     summary: Menambah tahapan baru ke dalam timeline kasus
 *     tags: [Admin - Tahapan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Kasus
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stageType
 *             properties:
 *               stageType:
 *                 type: string
 *                 enum: [PELAPORAN, PENYIDIKAN, PENUNTUTAN, PERSIDANGAN, PUTUSAN]
 *               status:
 *                 type: string
 *                 enum: [PENDING, AKTIF, SELESAI]
 *               startedAt:
 *                 type: string
 *                 format: date-time
 *               endedAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Tahapan baru berhasil dibuat
 */
router.post('/cases/:id/stages', logActivity('CREATE_STAGE', 'CaseStage'), createStage);

/**
 * @swagger
 * /api/admin/stages/{id}:
 *   put:
 *     summary: Mengedit rincian tahapan timeline kasus
 *     tags: [Admin - Tahapan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Tahapan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stageType:
 *                 type: string
 *                 enum: [PELAPORAN, PENYIDIKAN, PENUNTUTAN, PERSIDANGAN, PUTUSAN]
 *               status:
 *                 type: string
 *                 enum: [PENDING, AKTIF, SELESAI]
 *     responses:
 *       200:
 *         description: Tahapan berhasil diperbarui
 */
router.put('/stages/:id', logActivity('UPDATE_STAGE', 'CaseStage'), updateStage);

/**
 * @swagger
 * /api/admin/stages/{id}:
 *   delete:
 *     summary: Menghapus tahapan timeline kasus
 *     tags: [Admin - Tahapan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tahapan berhasil dihapus
 */
router.delete('/stages/:id', logActivity('DELETE_STAGE', 'CaseStage'), deleteStage);

/**
 * @swagger
 * /api/admin/articles:
 *   post:
 *     summary: Membuat artikel penjelasan hukum untuk suatu tahapan kasus
 *     tags: [Admin - Artikel]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - stageId
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               stageId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Artikel berhasil dipublikasikan
 */
router.post('/articles', logActivity('CREATE_ARTICLE', 'Article'), createArticle);

/**
 * @swagger
 * /api/admin/articles/{id}:
 *   put:
 *     summary: Memperbarui artikel penjelasan hukum
 *     tags: [Admin - Artikel]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Article'
 *     responses:
 *       200:
 *         description: Artikel berhasil diperbarui
 */
router.put('/articles/:id', logActivity('UPDATE_ARTICLE', 'Article'), updateArticle);

/**
 * @swagger
 * /api/admin/articles/{id}:
 *   delete:
 *     summary: Menghapus artikel penjelasan hukum
 *     tags: [Admin - Artikel]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Artikel berhasil dihapus
 */
router.delete('/articles/:id', logActivity('DELETE_ARTICLE', 'Article'), deleteArticle);

/**
 * @swagger
 * /api/admin/activity-logs:
 *   get:
 *     summary: Mengambil semua daftar log aktivitas audit admin
 *     tags: [Admin - Logs & Audits]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil memuat log aktivitas
 */
router.get('/activity-logs', getActivityLogs);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Mengambil daftar seluruh pengguna terdaftar (SUPER_ADMIN only)
 *     tags: [Admin - Pengguna]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil memuat daftar user
 */
router.get('/users', authorize('SUPER_ADMIN'), getUsers);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Mengubah tingkatan/role pengguna (SUPER_ADMIN only)
 *     tags: [Admin - Pengguna]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [SUPER_ADMIN, EDITOR, VIEWER, CONTRIBUTOR]
 *     responses:
 *       200:
 *         description: Role berhasil diubah
 */
router.put('/users/:id/role', authorize('SUPER_ADMIN'), logActivity('UPDATE_USER_ROLE', 'User'), updateUserRole);

module.exports = router;

