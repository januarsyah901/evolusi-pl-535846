const prisma = require('../config/prisma');

/**
 * Middleware to log admin activities
 * @param {string} action - Describe the action (e.g. "CREATE_CASE")
 * @param {string} entity - Name of target table/model (e.g. "Case")
 */
const logActivity = (action, entity) => {
  return async (req, res, next) => {
    // Intercept res.send or res.json to log only on success
    const originalJson = res.json;

    res.json = function (body) {
      res.json = originalJson; // restore original

      // Only log on successful operations
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const entityId = req.params.id || body?.data?.id || null;

        // Log asynchronously in background so as not to block client response
        prisma.activityLog.create({
          data: {
            userId: req.user.id,
            action,
            entity,
            entityId,
            metadata: {
              method: req.method,
              url: req.originalUrl,
              body: req.method !== 'GET' ? req.body : undefined,
              ip: req.ip,
            },
          },
        }).catch(err => {
          console.error('Failed to write activity log:', err);
        });
      }

      return res.json(body);
    };

    next();
  };
};

module.exports = logActivity;
