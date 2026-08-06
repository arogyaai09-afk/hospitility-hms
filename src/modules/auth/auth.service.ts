export {};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./auth.model');
const { JWT_SECRET, JWT_EXPIRES, REFRESH_EXPIRES } = require('../../../config/index');

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function createAccessToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, tenantId: user.tenantId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, tenantId: user.tenantId },
    JWT_SECRET,
    { expiresIn: REFRESH_EXPIRES }
  );
}

async function registerUser(payload) {
  const existing = await User.findOne({ email: payload.email });
  if (existing) {
    const err = new Error('Email already exists');
    err.status = 409;
    throw err;
  }
  const password = await hashPassword(payload.password);
  const user = await User.create({ ...payload, password });
  return user;
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const valid = await comparePassword(password, user.password);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();
  return { user, accessToken, refreshToken };
}

async function refreshTokens(refreshToken) {
  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== refreshToken) {
      const err = new Error('Invalid refresh token');
      err.status = 401;
      throw err;
    }
    const accessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);
    user.refreshToken = newRefreshToken;
    await user.save();
    return { accessToken, refreshToken: newRefreshToken };
  } catch (err) {
    const error = new Error('Invalid refresh token');
    error.status = 401;
    throw error;
  }
}

module.exports = {
  registerUser,
  loginUser,
  refreshTokens
};
