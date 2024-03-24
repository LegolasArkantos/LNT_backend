const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  
  sessions: [{
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    assignments: [{
      assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
      },
      title: {
        type: String,
        required: true
      },
      total: {
        type: Number,
        required: true
      },
      grades: [{
        type: Number,
        required: true
      }]
    }]
  }]
});

module.exports = mongoose.model('Progress', progressSchema);
