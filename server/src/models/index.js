const sequelize = require('../config/db');
const defineUser = require('./user.model');

const User = defineUser(sequelize);

module.exports = { sequelize, User };
