//const Session = require('../models/session');
// const Teacher = require('../Models/Teacher.model');
// const User = require('../Models/User.model');
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
            // .populate({
            //     path: 'sessions',
            //     select: ['startTime', 'endTime', 'status', 'paymentStatus', 'teacherName','subject', 'sessionPrice']
            // })
            // .populate({
            //     path: 'teachers',
            //     select: ['educationalCredentials', 'subjectsTaught', 'availableTimeSlots'],
            //     populate: {
            //         path: 'user',
            //         select: ['firstName', 'lastName', 'email', 'contactInformation', 'profilePicture']
            //     }
            // })
            // .populate({
            //     path: 'user',
            //     select: ['firstName', 'lastName', 'email', 'contactInformation', 'profilePicture']
            // })
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};




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
        //const teachers = await Teacher.find({ _id: { $in: student.teachers } }).populate('user', ['firstName', 'lastName', 'email', 'contactInformation', 'profilePicture']);
        
        // const teacherData = teachers.map(teacher => {
        //     return {
        //         name: teacher.user.firstName + ' ' + teacher.user.lastName,
        //         email: teacher.user.email,
        //         contactInformation: teacher.user.contactInformation,
        //         profilePicture: teacher.user.profilePicture,
        //     };
        // });

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




// const getMySessions = async (req, res) => {
//     try {
//         const { studentId } = req.params;

//         // Find sessions for the student and populate the 'students' field
//         const sessions = await Session.find({ students: studentId }).populate({
//             path: 'students',
//             select: 'educationalLevel -_id', // Select educationalLevel and exclude _id
//             populate: {
//                 path: 'user',
//                 select: 'firstName lastName -_id' // Select firstName and lastName, exclude _id
//             }
//         }).select('-_id -__v'); // Exclude _id and __v fields from sessions

//         if (!sessions || sessions.length === 0) {
//             return res.status(404).json({ message: 'No sessions found for this student' });
//         }

//         res.status(200).json({ sessions });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };

// const getAllTeachers = async (req, res) => {
//     try {
//         const teachers = await Teacher.find();

//         const teacherData = teachers.map(teacher => {
//             return {
//                 name: teacher.user.firstName + ' ' + teacher.user.lastName,
//                 email: teacher.user.email,
//                 contactInformation: teacher.user.contactInformation,
//                 profilePicture: teacher.user.profilePicture,
//             };
//         });

//         res.status(200).json({ teachers: teacherData });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };


module.exports = {
    getProfile,
    getStudent,
    getAllStudents,
    getMyTeachers,
    updateProfile,

};