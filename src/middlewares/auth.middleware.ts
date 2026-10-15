export {};

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/index');
const { ensureAccountCanLogin } = require('../modules/auth/auth.service');

function authenticate() {
  return async (ctx, next) => {
    const header = ctx.headers.authorization;
    if (!header || !/^Bearer\s+/i.test(header)) {
      ctx.throw(401, 'Authorization token required');
    }
    const token = header.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      ctx.throw(401, 'Authorization token required');
    }
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      ctx.throw(401, 'Invalid or expired token');
    }
    await ensureAccountCanLogin(payload);
    ctx.state.user = payload;
    await next();
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
