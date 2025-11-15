const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING(255), allowNull: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    role: { type: DataTypes.ENUM('user','admin'), defaultValue: 'user' },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    profileImage: { type: DataTypes.STRING(500), allowNull: true },
    googleId: { type: DataTypes.STRING(255), allowNull: true }
  }, { tableName: 'users', underscored: true });

  return User;
};
