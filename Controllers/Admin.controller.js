const Teacher = require('../Models/Teacher.model');
const User = require('../Models/User.model');

const approveTeacher = async (req, res) => {
    try {
        const teacherId = req.params.teacherId;
        // Fetch the teacher from the database
        const teacher = await Teacher.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Update the approval status to true
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

        // Remove the teacher record from the database
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

module.exports = {
    approveTeacher,  
    unapproveTeacher,
    getUnapprovedTeachers

};