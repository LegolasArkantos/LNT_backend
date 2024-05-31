const Quiz = require('../Models/Quiz.model');
const Session = require('../Models/Session.model');
const QuizSubmission = require('../Models/QuizSubmission.model');
const mammoth = require('mammoth');
const Notifications = require('../Models/Notification.model');

const createQuiz = async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        
        const quiz = await Quiz.create({
            title: req.body.title,
            marks: req.body.marks,
            time: req.body.time,
            questions: req.body.questions
        });
        const session = await Session.findById(sessionId).populate('students');;
        session.quiz.push(quiz._id);
        for (const student of session.students) {
            const notification = await Notifications.findById(student.notificationsID);
            notification.notifications.push({title: session.subject + ": New Quiz", timestamp: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes()});
            await notification.save();
        }
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
        const submissions = await Quiz.findById(quizId).select('submissions')
        .populate({
            path: 'submissions',
            populate: {
                path: 'student' 
            }
        });
        
        res.status(200).json(submissions.submissions);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    } 
};

const uploadQuestionsFromFile = (req, res) => {
    try {
        const file = req.file;
        
        if (file) {
            mammoth.extractRawText({ buffer: file.buffer })
            .then((result) => {
                
                const text = result.value;
                const lines = text.split('\n');
                var questions = []
                var newQuestion = {}
                var nextQuestion = true;
                lines.forEach((line) => {
                    if (nextQuestion) {
                        newQuestion = {
                            question: '',
                            options: [],
                            correctAns: ''
                        };
                    }
                    if (line.endsWith('?')) {
                        nextQuestion = false;
                        newQuestion.question = line.substring(3);
                    }
                    if (line.startsWith('a') || line.startsWith('b') || line.startsWith('c') || line.startsWith('d')) {
                        newQuestion.options.push(line.substring(3).trim()); // Extract optionText and trim whitespace
                    }
                    if (line.startsWith('Answer:')) {
                        newQuestion.correctAns = line.substring(8).trim(); // Extract correctAns and trim whitespace
                        questions.push(newQuestion);
                        nextQuestion = true;
                    }
                });
                res.status(200).json(questions);
            });
        }
        else {
            res.status(500).json({ message: 'Internal Server Error, file not read!' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


// const gradeSubmission = async (req, res) => {
//     try {
//         const {submissionId, quizId} = req.params;
//         const submission = await QuizSubmission.findById(submissionId);
//         const quiz = await Quiz.findById(quizId);
//         var count = 0;
//         for (let i = 0; i < 5; i++) {
//             if (quiz.questions[i].correctAns === submission.answers[i]) {
//                 count++;
//             };
//         };
//         await QuizSubmission.findByIdAndUpdate(submissionId, {grade: count});
//         res.status(200).json(
//             {message: "quiz graded!"}
//         );
//     }
//     catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     } 
// }

const submitQuiz = async (req, res) => {
    const student = req.user.profileID;
    try {
        const quizId = req.params.quizId;
        const { answers } = req.body;

        const quiz = await Quiz.findById(quizId);
        
        const quizSubmission = await QuizSubmission.create({
            student,
            answers,
        });

        var count = 0
        for (let i = 0; i < quiz.questions.length; i++) {
            if (quiz.questions[i].correctAns === quizSubmission.answers[i]) {
                count++;
            };
        };
        quizSubmission.marks = count;
        await quizSubmission.save();
        quiz.submissions.push(quizSubmission._id)
        await quiz.save();
        res.status(200).json({ message: 'Quiz submitted successfully.' });
    } catch (error) {
        // Respond with an error if something goes wrong
        console.log(error)
        res.status(500).json({ error });
    }
}

const getMySessionQuizSubmissions = async (req, res) => {

    try {
        const sessionId = req.params.sessionId;
        const profileID = req.user.profileID;

        const quizes = await Session.findById(sessionId)
        .select('quiz')
        .populate({
            path: 'quiz',
            populate: {
                path: 'submissions' 
            }
        });
        var studentSubmissions = [];

        for (const quiz of quizes.quiz) {
            for (const submission of quiz.submissions) {
                if (submission.student == profileID) {
                    studentSubmissions.push(submission);
                }
            }
        }
        res.status(200).json(studentSubmissions);

    }
    catch (error) {
        console.log(error)
    }
}



module.exports = {
    createQuiz,
    sessionQuizes,
    getSubmission,
    getAllSubmission,
    getQuiz,
    submitQuiz,
    getMySessionQuizSubmissions,
    uploadQuestionsFromFile
};