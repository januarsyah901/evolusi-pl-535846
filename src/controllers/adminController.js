const { z } = require('zod');
const prisma = require('../config/prisma');

// Validation Schemas
const caseSchema = z.object({
  caseNumber: z.string().min(1, 'Nomor perkara wajib diisi'),
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  categoryId: z.string().uuid('Kategori ID wajib valid'),
  currentStatus: z.enum(['PELAPORAN', 'PENYIDIKAN', 'PENUNTUTAN', 'PERSIDANGAN', 'PUTUSAN']).default('PELAPORAN'),
  defendants: z.array(z.object({
    name: z.string().min(2, 'Nama terdakwa minimal 2 karakter'),
    role: z.string().min(2, 'Peran/Hubungan terdakwa wajib diisi'),
    description: z.string().optional(),
  })).optional().default([]),
});

const stageSchema = z.object({
  stageType: z.enum(['PELAPORAN', 'PENYIDIKAN', 'PENUNTUTAN', 'PERSIDANGAN', 'PUTUSAN']),
  status: z.enum(['PENDING', 'AKTIF', 'SELESAI']).default('PENDING'),
  startedAt: z.string().transform(str => new Date(str)).optional(),
  endedAt: z.string().transform(str => new Date(str)).optional().nullable(),
});

const articleSchema = z.object({
  title: z.string().min(5, 'Judul artikel minimal 5 karakter'),
  content: z.string().min(20, 'Konten artikel penjelasan minimal 20 karakter'),
  stageId: z.string().uuid('Stage ID wajib valid'),
  attachments: z.array(z.any()).optional().default([]),
});

/** ==========================================
 *  CASES MANAGEMENT (CRUD)
 *  ========================================== */

