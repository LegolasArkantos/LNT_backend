const Teacher = require('../Models/Teacher.model');
const User = require('../Models/User.model');
const Session = require('../Models/Session.model');

const approveTeacher = async (req, res) => {
    try {
        const teacherId = req.params.teacherId;
        const teacher = await Teacher.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        teacher.isApproved = true;
        await teacher.save();

        res.status(200).json({ message: 'Teacher approved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getUnapprovedTeachers = async (req, res) => {
    try {
        const unapprovedTeachers = await Teacher.find({ isApproved: false });

        res.status(200).json(unapprovedTeachers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const unapproveTeacher = async (req, res) => {
    try {
        const teacherId = req.params.teacherId;

        const deletedTeacher = await Teacher.deleteOne({ _id: teacherId });
        const result = await User.deleteOne({profileID: teacherId});

        if (deletedTeacher.deletedCount === 0 || result.deletedCount === 0) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        res.status(200).json({ message: 'Teacher unapproved and record deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const approveSession = async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        session.status = "scheduled";
        await session.save();

        res.status(200).json({ message: 'Session approved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getUnapprovedSessions = async (req, res) => {
    try {
        const unapprovedSessions = await Session.find({ status: "In Review" });

        res.status(200).json(unapprovedSessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const unapproveSession = async (req, res) => {
    try {
        const sessionId = req.params.sessionId;

        // Remove the teacher record from the database
        const deletedSession = await Session.deleteOne({ _id: sessionId });

        if (deletedSession.deletedCount === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.status(200).json({ message: 'Session unapproved and record deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    approveTeacher,  
    unapproveTeacher,
    getUnapprovedTeachers,
    approveSession,
    getUnapprovedSessions,
    unapproveSession
};