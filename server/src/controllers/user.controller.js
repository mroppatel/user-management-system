const { User } = require('../models');
const { Op } = require('sequelize');
const redisClient = require('../config/redis');

exports.getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(100, parseInt(req.query.limit || '10'));
    const q = req.query.q || '';
    const offset = (page - 1) * limit;
    // const cacheKey = `users:${page}:${limit}:${q}`;

    // try { await redisClient.connect(); } catch (e) {}
    // const cached = await redisClient.get(cacheKey);
    // if (cached) return res.json(JSON.parse(cached));

    const where = q ? { [Op.or]: [{ name: { [Op.like]: `%${q}%` } }, { email: { [Op.like]: `%${q}%` } }] } : {};

    const { count, rows } = await User.findAndCountAll({ where, limit, offset, order: [['id','DESC']], attributes: ['id','email','name','role','isVerified','profileImage','createdAt'] });

    const result = { users: rows, total: count, page, limit };
    // await redisClient.set(cacheKey, JSON.stringify(result), { EX: 30 });
    res.json(result);
  } catch (err) { next(err); }
};

exports.getUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const user = await User.findByPk(id, { attributes: ['id','email','name','role','isVerified','profileImage'] });
    if (!user) return res.status(404).json({ message: 'Not found' });
    if (req.currentUser.id !== id && req.currentUser.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    res.json(user);
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (req.currentUser.id !== id && req.currentUser.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    const { name } = req.body;
    user.name = name || user.name;
    if (req.file) user.profileImage = `/uploads/${req.file.filename}`;
    await user.save();
    res.json({ message: 'Profile updated', user: { id: user.id, email: user.email, name: user.name, profileImage: user.profileImage } });
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    await user.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
