const mongoose = require('mongoose');

const quizSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    marks: {
        type: String,
        required: true
    },
    time: {
        type: Number,
        required: true
    },
    questions: [{
        question: {
            type: String,
            required: true
        },
        options: [String],
        correctAns: {
            type: String,
            required: true
        }
    }],

    submissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuizSubmission',
    }],
});

module.exports = mongoose.model('Quiz', quizSchema);