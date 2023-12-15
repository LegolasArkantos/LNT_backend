const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Teacher', 'Student'],
        required: true
    },
    profileID: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'role'
    }
});

module.exports = mongoose.model('User', userSchema);