const createCase = async (req, res) => {
  try {
    const data = caseSchema.parse(req.body);

    const caseExists = await prisma.case.findUnique({
      where: { caseNumber: data.caseNumber }
    });

    if (caseExists) {
      return res.status(400).json({
        success: false,
        message: 'Nomor perkara sudah terdaftar.',
      });
    }

    // Create case + defendants + first stage in transaction
    const newCase = await prisma.$transaction(async (tx) => {
      const createdCase = await tx.case.create({
        data: {
          caseNumber: data.caseNumber,
          title: data.title,
          description: data.description,
          categoryId: data.categoryId,
          currentStatus: data.currentStatus,
          defendants: {
            create: data.defendants
          }
        },
        include: {
          defendants: true,
          category: true,
        }
      });

      // Automatically seed the first stage based on initial status
      await tx.caseStage.create({
        data: {
          caseId: createdCase.id,
          stageType: data.currentStatus,
          status: 'AKTIF',
          createdById: req.user.id,
        }
      });

      return createdCase;
    });

    return res.status(201).json({
      success: true,
      message: 'Kasus baru berhasil dibuat beserta tahapan awal.',
      data: newCase,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    return res.status(500).json({ success: false, message: 'Gagal membuat kasus.', error: error.message });
  }
};

const updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const data = caseSchema.parse(req.body);

    const checkCase = await prisma.case.findUnique({ where: { id } });
    if (!checkCase) {
      return res.status(404).json({ success: false, message: 'Kasus tidak ditemukan.' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Delete old defendants and write new ones
      await tx.defendant.deleteMany({ where: { caseId: id } });

      return await tx.case.update({
        where: { id },
        data: {
          caseNumber: data.caseNumber,
          title: data.title,
          description: data.description,
          categoryId: data.categoryId,
          currentStatus: data.currentStatus,
          defendants: {
            create: data.defendants
          }
        },
        include: { defendants: true, category: true }
      });
    });

    return res.json({
      success: true,
      message: 'Kasus berhasil diperbarui.',
      data: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    return res.status(500).json({ success: false, message: 'Gagal memperbarui kasus.', error: error.message });
  }
};

const deleteCase = async (req, res) => {
  try {
    const { id } = req.params;

    const checkCase = await prisma.case.findUnique({ where: { id } });
    if (!checkCase) {
      return res.status(404).json({ success: false, message: 'Kasus tidak ditemukan.' });
    }

    // Soft delete
    await prisma.case.update({
      where: { id },
      data: { isActive: false }
    });

    return res.json({
      success: true,
      message: 'Kasus berhasil dinonaktifkan (soft delete).',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menonaktifkan kasus.', error: error.message });
  }
};

/** ==========================================
 *  STAGES MANAGEMENT
 *  ========================================== */

const createStage = async (req, res) => {
  try {
    const { id } = req.params; // caseId
    const data = stageSchema.parse(req.body);

    const checkCase = await prisma.case.findUnique({ where: { id } });
    if (!checkCase) {
      return res.status(404).json({ success: false, message: 'Kasus tidak ditemukan.' });
    }

    const newStage = await prisma.caseStage.create({
      data: {
        caseId: id,
        stageType: data.stageType,
        status: data.status,
        startedAt: data.startedAt || new Date(),
        endedAt: data.endedAt,
        createdById: req.user.id,
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Tahapan kasus baru berhasil ditambahkan.',
      data: newStage,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    return res.status(500).json({ success: false, message: 'Gagal menambah tahapan kasus.', error: error.message });
  }
};

const updateStage = async (req, res) => {
  try {
    const { id } = req.params; // stageId
    const data = stageSchema.parse(req.body);

    const checkStage = await prisma.caseStage.findUnique({ where: { id } });
    if (!checkStage) {
      return res.status(404).json({ success: false, message: 'Tahapan tidak ditemukan.' });
    }

    const updated = await prisma.caseStage.update({
      where: { id },
      data: {
        stageType: data.stageType,
        status: data.status,
        startedAt: data.startedAt,
        endedAt: data.endedAt,
      }
    });

    return res.json({
      success: true,
      message: 'Tahapan kasus berhasil diperbarui.',
      data: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    return res.status(500).json({ success: false, message: 'Gagal memperbarui tahapan.', error: error.message });
  }
};

const deleteStage = async (req, res) => {
  try {
    const { id } = req.params; // stageId

    const checkStage = await prisma.caseStage.findUnique({ where: { id } });
    if (!checkStage) {
      return res.status(404).json({ success: false, message: 'Tahapan tidak ditemukan.' });
    }

    await prisma.caseStage.delete({ where: { id } });

    return res.json({
      success: true,
      message: 'Tahapan kasus berhasil dihapus.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus tahapan.', error: error.message });
  }
};

/** ==========================================
 *  ARTICLES MANAGEMENT
 *  ========================================== */

const createArticle = async (req, res) => {
  try {
    const data = articleSchema.parse(req.body);

    const checkStage = await prisma.caseStage.findUnique({
      where: { id: data.stageId },
      include: { article: true }
    });

    if (!checkStage) {
      return res.status(404).json({ success: false, message: 'Tahapan kasus tidak ditemukan.' });
    }

    if (checkStage.article) {
      return res.status(400).json({
        success: false,
        message: 'Tahapan kasus ini sudah memiliki artikel penjelasan. Silakan perbarui artikel yang ada.',
      });
    }

    const article = await prisma.article.create({
      data: {
        title: data.title,
        content: data.content,
        stageId: data.stageId,
        authorId: req.user.id,
        attachments: JSON.stringify(data.attachments),
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Artikel penjelasan berhasil dibuat.',
      data: article,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    return res.status(500).json({ success: false, message: 'Gagal membuat artikel.', error: error.message });
  }
};

const updateArticle = async (req, res) => {
  try {
    const { id } = req.params; // articleId
    const data = articleSchema.parse(req.body);

    const checkArticle = await prisma.article.findUnique({ where: { id } });
    if (!checkArticle) {
      return res.status(404).json({ success: false, message: 'Artikel tidak ditemukan.' });
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        stageId: data.stageId,
        attachments: JSON.stringify(data.attachments),
      }
    });

    return res.json({
      success: true,
      message: 'Artikel penjelasan berhasil diperbarui.',
      data: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    return res.status(500).json({ success: false, message: 'Gagal memperbarui artikel.', error: error.message });
  }
};

const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const checkArticle = await prisma.article.findUnique({ where: { id } });
    if (!checkArticle) {
      return res.status(404).json({ success: false, message: 'Artikel tidak ditemukan.' });
    }

    await prisma.article.delete({ where: { id } });

    return res.json({
      success: true,
      message: 'Artikel penjelasan berhasil dihapus.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus artikel.', error: error.message });
  }
};

/** ==========================================
 *  USER & LOG AUDITS
 *  ========================================== */

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    return res.json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil pengguna.', error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = z.object({
      role: z.enum(['SUPER_ADMIN', 'EDITOR', 'VIEWER', 'CONTRIBUTOR'])
    }).parse(req.body);

    const checkUser = await prisma.user.findUnique({ where: { id } });
    if (!checkUser) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    });

    return res.json({
      success: true,
      message: 'Role pengguna berhasil diperbarui.',
      data: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    return res.status(500).json({ success: false, message: 'Gagal mengubah role.', error: error.message });
  }
};

const getActivityLogs = async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      }
    });

    return res.json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil log aktivitas.', error: error.message });
  }
};

module.exports = {
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
};
