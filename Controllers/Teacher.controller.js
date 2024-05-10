 const Session = require('../Models/Session.model');
const Teacher = require('../Models/Teacher.model');
// const User = require('../Models/User.model');
const Student = require('../Models/Student.model');




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
  
      const teacher = await Teacher.findById(teacherId);
  
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
  
      // Find sessions for the teacher
      const sessions = await Session.find({ teacher: teacherId });
  
      const studentsData = [];
  
      // Loop through sessions
      for (const session of sessions) {
        const sessionData = {
          teacher: session.teacher,
          sessionId :session.id,
          subject: session.subject,
          startTime: session.startTime,
          endTime: session.endTime,
          paymentStatus:session.paymentStatus,
          status:session.status,
          sessionPrice:session.sessionPrice,
          teacherName: session.teacherName,
          students: [],
        };
  
        // Loop through students of the session
        for (const studentId of session.students) {
          const student = await Student.findById(studentId);
  
          if (student) {
            sessionData.students.push({
              studentId: student.id,
              firstName: student.firstName,
              lastName: student.lastName,
              profilePicture: student.profilePicture,
              
            });
          }
        }
  
        studentsData.push(sessionData);
      }
      res.status(200).json({ studentsData });
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
  

  const getSpecificSession = async (req, res) => {
    try {

        const teacherId = req.user.profileID;
        const { sessionId } = req.params;

        // Find the teacher
        const teacher = await Teacher.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Find the session
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Check if the session belongs to the teacher
        if (session.teacher.toString() !== teacherId) {
            return res.status(403).json({ message: 'You are not authorized to view this session' });
        }

        const sessionData = {
            subject: session.subject,
            startTime: session.startTime,
            endTime: session.endTime,
            students: [],
        };

        // Loop through students of the session
        for (const studentId of session.students) {
            const student = await Student.findById(studentId).populate('user', ['firstName', 'lastName', 'email', 'profilePicture', 'contactInformation']);

            if (student) {
                sessionData.students.push({
                    firstName: student.user.firstName,
                    lastName: student.user.lastName,
                    email: student.user.email,
                    profilePicture: student.user.profilePicture,
                    contactInformation: student.user.contactInformation,
                });
            }
        }
        console.log(sessionData)
        res.status(200).json({ sessionData });
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

const getTeacher = async (req, res) => {
  try {
      const { teacherId } = req.params;

      // Find the student and populate 'sessions' and 'teachers' fields with relevant details
      const teacher = await Teacher.findById(teacherId)
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
      
      if (!teacher) {
          return res.status(404).json({ message: 'Teacher not found' });
      }

      res.status(200).json(teacher);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
};



module.exports = {
    getProfile,
    getMyStudents,
    updateProfile,
    getSpecificSession,
    getStudent,
    getTeacher,
};