const jwt = require('jsonwebtoken');
require('dotenv').config();

const signAccessToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
const signRefreshToken = (payload) => jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' });

module.exports = { signAccessToken, signRefreshToken };
