const Teacher = require('../Models/Teacher.model');
const Note = require('../Models/Note.model');

const getAllNotesByTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.user.profileID).populate('notes');
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.status(200).json(teacher.notes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error, Please Try again" });
    }
};

const createNoteByTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.user.profileID);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        const { title, description, timestamp } = req.body;
        const note = new Note({ title, description, timestamp });
        await note.save();
        teacher.notes.push(note._id);
        await teacher.save();
        res.status(200).json(note);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error, Please Try again" });
    }
};

// Controller function to delete a note by a teacher
const deleteNoteByTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.user.profileID);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        const result = await Note.findByIdAndDelete(req.params.noteId);
        teacher.notes = teacher.notes.filter((note) => note._id.toString() !== req.params.noteId);
        
        await teacher.save();
        res.status(200).json({ message: 'Deleted note' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error, Please Try again" });
    }
};

// Controller function to update a note by a teacher
const updateNoteByTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.user.profileID);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        const note = await Note.findById(req.params.noteId);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        if (req.body.title != null) {
            note.title = req.body.title;
        }
        if (req.body.description != null) {
            note.description = req.body.description;
        }
        if (req.body.Time != null) {
            note.timestamp = req.body.timestamp;
        }
        await note.save();
        res.status(200).json(note);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error, Please Try again" });
    }
};

module.exports = {
    getAllNotesByTeacher,
    createNoteByTeacher,
    deleteNoteByTeacher,
    updateNoteByTeacher
};
