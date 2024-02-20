const express = require('express');
const router = express.Router();
const notesController = require('../Controllers/Note.controller');
const authMiddleware = require('../Middleware/Auth.middleware');

// Get all notes of a teacher
router.get('/get', authMiddleware.authenticateTeacher, notesController.getAllNotesByTeacher);

// Create a new note by a teacher
router.post('/create', authMiddleware.authenticateTeacher, notesController.createNoteByTeacher);

// Delete a note by a teacher
router.delete('/delete/:noteId', authMiddleware.authenticateTeacher, notesController.deleteNoteByTeacher);

// Update a note by a teacher
router.patch('/update/:noteId', authMiddleware.authenticateTeacher, notesController.updateNoteByTeacher);

module.exports = router;
