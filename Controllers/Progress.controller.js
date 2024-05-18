
const Progress = require('../Models/progress.model');
const  Session =require('../Models/Session.model');
const  Student =require('../Models/Student.model');
const  Quiz =require('../Models/Quiz.model');
const  QuizSubmission =require('../Models/QuizSubmission.model');


const getAssignmentData = async (req, res) => {
  try {
    const teacherId = req.user.profileID;

    // Find the teacher's sessions and populate assignments
    const sessions = await Session.find({ teacher: teacherId })
      .populate({
        path: 'assignment',
        populate: {
          path: 'submissions'
        }
      });

    // Format the data for frontend graphing
    const formattedSessions = sessions.map(session => ({
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

    res.json({ sessions: formattedSessions });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
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
  // try {
  //   const studentId = req.user.profileID;
  //   const sessions = await Session.find({ students: studentId }).populate({
  //     path: 'quiz',
  //     populate: {
  //       path: 'submissions',
  //       match: { student: studentId } // Only populate submissions by the current student
  //     }
  //   });

  //   // Format data to match frontend expectations
  //   const overallQuizData = sessions.map(session => ({
  //     session: session._id,
  //     subject: session.subject,
  //     quizzes: session.quiz.map(quiz => ({
  //       title: quiz.title,
  //       averageGrade: calculateAverageGrade(quiz.submissions)
  //     }))
  //   }));

  //   const individualQuizData = sessions.map(session => ({
  //     session: session._id,
  //     subject: session.subject,
  //     quizzes: session.quiz.map(quiz => ({
  //       title: quiz.title,
  //       grades: quiz.submissions.map(submission => submission.marks)
  //     }))
  //   }));

  //   // Send the formatted quiz data as response
  //   res.json({ overallQuizData, individualQuizData });
  // } catch (error) {
  //   console.error('Error fetching quiz data:', error);
  //   res.status(500).json({ error: 'Internal server error' });
  // }

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

const calculateAverageGrade = (submissions) => {
  if (submissions.length === 0) return 0;
  const totalMarks = submissions.reduce((acc, submission) => acc + submission.marks, 0);
  return totalMarks / submissions.length;
};




module.exports = {
    getAssignmentData,
    getQuizData,
    getAssigDataStudent,
    getQuizDataStudent,
  };
  