const mongoose = require("mongoose");

const reviewDataSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        reqired: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
    }],
    reviewWeightages: [{
        averageMark: {
            type: Number,
            default: 0
        },
        rating: {
            type: Number,
            default: 0
        }
    }],
});

module.exports = mongoose.model('ReviewData', reviewDataSchema);