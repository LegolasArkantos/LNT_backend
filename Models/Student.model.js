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
    required: true,
  },
  educationalLevel: {
    type: String,
    required: true,
  },
  notificationsID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notification",
    require: true,
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
  personality: [Number],
  aboutMe: {
    type: String,
  },

  careerteacher: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeacherCareer",
    },
  ],
});

module.exports = mongoose.model("Student", studentSchema);
