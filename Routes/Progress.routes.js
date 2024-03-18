const express = require("express");
const router = express.Router();

const progressController = require("../Controllers/Progress.controller");
const authMiddleware = require('../Middleware/Auth.middleware');

router.get("/getAssignmentData", authMiddleware.authenticateTeacher, progressController.getAssignmentData);


module.exports = router;