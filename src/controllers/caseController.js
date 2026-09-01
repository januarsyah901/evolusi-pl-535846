const prisma = require('../config/prisma');

/**
 * Get cases list with filters, search, and pagination
 */
const getCases = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status, 
      categoryId,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build filter query
    const where = {
      isActive: true,
      AND: []
    };

    if (search) {
      where.AND.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { caseNumber: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      });
    }

    if (status) {
      where.AND.push({ currentStatus: status });
    }

    if (categoryId) {
      where.AND.push({ categoryId });
    }

    // If AND is empty, clean it up
    if (where.AND.length === 0) {
      delete where.AND;
    }

    // Execute query
    const [total, cases] = await Promise.all([
      prisma.case.count({ where }),
      prisma.case.findMany({
        where,
        skip,
        take,
        include: {
          category: true,
          defendants: {
            select: { name: true, role: true }
          }
        },
        orderBy: {
          [sortBy]: order
        }
      })
    ]);

    return res.json({
      success: true,
      data: cases,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat daftar kasus.',
      error: error.message,
    });
  }
};

/**
 * Get detail of a case including timeline stages
 */
const getCaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const caseDetail = await prisma.case.findFirst({
      where: { id, isActive: true },
      include: {
        category: true,
        defendants: true,
        stages: {
          orderBy: { createdAt: 'asc' },
          include: {
            article: {
              select: {
                id: true,
                title: true,
                publishedAt: true,
              }
            }
          }
        }
      }
    });

    if (!caseDetail) {
      return res.status(404).json({
        success: false,
        message: 'Kasus tidak ditemukan atau dinonaktifkan.',
      });
    }

    return res.json({
      success: true,
      data: caseDetail,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat detail kasus.',
      error: error.message,
    });
  }
};

/**
 * Get case stages
 */
const getCaseStages = async (req, res) => {
  try {
    const { id } = req.params;

    const stages = await prisma.caseStage.findMany({
      where: { caseId: id },
      orderBy: { createdAt: 'asc' },
      include: {
        article: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    });

    return res.json({
      success: true,
      data: stages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat tahapan kasus.',
      error: error.message,
    });
  }
};

/**
 * Get detailed article explaining a stage
 */
const getStageWithArticle = async (req, res) => {
  try {
    const { id, stageId } = req.params;

    const stage = await prisma.caseStage.findFirst({
      where: { id: stageId, caseId: id },
      include: {
        article: {
          include: {
            author: {
              select: { name: true, role: true }
            }
          }
        },
        case: {
          select: { title: true, caseNumber: true }
        }
      }
    });

    if (!stage) {
      return res.status(404).json({
        success: false,
        message: 'Tahapan kasus tidak ditemukan.',
      });
    }

    return res.json({
      success: true,
      data: stage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat artikel penjelasan.',
      error: error.message,
    });
  }
};

/**
 * Export Cases as CSV for research/verification
 */
const exportCasesCsv = async (req, res) => {
  try {
    const cases = await prisma.case.findMany({
      where: { isActive: true },
      include: {
        category: true,
        defendants: true,
      }
    });

    let csvContent = 'ID,Nomor Kasus,Judul Kasus,Kategori,Status Saat Ini,Terdakwa,Tanggal Dibuat\n';
    
    cases.forEach((c) => {
      const defendantNames = c.defendants.map(d => `${d.name} (${d.role})`).join('; ');
      // Escape commas and double quotes
      const cleanTitle = `"${c.title.replace(/"/g, '""')}"`;
      const cleanCategory = `"${c.category.name.replace(/"/g, '""')}"`;
      
      csvContent += `${c.id},${c.caseNumber},${cleanTitle},${cleanCategory},${c.currentStatus},"${defendantNames}",${c.createdAt.toISOString()}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=daftar-kasus-hukum.csv');
    return res.status(200).send(csvContent);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengekspor data kasus.',
      error: error.message,
    });
  }
};

/**
 * Dummy/JSON export payload for PDF reports
 */
const exportCasePdf = async (req, res) => {
  try {
    const { id } = req.params;

    const caseData = await prisma.case.findUnique({
      where: { id },
      include: {
        category: true,
        defendants: true,
        stages: {
          orderBy: { createdAt: 'asc' },
          include: {
            article: true
          }
        }
      }
    });

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Kasus tidak ditemukan.'
      });
    }

    // In a real production setup, we can use libraries like pdfkit or puppeteer. 
    // Here we'll return a print-friendly JSON/HTML structure which the browser prints cleanly.
    return res.json({
      success: true,
      message: 'Data laporan kasus siap dicetak.',
      data: {
        case: caseData,
        generatedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat laporan PDF.',
      error: error.message,
    });
  }
};

module.exports = {
  getCases,
  getCaseById,
  getCaseStages,
  getStageWithArticle,
  exportCasesCsv,
  exportCasePdf,
};
