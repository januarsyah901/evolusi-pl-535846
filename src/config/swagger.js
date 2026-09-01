const swaggerJSDoc = require('swagger-jsdoc');

const PORT = process.env.PORT || 5000;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🏛️ API Platform Transparansi Hukum',
      version: '1.0.0',
      description: 'Dokumentasi API lengkap untuk Platform Transparansi Hukum (pelacakan kasus hukum publik & kontribusi crowdsourced).',
      contact: {
        name: 'Januar',
        url: 'https://hallojanu.xyz',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Server Lokal (Development)',
      },
      {
        url: 'https://kasus.hallojanu.xyz',
        description: 'Server Caprover (Production)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Masukkan JWT token di header Authorization dengan format: Bearer <JWT_TOKEN>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['SUPER_ADMIN', 'EDITOR', 'VIEWER', 'CONTRIBUTOR'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Case: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            caseNumber: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            categoryId: { type: 'string', format: 'uuid' },
            currentStatus: { type: 'string', enum: ['PELAPORAN', 'PENYIDIKAN', 'PENUNTUTAN', 'PERSIDANGAN', 'PUTUSAN'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Defendant: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            caseId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            role: { type: 'string' },
            description: { type: 'string' },
          },
        },
        CaseStage: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            caseId: { type: 'string', format: 'uuid' },
            stageType: { type: 'string', enum: ['PELAPORAN', 'PENYIDIKAN', 'PENUNTUTAN', 'PERSIDANGAN', 'PUTUSAN'] },
            status: { type: 'string', enum: ['PENDING', 'AKTIF', 'SELESAI'] },
            startedAt: { type: 'string', format: 'date-time' },
            endedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        Article: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            content: { type: 'string' },
            stageId: { type: 'string', format: 'uuid' },
            publishedAt: { type: 'string', format: 'date-time' },
            authorId: { type: 'string', format: 'uuid' },
            attachments: { type: 'array', items: { type: 'string' } },
          },
        },
        Contribution: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            caseId: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
            proofLinks: { type: 'array', items: { type: 'string' } },
            proofFiles: { type: 'array', items: { type: 'object' } },
            rejectionReason: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/index.js'], // Files containing annotations
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
