const prisma = require('../config/prisma');

/**
 * Get dashboard stats summaries
 */
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalCases,
      activeCases,
      byStatus,
      byCategory,
      recentCases
    ] = await Promise.all([
      prisma.case.count(),
      prisma.case.count({ where: { isActive: true } }),
      prisma.case.groupBy({
        by: ['currentStatus'],
        _count: {
          id: true,
        },
      }),
      prisma.category.findMany({
        include: {
          _count: {
            select: { cases: true }
          }
        }
      }),
      prisma.case.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          category: true,
        }
      })
    ]);

    // Format status stats
    const statusCounts = {
      PELAPORAN: 0,
      PENYIDIKAN: 0,
      PENUNTUTAN: 0,
      PERSIDANGAN: 0,
      PUTUSAN: 0,
    };

    byStatus.forEach(item => {
      if (statusCounts[item.currentStatus] !== undefined) {
        statusCounts[item.currentStatus] = item._count.id;
      }
    });

    // Format category stats
    const categoryCounts = byCategory.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      color: cat.color,
      count: cat._count.cases,
    }));

    return res.json({
      success: true,
      data: {
        totals: {
          cases: totalCases,
          activeCases,
        },
        byStatus: statusCounts,
        byCategory: categoryCounts,
        recentCases,
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat statistik dasbor.',
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};
