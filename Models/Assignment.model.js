const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    startTime: {
        type: String,
        required: true,
    },

    endTime: {
        type: String,
        required: true,
    },
    
    description: {
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

    marks: {
        type: String,
        required: true,
    },
    
    submissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission',
        required: true,
    }],
});

module.exports = mongoose.model('Assignment', assignmentSchema);

