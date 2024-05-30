const express = require("express");
const router = express.Router();

const progressController = require("../Controllers/Progress.controller");
const authMiddleware = require('../Middleware/Auth.middleware');

router.get("/getAssignmentData", authMiddleware.authenticateTeacher, progressController.getAssignmentData);
router.get("/getQuizData", authMiddleware.authenticateTeacher, progressController.getQuizData);
router.get("/getAssignmentDataStudent", authMiddleware.authenticateStudent, progressController.getAssigDataStudent);
router.get("/getQuizDataStudent", authMiddleware.authenticateStudent, progressController.getQuizDataStudent);
router.get("/getSessionsData", authMiddleware.authenticateTeacher, progressController.getTeacherSessions);
router.get("/getStudentOverallData/:sessionId", authMiddleware.authenticateTeacher, progressController.getTeacherStudentsData);


module.exports = router;