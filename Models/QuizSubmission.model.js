const mongoose = require('mongoose');

const quizSubmissionSchema = new mongoose.Schema({    
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
    },

    answers: [String],

    studentName: {
        type: String,
        required: true,
    },

    grade: {
        type: Number,
    }
});

module.exports = mongoose.model('QuizSubmission', quizSubmissionSchema);
