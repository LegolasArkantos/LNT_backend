const express = require("express");
const router = express.Router();

const progressController = require("../Controllers/Progress.controller");
const authMiddleware = require('../Middleware/Auth.middleware');

router.get("/getAssignmentData", authMiddleware.authenticateTeacher, progressController.getAssignmentData);
router.get("/getQuizData", authMiddleware.authenticateTeacher, progressController.getQuizData);


module.exports = router;