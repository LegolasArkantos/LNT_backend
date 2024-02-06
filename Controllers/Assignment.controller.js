const Assignment = require('../Models/Assignment.model');
const Submission = require('../Models/Submission.model');

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

        const assignments = await Assignment.find({ session: sessionId });

        res.status(200).json({ assignments });
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

module.exports = {

    deleteAssignment,
    getSessionAssignments,
    gradeAssignment,
    submitSubmission
};
