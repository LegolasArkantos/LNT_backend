const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({

    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true,
    },
    
    students: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },

    studentName: {type: String,
        required: true,},
    
    feedback:{String},

    

});

module.exports = mongoose.model('Submission', submissionSchema);