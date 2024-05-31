const Session = require('../Models/Session.model');
const Teacher = require('../Models/Teacher.model');
const Student = require('../Models/Student.model');


const getProfile = async (req, res) => {
    try {
        const studentId  = req.user.profileID;

        // Find the teacher by ID and populate the 'user' and 'sessions' fields
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Respond with the organized teacher data
        res.status(200).json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const getStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Find the student and populate 'sessions' and 'teachers' fields with relevant details
        const student = await Student.findById(studentId)
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;

        // Find the student and populate 'sessions' and 'teachers' fields with relevant details
        const teacher = await Teacher.findById(teacherId)
        
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        res.status(200).json(teacher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getTopRatedTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find({ rating: { $gte: 4 }, isApproved: true });

        if (!teachers) {
            return res.status(404).json({message: 'No Teachers Found'});
        }
        res.status(200).json(teachers);
    }
    catch (error) {
        console.log(error);
    }
}




const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find()
        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getMyTeachers = async (req, res) => {
    try {
        const studentId  = req.user.profileID;

        const student = await Student.findById(studentId).populate({
            path: 'teachers',
            select: 'firstName lastName profilePicture educationalCredentials subjectsTaught'
          })
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        const teachers = student.teachers;

        res.status(200).json(teachers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



const updateProfile = async (req, res) => {
    try {
        const studentId = req.user.profileID;
        
        const updatedStudent = await Student.findOneAndUpdate(
            { _id: studentId },
            { $set: { ...req.body } },
            { new: true }
        );
        res.status(200).json(updatedStudent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const getSubjectTeachers = async (req, res) => {
    try {
        const subject = req.body.subject.toLowerCase();
        // Fetch teachers with subjectsTaught elements converted to lowercase
        const teachers = await Teacher.find({
            'subjectsTaught': {
                $in: [subject]
            }
        });

        res.status(200).json(teachers);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}





const getMySessions = async (req, res) => {
    try {
        const studentId  = req.user.profileID;

        // Find sessions for the student and populate the 'students' field
        const sessions = await Session.find({ students: studentId, status: "scheduled" }).populate('students');

        if (!sessions || sessions.length === 0) {
            return res.status(404).json({ message: 'No sessions found for this student' });
        }

        res.status(200).json({ sessions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();

        const teacherData = teachers.map(teacher => {
            return {
                name: teacher.user.firstName + ' ' + teacher.user.lastName,
                email: teacher.user.email,
                contactInformation: teacher.user.contactInformation,
                profilePicture: teacher.user.profilePicture,
            };
        });

        res.status(200).json({ teachers: teacherData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = {
    getProfile,
    getStudent,
    getAllStudents,
    getMyTeachers,
    updateProfile,
    getSubjectTeachers,
    getTopRatedTeachers,
    getMySessions,
    getAllTeachers,
    getTeacher
};