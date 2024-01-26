const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({

    title:{String},

    startTime: {type: String,
        required: true,},

    endTime: {type: String,
        required: true,},
    
    discription:{String},

    file:{String},

    marks:{String},
    
    submissions: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission',
        required: true,
    },

});

module.exports = mongoose.model('Assignment', assignmentSchema);