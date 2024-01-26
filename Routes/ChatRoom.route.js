const express = require('express');

const router = express.Router();

const chatRoomController = require('../Controllers/ChatRoom.controller');
const authMiddleware = require('../Middleware/Auth.middleware');

router.get('/',authMiddleware.authenticateUser, chatRoomController.getAllChatRooms);

router.delete('/delete/:chatRoomID', authMiddleware.authenticateUser, chatRoomController.deleteChatRoom);

router.post('/create', authMiddleware.authenticateUser, chatRoomController.createChatRoom);

router.patch('/send-message', authMiddleware.authenticateUser, chatRoomController.sendMessage);

router.patch('/delete-message', authMiddleware.authenticateUser, chatRoomController.deleteMessage);

module.exports = router;