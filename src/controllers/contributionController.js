const { z } = require('zod');
const prisma = require('../config/prisma');

const contributionSchema = z.object({
  caseId: z.string().uuid('ID Kasus tidak valid'),
  description: z.string().min(10, 'Uraian progress minimal 10 karakter'),
  proofLinks: z.array(z.string().url('Format tautan tidak valid')).optional().default([]),
});

const parseJsonSafely = (val) => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch (e) {
      return [];
    }
  }
  return val || [];
};

const verifySchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().optional(),
});

/**
 * Contributor submits a new case status/progress contribution
 */
const submitContribution = async (req, res) => {
  try {
    const parsed = contributionSchema.parse(req.body);

    const caseExists = await prisma.case.findUnique({
      where: { id: parsed.caseId },
    });

    if (!caseExists) {
      return res.status(404).json({
        success: false,
        message: 'Kasus tidak ditemukan.',
      });
    }

    // Process files if uploaded via multer (mocking/extracting files array)
    const proofFiles = req.files ? req.files.map(file => ({
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path || '', // path to disk or Cloudinary url
    })) : [];

    const contribution = await prisma.caseContribution.create({
      data: {
        caseId: parsed.caseId,
        userId: req.user.id,
        description: parsed.description,
        proofLinks: JSON.stringify(parsed.proofLinks),
        proofFiles: JSON.stringify(proofFiles),
        status: 'PENDING',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Kontribusi berhasil diajukan. Menunggu moderasi admin.',
      data: contribution,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validasi gagal.',
        errors: error.errors,
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Gagal mengajukan kontribusi.',
      error: error.message,
    });
  }
};

/**
 * Contributor gets their own contributions history
 */
const getMyContributions = async (req, res) => {
  try {
    const contributions = await prisma.caseContribution.findMany({
      where: { userId: req.user.id },
      include: {
        case: {
          select: { title: true, caseNumber: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Parse JSON strings back
    const formatted = contributions.map(c => ({
      ...c,
      proofLinks: parseJsonSafely(c.proofLinks),
      proofFiles: parseJsonSafely(c.proofFiles),
    }));

    return res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat kontribusi Anda.',
      error: error.message,
    });
  }
};

/**
 * Admin gets list of all pending contributions for moderating
 */
const getPendingContributions = async (req, res) => {
  try {
    const contributions = await prisma.caseContribution.findMany({
      where: { status: 'PENDING' },
      include: {
        case: {
          select: { title: true, caseNumber: true, currentStatus: true }
        },
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = contributions.map(c => ({
      ...c,
      proofLinks: parseJsonSafely(c.proofLinks),
      proofFiles: parseJsonSafely(c.proofFiles),
    }));

    return res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat antrean moderasi.',
      error: error.message,
    });
  }
};

/**
 * Admin approves or rejects a contribution
 */
const verifyContribution = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = verifySchema.parse(req.body);

    const contribution = await prisma.caseContribution.findUnique({
      where: { id },
      include: { case: true }
    });

    if (!contribution) {
      return res.status(404).json({
        success: false,
        message: 'Kontribusi tidak ditemukan.',
      });
    }

    if (contribution.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Kontribusi ini sudah dimoderasi sebelumnya.',
      });
    }

    const updated = await prisma.caseContribution.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        reviewedById: req.user.id,
      },
    });

    // Write audit activity log
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: `VERIFY_CONTRIBUTION_${status}`,
        entity: 'CaseContribution',
        entityId: id,
        metadata: {
          caseId: contribution.caseId,
          status,
          rejectionReason,
        }
      }
    });

    return res.json({
      success: true,
      message: `Kontribusi berhasil di-${status.toLowerCase()}.`,
      data: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validasi gagal.',
        errors: error.errors,
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Gagal melakukan verifikasi kontribusi.',
      error: error.message,
    });
  }
};

module.exports = {
  submitContribution,
  getMyContributions,
  getPendingContributions,
  verifyContribution,
};
