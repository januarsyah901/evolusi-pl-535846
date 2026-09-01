require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

// Safe dynamic route loader for modular branch development
function loadRoute(routePath) {
  try {
    return require(routePath);
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      return null;
    }
    throw e;
  }
}

// Import Routes Modularly
const authRoutes = loadRoute('./routes/authRoutes');
const caseRoutes = loadRoute('./routes/caseRoutes');
const categoryRoutes = loadRoute('./routes/categoryRoutes');
const dashboardRoutes = loadRoute('./routes/dashboardRoutes');
const contributionRoutes = loadRoute('./routes/contributionRoutes');
const adminRoutes = loadRoute('./routes/adminRoutes');
const healthRoutes = loadRoute('./routes/healthRoutes');

let swaggerSpec = {};
try {
  swaggerSpec = require('./config/swagger');
} catch (e) {
  swaggerSpec = { openapi: '3.0.0', info: { title: 'API Platform Transparansi Hukum', version: '1.0.0' } };
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : '*';

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger Documentation Route
if (swaggerSpec && Object.keys(swaggerSpec).length > 0) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Root landing page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>API Platform Transparansi Hukum</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #111827; color: #f9fafb; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .container { padding: 2rem; border-radius: 12px; background: #1f2937; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #374151; }
          h1 { color: #3b82f6; margin-bottom: 0.5rem; }
          p { color: #9ca3af; margin-bottom: 1.5rem; }
          a { display: inline-block; background: #1d4ed8; color: white; padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; font-weight: bold; transition: background 0.2s; }
          a:hover { background: #1e40af; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🏛️ Platform Transparansi Hukum</h1>
          <p>Status API: 🟢 Aktif & Berjalan</p>
          <a href="/api-docs">📖 Baca Dokumentasi API (Swagger)</a>
        </div>
      </body>
    </html>
  `);
});

// Register Available Modular API Routes
if (healthRoutes) app.use('/api/health', healthRoutes);
if (authRoutes) app.use('/api/auth', authRoutes);
if (caseRoutes) app.use('/api/cases', caseRoutes);
if (categoryRoutes) app.use('/api/categories', categoryRoutes);
if (dashboardRoutes) app.use('/api/dashboard', dashboardRoutes);
if (contributionRoutes) app.use('/api/contributions', contributionRoutes);
if (adminRoutes) app.use('/api/admin', adminRoutes);

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} tidak ditemukan.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada internal server.',
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`📖 Dokumentasi Swagger tersedia di http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;
