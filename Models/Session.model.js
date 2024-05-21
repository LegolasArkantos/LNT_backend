const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({

    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true,
    },

    teacherName:{type: String,
        required: true,
    },

    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],

    startTime: {type: String,
        required: true,},

    endTime: {type: String,
        required: true,},
    
    day: {
        type: String, 
        required: true,
    },

    status: {
        type: String,
        enum: ['scheduled', 'completed', 'canceled', 'In Review']
    },

    paymentStatus: {
        type: String,
        enum: ['paid', 'pending']
    },

    subject:{type: String,
              required: true,},

    sessionPrice: {type: String,
        required: true,},

    assignment: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
    }],
    quiz: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    }],
    sessionStarted: {
        type: Boolean,
        default: false
    },
    sessionDescription: {
        type: String,
        required: true
    },
    sessionCounter: {
        currentCount: {
            type: Number,
            default: 0
        },
        sessionCount: {
            type: Number,
            required: true
        }
    }

});

module.exports = mongoose.model('Session', sessionSchema);