const express = require("express");
const router = express.Router();
const aiController = require("../Controllers/aiController");
const authMiddleware = require('../Middleware/Auth.middleware')


router.post("/generate-story", aiController.generateStory);
router.get("/generate-analysis",authMiddleware.authenticateUser, aiController.generateAnalysis);
router.get("/generate-analysis-student",authMiddleware.authenticateUser, aiController.generateAnalysisStudent);


module.exports = router;