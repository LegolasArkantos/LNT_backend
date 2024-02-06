const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        
    },
    
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },

    studentName: {
        type: String,
        required: true,
    },
    
    feedback: {
        type: String,
    },

    grade: {
        type: String,
    }
});

module.exports = mongoose.model('Submission', submissionSchema);
