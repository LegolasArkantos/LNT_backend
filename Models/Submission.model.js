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
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
    },

    studentName: {
        type: String,
        required: true,
    },

    files: [
        {
            fileName: {
                type: String,
                required: true,
            },
            fileUrl: {
                type: String,
                required: true,
            }
        }
    ],
    
    feedback: {
        type: String,
    },

    grade: {
        type: Number,
    }
});

module.exports = mongoose.model('Submission', submissionSchema);
