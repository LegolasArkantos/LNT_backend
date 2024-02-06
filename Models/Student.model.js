const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
  },
  educationalLevel: {
    type: String,
    required: true,
  },
  // subjectsOfInterest: [String],
  teachers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
  ],
  sessions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },
  ],
  chatRooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
    },
  ],
  inReview: {
    type: Boolean,
  },
  personality: [Number],
  aboutMe: {
    type: String,
  },
});

module.exports = mongoose.model("Student", studentSchema);
