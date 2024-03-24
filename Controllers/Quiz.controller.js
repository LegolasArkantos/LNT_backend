const Quiz = require('../Models/Quiz.model');
const Session = require('../Models/Session.model');
const QuizSubmission = require('../Models/QuizSubmission.model');

const createQuiz = async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        console.log("questions", req.body.questions)
        const quiz = await Quiz.create({
            title: req.body.title,
            marks: req.body.marks,
            time: req.body.time,
            questions: req.body.questions
        });
        const session = await Session.findById(sessionId);
        session.quiz.push(quiz._id);
        await session.save();
        res.status(200).json(quiz);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const sessionQuizes = async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const quizes = await Session.findById(sessionId).select('quiz').populate('quiz');
        res.status(200).json(quizes);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId)
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        res.status(200).json({ quiz });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getSubmission = async (req, res) => {
    try {
        const quizId = req.params.quizId;
        const profileID = req.user.profileID
        const submission = await QuizSubmission.find({quiz: quizId, student: profileID});
        res.status(200).json(submission);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    } 
};

const getAllSubmission = async (req, res) => {
    try {
        const quizId = req.params.quizId;
        const submissions = await Quiz.findById(quizId).select('submissions').populate('submissions');
        res.status(200).json(submissions);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    } 
};

const gradeSubmission = async (req, res) => {
    try {
        const {submissionId, quizId} = req.params;
        const submission = await QuizSubmission.findById(submissionId);
        const quiz = await Quiz.findById(quizId);
        var count = 0;
        for (let i = 0; i < 5; i++) {
            if (quiz.questions[i].correctAns === submission.answers[i]) {
                count++;
            };
        };
        await QuizSubmission.findByIdAndUpdate(submissionId, {grade: count});
        res.status(200).json(
            {message: "quiz graded!"}
        );
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    } 
}



module.exports = {
    createQuiz,
    sessionQuizes,
    getSubmission,
    getAllSubmission,
    gradeSubmission,
    getQuiz
};