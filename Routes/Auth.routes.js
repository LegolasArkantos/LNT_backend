const express = require('express');
const authController = require('../Controllers/Auth.controller');
const authMiddleware = require('../Middleware/Auth.middleware')

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/get-access-token', authMiddleware.authenticateRefresh, authController.getAccessToken);
router.get('/logout',authController.logout);

module.exports = router;