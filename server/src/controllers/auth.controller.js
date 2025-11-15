const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { User } = require("../models");
const transporter = require("../config/mailer");
const { signAccessToken, signRefreshToken } = require("../utils/generateToken");
const redisClient = require("../config/redis");
require("dotenv").config();

const setRefreshToken = async (userId, token) => {
  try {
    await redisClient.connect();
  } catch (e) {}
  await redisClient.set(`refresh_${userId}`, token, { EX: 7 * 24 * 60 * 60 });
};

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password, name } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 12);

    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

    const user = await User.create({
      email,
      password: hashed,
      name,
      profileImage,
    });

    const token = jwt.sign(
      { id: user.id },
      process.env.EMAIL_VERIFICATION_SECRET,
      { expiresIn: "1d" }
    );
    const verifyUrl = `${process.env.CLIENT_URL}/verify?token=${token}`;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Verify your email",
      html: `<p>Hi ${user.name},</p><p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
    });

    res.status(201).json({ message: "Registered successfully. Check email to verify." });
  } catch (err) {
    next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(400).send("Token missing");
    const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(400).send("Invalid token");
    user.isVerified = true;
    await user.save();
    return res.send(
      "<h3>Email verified. You can close this window and log in.</h3>"
    );
  } catch (err) {
    return res.status(400).send("Invalid or expired token");
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (!user.isVerified)
      return res.status(403).json({ message: "Please verify your email" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });
    // await setRefreshToken(user.id, refreshToken);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: "Refresh token required" });
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    try {
      await redisClient.connect();
    } catch (e) {}
    const saved = await redisClient.get(`refresh_${decoded.id}`);
    if (!saved || saved !== refreshToken)
      return res.status(401).json({ message: "Invalid refresh token" });

    const accessToken = signAccessToken({ id: decoded.id });
    res.json({ accessToken });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

exports.requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.json({ message: "If the email exists, reset link was sent" });

    const token = jwt.sign({ id: user.id }, process.env.PASSWORD_RESET_SECRET, {
      expiresIn: "1h",
    });
    const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Password reset",
      html: `<p>Click <a href="${url}">here</a> to reset password</p>`,
    });
    res.json({ message: "If the email exists, reset link was sent" });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, process.env.PASSWORD_RESET_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(400).json({ message: "Invalid token" });
    user.password = await bcrypt.hash(password, 12);
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};
