const express = require("express");
const router = express.Router();

const pollController = require("../Controllers/Poll.controller");
const authMiddleware = require('../Middleware/Auth.middleware');

router.post("/create", authMiddleware.authenticateTeacher, pollController.createPoll);
router.get("/get-my-polls", authMiddleware.authenticateTeacher, pollController.getMyPolls);
router.get("/", authMiddleware.authenticateStudent, pollController.getAllPolls);
router.delete("/delete/:pollID", authMiddleware.authenticateTeacher, pollController.deletePoll);
router.put("/update-count/:pollID", authMiddleware.authenticateStudent, pollController.updatePollCount);

module.exports = router;