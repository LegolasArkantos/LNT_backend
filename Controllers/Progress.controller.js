
const Progress = require('../Models/progress.model');
const  Session =require('../Models/Session.model');
const  Student =require('../Models/Student.model');
const  Quiz =require('../Models/Quiz.model');
const  QuizSubmission =require('../Models/QuizSubmission.model');


const getAssignmentData = async (req, res) => {
  try {
    const profileID = req.user.profileID;


    const progress = await Progress.findOne({ teacher: profileID });

    if (!progress) {
        return res.status(404).json({ message: 'Progress not found for this teacher' });
    }

    res.status(200).json({ sessions: progress.sessions });
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
}
};


const getQuizData = async (req, res) => {
    try {
        const profileID = req.user.profileID;

            const sessions = await Session.find({ teacher: profileID }).populate({
            path: 'quiz',
            populate: {
                path: 'submissions'
            }
            });
    
        // Format data to match frontend expectations
        const quizData = sessions.map(session => ({
          session: session._id,
          subject: session.subject,
          quizzes: session.quiz.map(quiz => ({
            title: quiz.title,
            submissions: quiz.submissions.map(submission => submission.marks)
          }))
        }));
    
        // Send the formatted quiz data as response
        res.json({ quizData });
      } catch (error) {
        console.error('Error fetching quiz data:', error);
        res.status(500).json({ error: 'Internal server error' });
      }

};

const getAssigDataStudent = async (req, res) => {

  try {
    const studentId = req.user.profileID;

    // Find the student and populate sessions and assignments
    const student = await Student.findById(studentId)
      .populate({
        path: 'sessions',
        populate: {
          path: 'assignment',
          populate: {
            path: 'submissions',
            match: { student: studentId } // Only include this student's submissions
          }
        }
      });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Format the data for frontend graphing
    const sessionsData = student.sessions.map(session => ({
      sessionId: session._id,
      subject: session.subject,
      assignments: session.assignment.map(assignment => ({
        assignmentId: assignment._id,
        title: assignment.title,
        totalMarks: assignment.marks,
        submissions: assignment.submissions.map(submission => ({
          submissionId: submission._id,
          grade: submission.grade
        }))
      }))
    }));

    res.json(sessionsData);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
}
const getQuizDataStudent = async (req, res) => {
  

  try {
    const studentId = req.user.profileID;

    const sessions = await Session.find({ students: studentId }).populate({
        path: 'quiz',
        populate: {
            path: 'submissions',
            match: { student: studentId }
        }
    });

    // Filter out sessions with no quizzes
    const filteredSessions = sessions.filter(session => session.quiz.length > 0);

    // Format data to match frontend expectations
    const quizData = filteredSessions.map(session => {
        const sessionQuizzes = session.quiz.map(quiz => {
            const studentSubmissions = quiz.submissions.filter(submission => submission.student.toString() === studentId);
            const totalMarks = parseInt(quiz.marks);
            const averageMarks = studentSubmissions.length > 0 
                ? studentSubmissions.reduce((acc, submission) => acc + submission.marks, 0) / studentSubmissions.length 
                : 0;

            return {
                title: quiz.title,
                averageMarks,
                submissions: studentSubmissions.map(submission => submission.marks),
                totalMarks
            };
        });

        const sessionAverage = sessionQuizzes.length > 0 
            ? sessionQuizzes.reduce((acc, quiz) => acc + quiz.averageMarks, 0) / sessionQuizzes.length 
            : 0;

        return {
            sessionId: session._id,
            subject: session.subject,
            sessionAverage,
            quizzes: sessionQuizzes
        };
    });

    // Send the formatted quiz data as response
    res.json({ quizData });
} catch (error) {
    console.error('Error fetching quiz data:', error);
    res.status(500).json({ error: 'Internal server error' });
}
};


const getTeacherSessions = async (req, res) => {
  try {
    const teacherId = req.user.profileID; 
    const sessions = await Session.find({ teacher: teacherId }).select('subject');
    res.json({ sessions });
} catch (error) {
    res.status(500).json({ error: 'Server error' });
}


}

const getTeacherStudentsData = async (req, res) => {
  const { sessionId } = req.params;

  try {
      // Fetch the selected session along with assignments and quizzes
      const session = await Session.findOne({ _id: sessionId })
          .populate({
              path: 'assignment',
              populate: { path: 'submissions' }
          })
          .populate({
              path: 'quiz',
              populate: { path: 'submissions' }
          })
          .populate('students');

      if (!session) {
          return res.status(404).json({ message: 'Session not found' });
      }

      const studentsGrades = [];

      // Iterate over each student in the session
      for (const student of session.students) {
          const studentGrades = {
              studentId: student._id,
              studentName: `${student.firstName} ${student.lastName}`,
              assignments: [],
              quizzes: [],
              totalMarksObtained: 0,
              totalMaxMarks: 0,
              overallPercentage: 0
          };

          // Process assignments for the student
          for (const assignment of session.assignment) {
              const submission = assignment.submissions.find(sub => sub.student.toString() === student._id.toString());
              if (submission) {
                  const marksObtained = submission.grade || 0;
                  const maxMarks = parseFloat(assignment.marks);
                  studentGrades.assignments.push({
                      assignmentId: assignment._id,
                      assignmentTitle: assignment.title,
                      marksObtained,
                      maxMarks
                  });
                  studentGrades.totalMarksObtained += marksObtained;
                  studentGrades.totalMaxMarks += maxMarks;
              }
          }

          // Process quizzes for the student
          for (const quiz of session.quiz) {
              const quizSubmission = quiz.submissions.find(sub => sub.student.toString() === student._id.toString());
              if (quizSubmission) {
                  const marksObtained = quizSubmission.marks || 0;
                  const maxMarks = parseFloat(quiz.marks);
                  studentGrades.quizzes.push({
                      quizId: quiz._id,
                      quizTitle: quiz.title,
                      marksObtained,
                      maxMarks
                  });
                  studentGrades.totalMarksObtained += marksObtained;
                  studentGrades.totalMaxMarks += maxMarks;
              }
          }

          // Calculate overall percentage
          if (studentGrades.totalMaxMarks > 0) {
              studentGrades.overallPercentage = (studentGrades.totalMarksObtained / studentGrades.totalMaxMarks) * 100;
          }

          studentsGrades.push(studentGrades);
      }

      res.status(200).json(studentsGrades);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }


}


module.exports = {
    getAssignmentData,
    getQuizData,
    getAssigDataStudent,
    getQuizDataStudent,
    getTeacherSessions,
    getTeacherStudentsData

  };
  