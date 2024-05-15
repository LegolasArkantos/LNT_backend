
const Progress = require('../Models/progress.model');
const  Session =require('../Models/Session.model');
const  Student =require('../Models/Student.model');
const  Quiz =require('../Models/Quiz.model');
const  QuizSubmission =require('../Models/QuizSubmission.model');


// GET assignment progress for a teacher
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
    // Extract student ID from authenticated user
    const studentId = req.user.profileID;

    // Fetch sessions attended by the student
    const sessions = await Session.find({ students: studentId }).populate('quiz');

    // Overall quiz grades in each session
    const overallQuizGrades = sessions.map(session => {
      const totalMarks = session.quiz.reduce((acc, quiz) => acc + parseInt(quiz.marks), 0);
      const totalSubmissions = session.quiz.reduce(async (acc, quiz) => {
        const submission = await QuizSubmission.findOne({ student: studentId, quiz: quiz._id });
        if (submission) return acc + submission.marks;
        return acc;
      }, 0);
      return {
        sessionId: session._id,
        subject: session.subject,
        totalMarks,
        totalSubmissions,
        percentage: totalSubmissions / totalMarks * 100
      };
    });

    // Individual quiz grades in each session
    const individualQuizGrades = [];
    for (const session of sessions) {
      const sessionData = {
        sessionId: session._id,
        subject: session.subject,
        quizzes: []
      };
      for (const quiz of session.quiz) {
        const submission = await QuizSubmission.findOne({ student: studentId, quiz: quiz._id });
        sessionData.quizzes.push({
          quizId: quiz._id,
          title: quiz.title,
          marks: parseInt(quiz.marks),
          submission: submission ? { submissionId: submission._id, grade: submission.marks } : null
        });
      }
      individualQuizGrades.push(sessionData);
    }

    res.json({ overallQuizGrades, individualQuizGrades });
  } catch (error) {
    console.error('Error fetching student quiz progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}




module.exports = {
    getAssignmentData,
    getQuizData,
    getAssigDataStudent,
    getQuizDataStudent,
  };
  