const express = require('express');
const authController = require('../Controllers/Auth.controller');
const authMiddleware = require('../Middleware/Auth.middleware')

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/get-access-token', authMiddleware.authenticateRefresh, authController.getAccessToken);
router.get('/logout',authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:id/:token', authController.resetPasswordVerify);
router.post('/reset-password/:id/:token', authController.resetPassword);

module.exports = router;