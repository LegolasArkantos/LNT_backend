const mongoose = require('mongoose');

const teacherCareerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  profilePic: {
    type: String, 
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
   },
  description: {
    type: String,
    required: true
  },
  timing: {
    type: String,
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
  counsellingSessionStarted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('TeacherCareer', teacherCareerSchema);
