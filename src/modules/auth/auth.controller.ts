export {};

const User = require('./auth.model');
const { registerUser, loginUser, refreshTokens } = require('./auth.service');
const { success } = require('../../utils/response');

async function register(ctx) {
  const payload = ctx.request.body;
  const user = await registerUser(payload);
  ctx.status = 201;
  ctx.body = success({ id: user._id, email: user.email, role: user.role, tenantId: user.tenantId }, 'User created');
}

async function login(ctx) {
  const { email, password } = ctx.request.body;
  const { user, accessToken, refreshToken } = await loginUser({ email, password });
  ctx.body = success({ user: { id: user._id, email: user.email, role: user.role, tenantId: user.tenantId }, accessToken, refreshToken }, 'Login successful');
}

async function refresh(ctx) {
  const { refreshToken } = ctx.request.body;
  const tokens = await refreshTokens(refreshToken);
  ctx.body = success(tokens, 'Token refreshed');
}

async function profile(ctx) {
  const user = await User.findById(ctx.state.user.id).select('-password -refreshToken');
  ctx.body = success(user);
}

module.exports = { register, login, refresh, profile };
