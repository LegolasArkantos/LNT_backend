const express = require("express");
const router = express.Router();
const aiController = require("../Controllers/aiController");

router.post("/generate-story", aiController.generateStory);

module.exports = router;