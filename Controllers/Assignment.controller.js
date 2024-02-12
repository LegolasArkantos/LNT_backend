const Assignment = require('../Models/Assignment.model');
const Submission = require('../Models/Submission.model');
const Session = require('../Models/Session.model')

const deleteAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        
        await Assignment.findByIdAndDelete(assignmentId);

        res.status(200).json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getSessionAssignments = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findById(sessionId).populate('assignment');
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.status(200).json({ assignments: session.assignment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const gradeAssignment = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { grade, feedback } = req.body;

        await Submission.findByIdAndUpdate(submissionId, { grade, feedback });

        
        res.status(200).json({ message: 'Assignment grade and feedback updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const submitSubmission = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { teacherId, studentId, studentName, feedback } = req.body;

        const submission = new Submission({
            teacher: teacherId,
            student: studentId,
            studentName,
            feedback
        });

        await submission.save();

        await Assignment.findByIdAndUpdate(assignmentId, { $push: { submissions: submission._id } });

        res.status(201).json({ message: 'Submission successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const createAssignment = async (req, res) => {
    try {
        const { title, startTime, endTime, description, marks,  } = req.body;
        const { sessionId } = req.params; 
        const assignment = new Assignment({
            title,
            startTime,
            endTime,
            description,
            marks,
            submissions: [],
        });

        await assignment.save();

        // Find the session and update its assignments array
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        session.assignment.push(assignment._id);
        await session.save();

        res.status(201).json({ message: 'Assignment created successfully', assignment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const updateAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { title, startTime, endTime, description, marks, submissions } = req.body;

        await Assignment.findByIdAndUpdate(assignmentId, {
            title,
            startTime,
            endTime,
            description,
            marks,
            submissions
        });

        res.status(200).json({ message: 'Assignment updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getSessionAssignments,
    gradeAssignment,
    submitSubmission
};
