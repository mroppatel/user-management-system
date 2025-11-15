const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

router.get('/', authenticate,  userController.getUsers);
router.get('/:id', authenticate, userController.getUser);
router.put('/:id', authenticate, upload.single('profileImage'), userController.updateProfile);
router.delete('/:id', authenticate,  userController.deleteUser);

module.exports = router;
