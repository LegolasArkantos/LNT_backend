const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        required: true
    },
    educationalLevel: {
        type: String,
        required: true,
    },
    // subjectsOfInterest: [String],
    teachers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
    }],
    sessions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session'
    }],
});

module.exports = mongoose.model('Student', studentSchema);