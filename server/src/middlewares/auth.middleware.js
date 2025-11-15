const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: 'Authorization header missing' });
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.currentUser = { id: user.id, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const authorize = (roles = []) => {
  if (typeof roles === 'string') roles = [roles];
  return (req, res, next) => {
    if (!req.currentUser) return res.status(401).json({ message: 'Unauthorized' });
    if (roles.length && !roles.includes(req.currentUser.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
};

module.exports = { authenticate, authorize };
