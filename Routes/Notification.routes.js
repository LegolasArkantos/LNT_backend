const express = require('express');

const router = express.Router();

const notificationController = require('../Controllers/Notification.controller');
const authMiddleware = require('../Middleware/Auth.middleware');

router.get('/', authMiddleware.authenticateUser ,notificationController.getNotifications);

router.delete('/delete/:notificationID', authMiddleware.authenticateUser,notificationController.deleteNotification);

module.exports = router;