// const Session = require('../models/session');
const Teacher = require('../Models/Teacher.model');
// const User = require('../Models/User.model');
// const Student = require('../Models/Student.model');




const getProfile = async (req, res) => {
    try {
        const teacherId  = req.user.profileID;

        // Find the teacher by ID and populate the 'user' and 'sessions' fields
        const teacher = await Teacher.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Respond with the organized teacher data
        res.status(200).json(teacher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};






const getMyStudents = async (req, res) => {
    try {
      const teacherId = req.user.profileID;
  
      // Find the teacher
      const teacher = await Teacher.findById(teacherId).populate('students');
  
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }


      res.status(200).json(teacher.students)
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  const updateProfile = async (req, res) => {
    try {
        const teacherId = req.user.profileID;
        
        const updatedTeacher = await Teacher.findOneAndUpdate(
            { _id: teacherId },
            { $set: { ...req.body } },
            { new: true }
        );
        res.status(200).json(updatedTeacher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  

//   const getSpecificSessionAndStudents = async (req, res) => {
//     try {
//         const { teacherId, sessionId } = req.params;

//         // Find the teacher
//         const teacher = await Teacher.findById(teacherId);

//         if (!teacher) {
//             return res.status(404).json({ message: 'Teacher not found' });
//         }

//         // Find the session
//         const session = await Session.findById(sessionId);

//         if (!session) {
//             return res.status(404).json({ message: 'Session not found' });
//         }

//         // Check if the session belongs to the teacher
//         if (session.teacher.toString() !== teacherId) {
//             return res.status(403).json({ message: 'You are not authorized to view this session' });
//         }

//         const sessionData = {
//             subject: session.subject,
//             startTime: session.startTime,
//             endTime: session.endTime,
//             students: [],
//         };

//         // Loop through students of the session
//         for (const studentId of session.students) {
//             const student = await Student.findById(studentId).populate('user', ['firstName', 'lastName', 'email', 'profilePicture', 'contactInformation']);

//             if (student) {
//                 sessionData.students.push({
//                     firstName: student.user.firstName,
//                     lastName: student.user.lastName,
//                     email: student.user.email,
//                     profilePicture: student.user.profilePicture,
//                     contactInformation: student.user.contactInformation,
//                 });
//             }
//         }

//         res.status(200).json({ sessionData });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };


module.exports = {
    getProfile,
    getMyStudents,
    updateProfile,
};