const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatRoomSchema = new Schema({
  participants: [
    {
      participant: {
        type: Schema.Types.ObjectId,
        refPath: "role",
        required: true,
      },
      role: {
        type: String,
        enum: ["Teacher", "Student"],
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      profilePicture: {
        type: String,
        
      },
    },
  ],
  disabled: {
    type: Boolean,
    default: false,
  },
  messages: [
    {
      user: {
        ID: {
          type: Schema.Types.ObjectId,
          refPath: "role",
          required: true,
        },
        role: {
          type: String,
          enum: ["Teacher", "Student"],
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
      },
      message: {
        type: String,
        required: true,
      },
      timestamp: {
        type: String,
        required: true
      },
    },
  ],
});

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
module.exports = ChatRoom;
