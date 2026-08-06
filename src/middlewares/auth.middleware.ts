export {};

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/index');

function authenticate() {
  return async (ctx, next) => {
    const header = ctx.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      ctx.throw(401, 'Authorization token required');
    }
    const token = header.split(' ')[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      ctx.state.user = payload;
      await next();
    } catch (err) {
      ctx.throw(401, 'Invalid or expired token');
    }
  };
}

function authorize(...allowedRoles) {
  return async (ctx, next) => {
    const roles = allowedRoles.flat();
    const user = ctx.state.user;
    if (!user) {
      ctx.throw(401, 'Unauthorized');
    }
    if (roles.length === 0 || roles.includes(user.role)) {
      return await next();
    }
    ctx.throw(403, 'Forbidden: insufficient permissions');
  };
}

module.exports = { authenticate, authorize };
