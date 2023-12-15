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
    required: true
  },
  educationalCredentials: {
    type: [String],
    required: true,
  },
  subjectsTaught: {
    type: [String],
    required: true
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
});

module.exports = mongoose.model('Teacher', teacherSchema);