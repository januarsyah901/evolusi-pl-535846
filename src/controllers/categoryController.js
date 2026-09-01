const prisma = require('../config/prisma');

/**
 * Get all categories
 */
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil kategori.',
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
};
