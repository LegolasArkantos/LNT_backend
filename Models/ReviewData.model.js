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
        averageMark: Number,
        rating: Number
    }],
});

module.exports = mongoose.model('ReviewData', reviewDataSchema);