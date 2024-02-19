const express = require("express");
const router = express.Router();
const adminController = require("../Controllers/Admin.controller");
const authMiddleware = require('../Middleware/Auth.middleware')

router.get("/un-approved-teachers", authMiddleware.authenticateAdmin, adminController.getUnapprovedTeachers);

router.patch("/approve-teacher/:teacherId", authMiddleware.authenticateAdmin, adminController.approveTeacher);

router.patch("/reject-teacher/:teacherId", authMiddleware.authenticateAdmin, adminController.unapproveTeacher);

module.exports = router;