const mongoose = require('mongoose')
const Schema = mongoose.Schema

const chatRoomSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: ["Teacher", "Student"],
        required: true
    }],
    disabled: {
        type: Boolean,
        default: false
    },
    messages: [{
        userID: { 
            type: Schema.Types.ObjectId, 
            ref: ["Teacher", "Student"],
            required: true 
        },
        message: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
})

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema)
module.exports = ChatRoom