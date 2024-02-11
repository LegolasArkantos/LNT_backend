const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pollsSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    options: [{
        option: {
            type: String,
            required: true
        },
        count: {
            type: Number,
            default: 0
        },
        percentage: {
            type: Number,
            default: 0
        }
    }],
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', 
    }]
});

const Poll = mongoose.model("Poll", pollsSchema);
module.exports = Poll;