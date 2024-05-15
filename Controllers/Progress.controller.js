
const Progress = require('../Models/progress.model');
const  Session =require('../Models/Session.model');
const  Student =require('../Models/Student.model');


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



module.exports = {
    getAssignmentData,
    getQuizData,
    getAssigDataStudent,
  };
  