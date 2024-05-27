const express = require("express");
const router = express.Router();

const quizController = require("../Controllers/Quiz.controller");
const authMiddleware = require('../Middleware/Auth.middleware');
const multer = require('multer');
const upload = multer();

router.post("/create/:sessionId", authMiddleware.authenticateTeacher, quizController.createQuiz);
router.get("/get-session-quizes/:sessionId", authMiddleware.authenticateUser, quizController.sessionQuizes);
router.get('/get-quiz/:quizId', authMiddleware.authenticateUser,  quizController.getQuiz);
router.get('/get-quiz-submission/:quizId', authMiddleware.authenticateStudent,  quizController.getSubmission);
router.get('/get-quiz-submissions/:quizId', authMiddleware.authenticateTeacher,  quizController.getAllSubmission);
router.post('/submit/:quizId', authMiddleware.authenticateStudent,  quizController.submitQuiz);
router.get('/my-session-quiz-submissions/:sessionId', authMiddleware.authenticateStudent,quizController.getMySessionQuizSubmissions);
router.post('/upload-questions', authMiddleware.authenticateTeacher, upload.single('file'), quizController.uploadQuestionsFromFile);

module.exports = router;