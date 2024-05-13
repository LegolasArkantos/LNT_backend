
const Progress = require('../Models/progress.model');
const  Session =require('../Models/Session.model');

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

module.exports = {
    getAssignmentData,
    getQuizData,
  };
  