const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
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
    required: true,
  },
  educationalCredential: {
    type: String,
    required: true,
  },
  subjectsTaught: {
    type: [String],
    required: true
  },
  notificationsID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notification",
    require: true,
  },
  rating: {
    type: String,
    default: "0"
  },
  availableTimeSlots: {
    type: [String],
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
}],
chatRooms: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'ChatRoom'
}],
polls: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Poll'
}],

notes: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Note'
}],

isApproved: {
  type: Boolean,
  default: false, 
},

personality: [Number],

careerCounselling: {
  type : Boolean,
  default: false,
},

aboutMe: {
  type: String,
},

credentialFiles: [
  {
      fileName: {
          type: String,
          required: true,
      },
      fileUrl: {
          type: String,
          required: true,
      }
  }
],

});

module.exports = mongoose.model('Teacher', teacherSchema);