const Assignment = require('../Models/Assignment.model');
const Submission = require('../Models/Submission.model');
const Session = require('../Models/Session.model');
const cloudinary = require("../Configuration/Cloudinary");
const Notifications = require('../Models/Notification.model');
const Student = require("../Models/Student.model");

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
        const { files } = req.body;
        const studentId = req.user.profileID;

        await Submission.findOneAndDelete({ student: studentId, assignment: assignmentId });

        const student = await Student.findById(studentId);
        const { firstName, lastName } = student;
        const studentName = `${firstName} ${lastName}`;

        const submission = new Submission({
            student: studentId,
            studentName,
            files,
            assignment: assignmentId ,
            grade: -1
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
        const session = await Session.findById(sessionId).populate('students');
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        session.assignment.push(assignment._id);
        for (const student of session.students) {
            const notification = await Notifications.findById(student.notificationsID);
            notification.notifications.push({title: session.subject + ": New Assignment", timestamp: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes()});
            await notification.save();
        }
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
        const { title, startTime, endTime, description, marks } = req.body;

        await Assignment.findByIdAndUpdate(assignmentId, {
            title,
            startTime,
            endTime,
            description,
            marks,
            
        });

        res.status(200).json({ message: 'Assignment updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const assignment = await Assignment.findById(assignmentId)
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        res.status(200).json({ assignment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const uploadFile = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { files } = req.body;
    
        // Find the assignment by ID
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
          return res.status(404).json({ message: 'Assignment not found' });
        }
    
        // Update the assignment with file URLs and names
        assignment.files.push(...files);
    await assignment.save();
    
        res.json({ message: 'Files saved to assignment successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
      }
};

const getSubmission = async (req, res) => {
    try {
        const studentId = req.user.profileID; 

        const { assignmentId } = req.params;

        const submission = await Submission.findOne({ student: studentId, assignment: assignmentId });

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        const files = submission.files;

        res.status(200).json({ files });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }


}


const getSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const assignment = await Assignment.findById(assignmentId);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        await assignment.populate('submissions')

        const submissions = assignment.submissions.map(submission => ({
            _id: submission._id,
            studentName: submission.studentName,
            files: submission.files,
            grade: submission.grade
        }));

        res.status(200).json({ submissions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }


}

module.exports = {
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getSessionAssignments,
    gradeAssignment,
    submitSubmission,
    getAssignment,
    uploadFile,
    getSubmission,
    getSubmissions,
    
};
